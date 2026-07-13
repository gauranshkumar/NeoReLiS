import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import {
  requireManagerOrAdmin,
  requireProjectAccess,
} from "../middleware/project-access";
import type { AuthContext } from "../middleware/auth";
import * as invitationService from "../services/invitation.service";
import * as projectService from "../services/project.service";
import * as userService from "../services/user.service";
import * as notificationService from "../services/notification.service";
import * as emailService from "../services/email.service";
import * as projectView from "../views/project.view";
import { prisma } from "@neorelis/db";

const projectInvitations = new Hono<{
  Variables: { user?: AuthContext };
}>();

const inviteSchema = z.object({
  email: z.string().email().max(100),
  role: z
    .enum(["ADMIN", "MANAGER", "REVIEWER", "VALIDATOR", "VIEWER"])
    .default("REVIEWER"),
});

async function dispatchInvitationEmail(opts: {
  to: string;
  inviterName: string;
  projectTitle: string;
  role: string;
  rawToken: string;
}) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const acceptUrl = `${frontendUrl}/dashboard/invitations/accept?token=${encodeURIComponent(
    opts.rawToken,
  )}`;
  const expiresInSeconds = invitationService.getInvitationExpirySeconds();

  await emailService
    .sendProjectInvitationEmail({
      to: opts.to,
      inviterName: opts.inviterName,
      projectTitle: opts.projectTitle,
      role: opts.role,
      acceptUrl,
      expiresInSeconds,
    })
    .catch((e) => console.error("Invitation email error:", e));
}

async function maybeNotifyExistingUser(opts: {
  email: string;
  inviterId: string;
  inviterName: string;
  projectId: string;
  projectTitle: string;
  role: string;
  invitationId: string;
  acceptUrl: string;
}) {
  const existing = await prisma.user.findFirst({
    where: {
      email: opts.email.toLowerCase(),
      active: 1,
      isEmailVerified: true,
    },
    select: { id: true },
  });
  if (!existing || existing.id === opts.inviterId) return;

  await notificationService
    .createNotification({
      userId: existing.id,
      type: "PROJECT_INVITATION_RECEIVED",
      title: "Project invitation",
      message: `${opts.inviterName} invited you to "${opts.projectTitle}" as ${opts.role}`,
      data: {
        invitationId: opts.invitationId,
        projectId: opts.projectId,
        projectTitle: opts.projectTitle,
        role: opts.role,
        inviterName: opts.inviterName,
        acceptUrl: opts.acceptUrl,
      },
    })
    .catch((e) => console.error("Invitation notification error:", e));
}

// GET /api/v1/projects/:id/invitations
projectInvitations.get(
  "/:id/invitations",
  authMiddleware,
  requireProjectAccess(),
  async (c) => {
    const projectId = c.req.param("id")!;
    try {
      const invitations =
        await invitationService.listInvitationsForProject(projectId);
      return c.json({
        invitations: invitations.map((inv) =>
          projectView.projectInvitation(inv),
        ),
      });
    } catch (error) {
      console.error("List invitations error:", error);
      return c.json(
        { code: "INTERNAL_ERROR", message: "Failed to list invitations" },
        500,
      );
    }
  },
);

// POST /api/v1/projects/:id/invitations
projectInvitations.post(
  "/:id/invitations",
  authMiddleware,
  requireManagerOrAdmin(),
  zValidator("json", inviteSchema),
  async (c) => {
    const projectId = c.req.param("id")!;
    const authContext = c.get("user") as AuthContext;
    const body = c.req.valid("json");

    try {
      const result = await invitationService.issueInvitation({
        projectId,
        email: body.email,
        role: body.role,
        invitedById: authContext.userId,
      });

      if (!result.ok) {
        if (result.reason === "ALREADY_MEMBER") {
          return c.json(
            {
              code: "ALREADY_MEMBER",
              message: "This user is already a member of the project",
            },
            409,
          );
        }
        return c.json({ code: "NOT_FOUND", message: "Project not found" }, 404);
      }

      const [project, inviter] = await Promise.all([
        projectService.findProjectById(projectId),
        userService.findUserById(authContext.userId),
      ]);
      const projectTitle = project?.title ?? "a project";
      const inviterName = inviter?.name ?? "Someone";

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const acceptUrl = `${frontendUrl}/dashboard/invitations/accept?token=${encodeURIComponent(
        result.rawToken,
      )}`;

      // Fire-and-forget side effects
      void dispatchInvitationEmail({
        to: result.invitation.email,
        inviterName,
        projectTitle,
        role: result.invitation.role,
        rawToken: result.rawToken,
      });
      void maybeNotifyExistingUser({
        email: result.invitation.email,
        inviterId: authContext.userId,
        inviterName,
        projectId,
        projectTitle,
        role: result.invitation.role,
        invitationId: result.invitation.id,
        acceptUrl,
      });

      return c.json(
        { invitation: projectView.projectInvitation(result.invitation) },
        result.reused ? 200 : 201,
      );
    } catch (error) {
      console.error("Create invitation error:", error);
      return c.json(
        { code: "INTERNAL_ERROR", message: "Failed to create invitation" },
        500,
      );
    }
  },
);

// POST /api/v1/projects/:id/invitations/:invitationId/resend
projectInvitations.post(
  "/:id/invitations/:invitationId/resend",
  authMiddleware,
  requireManagerOrAdmin(),
  async (c) => {
    const projectId = c.req.param("id")!;
    const invitationId = c.req.param("invitationId")!;
    const authContext = c.get("user") as AuthContext;

    try {
      const result = await invitationService.resendInvitation({
        invitationId,
        projectId,
      });
      if (!result.ok) {
        return c.json(
          {
            code:
              result.reason === "ALREADY_USED" ? "ALREADY_USED" : "NOT_FOUND",
            message:
              result.reason === "ALREADY_USED"
                ? "Invitation has already been used"
                : "Invitation not found",
          },
          result.reason === "ALREADY_USED" ? 409 : 404,
        );
      }

      const [project, inviter] = await Promise.all([
        projectService.findProjectById(projectId),
        userService.findUserById(authContext.userId),
      ]);
      const projectTitle = project?.title ?? "a project";
      const inviterName = inviter?.name ?? "Someone";

      void dispatchInvitationEmail({
        to: result.invitation.email,
        inviterName,
        projectTitle,
        role: result.invitation.role,
        rawToken: result.rawToken,
      });

      return c.json({
        invitation: projectView.projectInvitation(result.invitation),
      });
    } catch (error) {
      console.error("Resend invitation error:", error);
      return c.json(
        { code: "INTERNAL_ERROR", message: "Failed to resend invitation" },
        500,
      );
    }
  },
);

// DELETE /api/v1/projects/:id/invitations/:invitationId
projectInvitations.delete(
  "/:id/invitations/:invitationId",
  authMiddleware,
  requireManagerOrAdmin(),
  async (c) => {
    const projectId = c.req.param("id")!;
    const invitationId = c.req.param("invitationId")!;

    try {
      const result = await invitationService.revokeInvitation({
        invitationId,
        projectId,
      });
      if (!result.ok) {
        return c.json(
          {
            code:
              result.reason === "ALREADY_USED" ? "ALREADY_USED" : "NOT_FOUND",
            message:
              result.reason === "ALREADY_USED"
                ? "Invitation has already been used"
                : "Invitation not found",
          },
          result.reason === "ALREADY_USED" ? 409 : 404,
        );
      }
      return c.json({ ok: true });
    } catch (error) {
      console.error("Revoke invitation error:", error);
      return c.json(
        { code: "INTERNAL_ERROR", message: "Failed to revoke invitation" },
        500,
      );
    }
  },
);

// POST /api/v1/projects/:id/invitations/:invitationId/decline  (invitee-side, by id)
projectInvitations.post(
  "/:id/invitations/:invitationId/decline",
  authMiddleware,
  async (c) => {
    const projectId = c.req.param("id")!;
    const invitationId = c.req.param("invitationId")!;
    const authContext = c.get("user") as AuthContext;

    try {
      const user = await userService.findUserById(authContext.userId);
      const result = await invitationService.declineInvitationById({
        invitationId,
        projectId,
        userId: authContext.userId,
        userEmail: user?.email ?? null,
      });
      if (!result.ok) {
        const status =
          result.reason === "NOT_FOUND"
            ? 404
            : result.reason === "ALREADY_USED"
              ? 409
              : 403;
        return c.json(
          {
            code: result.reason,
            message:
              result.reason === "NOT_FOUND"
                ? "Invitation not found"
                : result.reason === "ALREADY_USED"
                  ? "Invitation has already been used"
                  : "This invitation is addressed to a different email",
          },
          status,
        );
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

export default projectInvitations;
