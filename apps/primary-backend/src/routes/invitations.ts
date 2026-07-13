import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import type { AuthContext } from "../middleware/auth";
import { prisma } from "@neorelis/db";
import * as invitationService from "../services/invitation.service";
import * as projectService from "../services/project.service";
import * as userService from "../services/user.service";
import * as notificationService from "../services/notification.service";
import * as projectView from "../views/project.view";

const invitations = new Hono<{
  Variables: { user?: AuthContext };
}>();

const tokenSchema = z.object({
  token: z.string().min(1).max(512),
});

const INVITATION_FAILURE_MESSAGES: Record<string, string> = {
  NOT_FOUND: "Invitation not found",
  EXPIRED: "This invitation has expired",
  REVOKED: "This invitation has been revoked",
  ALREADY_USED: "This invitation has already been used",
  EMAIL_MISMATCH: "This invitation is addressed to a different email",
};

function failureResponse(
  reason:
    | "NOT_FOUND"
    | "EXPIRED"
    | "REVOKED"
    | "ALREADY_USED"
    | "EMAIL_MISMATCH",
  extra?: { expectedEmail?: string },
) {
  return (c: Context) => {
    if (reason === "NOT_FOUND") {
      return c.json(
        {
          code: reason,
          message:
            INVITATION_FAILURE_MESSAGES[reason] ?? "Invitation is invalid",
        },
        404,
      );
    }
    if (reason === "EMAIL_MISMATCH") {
      return c.json(
        {
          code: reason,
          message:
            INVITATION_FAILURE_MESSAGES[reason] ?? "Invitation is invalid",
          ...(extra?.expectedEmail
            ? { expectedEmail: extra.expectedEmail }
            : {}),
        },
        403,
      );
    }
    // EXPIRED, REVOKED, ALREADY_USED
    return c.json(
      {
        code: reason,
        message: INVITATION_FAILURE_MESSAGES[reason] ?? "Invitation is invalid",
      },
      410,
    );
  };
}

// GET /api/v1/invitations/accept?token=…   (public preview, uses optionalAuth)
invitations.get("/accept", optionalAuthMiddleware, async (c) => {
  const token = c.req.query("token");
  if (!token) {
    return c.json({ code: "NOT_FOUND", message: "Invitation not found" }, 404);
  }

  const peek = await invitationService.peekInvitation(token);
  if (!peek.ok) {
    return failureResponse(peek.reason)(c);
  }

  const authContext = c.get("user") as AuthContext | undefined;
  const loggedInUserEmail = authContext?.email ?? null;
  const expectedEmail = peek.invitation.email;
  const emailMatches =
    !!loggedInUserEmail && loggedInUserEmail.toLowerCase() === expectedEmail;

  return c.json({
    invitation: {
      id: peek.invitation.id,
      email: peek.invitation.email,
      role: peek.invitation.role,
      status: peek.invitation.status,
      expiresAt: peek.invitation.expiresAt.toISOString(),
      project: peek.invitation.project,
      invitedBy: peek.invitation.invitedBy,
    },
    loggedIn: !!authContext,
    emailMatches,
  });
});

// POST /api/v1/invitations/accept   (auth required)
invitations.post(
  "/accept",
  authMiddleware,
  zValidator("json", tokenSchema),
  async (c) => {
    const authContext = c.get("user") as AuthContext;
    const { token } = c.req.valid("json");

    try {
      const user = await userService.findUserById(authContext.userId);
      const result = await invitationService.consumeInvitation({
        rawToken: token,
        acceptingUserId: authContext.userId,
        acceptingUserEmail: user?.email ?? null,
      });

      if (!result.ok) {
        return failureResponse(
          result.reason,
          result.reason === "EMAIL_MISMATCH"
            ? { expectedEmail: result.expectedEmail }
            : undefined,
        )(c);
      }

      // Create or reactivate the ProjectMember
      const existing = await projectService.findExistingMembership(
        result.invitation.projectId,
        authContext.userId,
      );
      let member;
      if (existing) {
        member = await projectService.reactivateProjectMember(
          existing.id,
          result.invitation.role,
          result.inviter.id,
        );
      } else {
        member = await projectService.addProjectMember({
          projectId: result.invitation.projectId,
          userId: authContext.userId,
          role: result.invitation.role,
          addedBy: result.inviter.id,
        });
      }

      // Fire-and-forget notifications
      notificationService
        .createNotification({
          userId: authContext.userId,
          type: "PROJECT_MEMBER_ADDED",
          title: "Added to project",
          message: `${result.inviter.name} added you to "${result.project.title}" as ${result.invitation.role}`,
          data: {
            projectId: result.project.id,
            role: result.invitation.role,
            addedBy: result.inviter.id,
            viaInvitation: true,
          },
        })
        .catch((e) => console.error("Notification error:", e));

      if (result.inviter.id !== authContext.userId) {
        notificationService
          .createNotification({
            userId: result.inviter.id,
            type: "PROJECT_INVITATION_ACCEPTED",
            title: "Invitation accepted",
            message: `${user?.name ?? "Someone"} accepted your invitation to "${result.project.title}"`,
            data: {
              projectId: result.project.id,
              invitationId: result.invitation.id,
              acceptedBy: { id: authContext.userId, name: user?.name ?? "" },
            },
          })
          .catch((e) => console.error("Notification error:", e));
      }

      return c.json({
        member: projectView.projectMember(member),
        project: result.project,
      });
    } catch (error) {
      console.error("Accept invitation error:", error);
      return c.json(
        { code: "INTERNAL_ERROR", message: "Failed to accept invitation" },
        500,
      );
    }
  },
);

// POST /api/v1/invitations/decline   (auth required, by token)
invitations.post(
  "/decline",
  authMiddleware,
  zValidator("json", tokenSchema),
  async (c) => {
    const authContext = c.get("user") as AuthContext;
    const { token } = c.req.valid("json");

    try {
      const user = await userService.findUserById(authContext.userId);
      const result = await invitationService.declineInvitationByToken({
        rawToken: token,
        decliningUserId: authContext.userId,
        decliningUserEmail: user?.email ?? null,
      });

      if (!result.ok) {
        return failureResponse(result.reason)(c);
      }

      // Notify inviter
      const inv = await prisma.projectInvitation.findUnique({
        where: { id: result.invitation.id },
        include: {
          project: { select: { id: true, title: true } },
        },
      });
      if (inv && inv.invitedById !== authContext.userId) {
        notificationService
          .createNotification({
            userId: inv.invitedById,
            type: "PROJECT_INVITATION_DECLINED",
            title: "Invitation declined",
            message: `${user?.name ?? "Someone"} declined your invitation to "${inv.project.title}"`,
            data: {
              projectId: inv.projectId,
              invitationId: inv.id,
            },
          })
          .catch((e) => console.error("Notification error:", e));
      }

      return c.json({ ok: true });
    } catch (error) {
      console.error("Decline invitation error:", error);
      return c.json(
        { code: "INTERNAL_ERROR", message: "Failed to decline invitation" },
        500,
      );
    }
  },
);

export default invitations;
