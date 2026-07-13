import { createHash, randomBytes } from "crypto";
import { prisma } from "@neorelis/db";

type UserRole = "ADMIN" | "MANAGER" | "REVIEWER" | "VALIDATOR" | "VIEWER";

const DEFAULT_EXPIRY_SECONDS = 24 * 60 * 60; // 24h

export function getInvitationExpirySeconds(): number {
  const raw = process.env.INVITATION_EXPIRY_SECONDS;
  if (!raw) return DEFAULT_EXPIRY_SECONDS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_EXPIRY_SECONDS;
  return parsed;
}

function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type IssueInvitationResult =
  | {
      ok: true;
      invitation: {
        id: string;
        projectId: string;
        email: string;
        role: UserRole;
        status: string;
        expiresAt: Date;
      };
      rawToken: string;
      reused: boolean;
    }
  | { ok: false; reason: "PROJECT_NOT_FOUND" | "ALREADY_MEMBER" };

export async function issueInvitation(params: {
  projectId: string;
  email: string;
  role: UserRole;
  invitedById: string;
}): Promise<IssueInvitationResult> {
  const email = normalizeEmail(params.email);
  if (!email || !email.includes("@")) {
    return { ok: false, reason: "PROJECT_NOT_FOUND" };
  }

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    select: { id: true },
  });
  if (!project) return { ok: false, reason: "PROJECT_NOT_FOUND" };

  const existingUser = await prisma.user.findFirst({
    where: { email, active: 1, isEmailVerified: true },
    select: { id: true },
  });
  if (existingUser) {
    const existingMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: existingUser.id,
          projectId: params.projectId,
        },
      },
      select: { id: true, active: true },
    });
    if (existingMembership && existingMembership.active === 1) {
      return { ok: false, reason: "ALREADY_MEMBER" };
    }
  }

  return prisma.$transaction(async (tx) => {
    const pending = await tx.projectInvitation.findFirst({
      where: {
        projectId: params.projectId,
        email,
        status: "PENDING",
      },
    });

    const { raw, hash } = generateToken();
    const expiresAt = new Date(
      Date.now() + getInvitationExpirySeconds() * 1000,
    );

    if (pending) {
      const updated = await tx.projectInvitation.update({
        where: { id: pending.id },
        data: {
          tokenHash: hash,
          expiresAt,
          role: params.role,
          invitedById: params.invitedById,
        },
        select: {
          id: true,
          projectId: true,
          email: true,
          role: true,
          status: true,
          expiresAt: true,
        },
      });
      return {
        ok: true as const,
        invitation: updated,
        rawToken: raw,
        reused: true,
      };
    }

    const created = await tx.projectInvitation.create({
      data: {
        projectId: params.projectId,
        email,
        role: params.role,
        invitedById: params.invitedById,
        tokenHash: hash,
        status: "PENDING",
        expiresAt,
      },
      select: {
        id: true,
        projectId: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
      },
    });
    return {
      ok: true as const,
      invitation: created,
      rawToken: raw,
      reused: false,
    };
  });
}

export type PeekInvitationResult =
  | {
      ok: true;
      invitation: {
        id: string;
        email: string;
        role: UserRole;
        status: string;
        expiresAt: Date;
        project: { id: string; title: string; label: string };
        invitedBy: { id: string; name: string; username: string };
      };
    }
  | { ok: false; reason: "NOT_FOUND" | "EXPIRED" | "REVOKED" | "ALREADY_USED" };

export async function peekInvitation(
  rawToken: string,
): Promise<PeekInvitationResult> {
  if (!rawToken) return { ok: false, reason: "NOT_FOUND" };
  const tokenHash = hashToken(rawToken);

  const record = await prisma.projectInvitation.findUnique({
    where: { tokenHash },
    include: {
      project: { select: { id: true, title: true, label: true } },
      invitedBy: { select: { id: true, name: true, username: true } },
    },
  });

  if (!record) return { ok: false, reason: "NOT_FOUND" };

  if (record.status === "ACCEPTED" || record.status === "DECLINED") {
    return { ok: false, reason: "ALREADY_USED" };
  }
  if (record.status === "REVOKED") return { ok: false, reason: "REVOKED" };
  if (record.status === "EXPIRED" || record.expiresAt.getTime() < Date.now()) {
    // Lazily mark as expired (best effort, do not fail the peek)
    await prisma.projectInvitation
      .updateMany({
        where: { id: record.id, status: "PENDING" },
        data: { status: "EXPIRED" },
      })
      .catch(() => undefined);
    return { ok: false, reason: "EXPIRED" };
  }

  return {
    ok: true,
    invitation: {
      id: record.id,
      email: record.email,
      role: record.role,
      status: record.status,
      expiresAt: record.expiresAt,
      project: record.project,
      invitedBy: record.invitedBy,
    },
  };
}

export type ConsumeInvitationResult =
  | {
      ok: true;
      invitation: {
        id: string;
        projectId: string;
        email: string;
        role: UserRole;
      };
      project: { id: string; title: string; label: string };
      inviter: { id: string; name: string; username: string };
    }
  | {
      ok: false;
      reason:
        | "NOT_FOUND"
        | "EXPIRED"
        | "REVOKED"
        | "ALREADY_USED"
        | "EMAIL_MISMATCH";
      expectedEmail?: string;
    };

export async function consumeInvitation(params: {
  rawToken: string;
  acceptingUserId: string;
  acceptingUserEmail: string | null;
}): Promise<ConsumeInvitationResult> {
  if (!params.rawToken) return { ok: false, reason: "NOT_FOUND" };
  const tokenHash = hashToken(params.rawToken);

  const record = await prisma.projectInvitation.findUnique({
    where: { tokenHash },
    include: {
      project: { select: { id: true, title: true, label: true } },
      invitedBy: { select: { id: true, name: true, username: true } },
    },
  });
  if (!record) return { ok: false, reason: "NOT_FOUND" };

  if (record.status === "ACCEPTED" || record.status === "DECLINED") {
    return { ok: false, reason: "ALREADY_USED" };
  }
  if (record.status === "REVOKED") return { ok: false, reason: "REVOKED" };
  if (record.status === "EXPIRED" || record.expiresAt.getTime() < Date.now()) {
    await prisma.projectInvitation
      .updateMany({
        where: { id: record.id, status: "PENDING" },
        data: { status: "EXPIRED" },
      })
      .catch(() => undefined);
    return { ok: false, reason: "EXPIRED" };
  }

  if (!params.acceptingUserEmail) {
    return {
      ok: false,
      reason: "EMAIL_MISMATCH",
      expectedEmail: record.email,
    };
  }
  if (normalizeEmail(params.acceptingUserEmail) !== record.email) {
    return {
      ok: false,
      reason: "EMAIL_MISMATCH",
      expectedEmail: record.email,
    };
  }

  // Atomic: mark invitation as ACCEPTED, no double-accept possible.
  const updated = await prisma.projectInvitation.updateMany({
    where: { id: record.id, status: "PENDING" },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
      acceptedById: params.acceptingUserId,
    },
  });
  if (updated.count === 0) {
    return { ok: false, reason: "ALREADY_USED" };
  }

  return {
    ok: true,
    invitation: {
      id: record.id,
      projectId: record.projectId,
      email: record.email,
      role: record.role,
    },
    project: record.project,
    inviter: record.invitedBy,
  };
}

export type DeclineByTokenResult =
  | { ok: true; invitation: { id: string; projectId: string; email: string } }
  | {
      ok: false;
      reason: "NOT_FOUND" | "ALREADY_USED" | "REVOKED" | "EMAIL_MISMATCH";
    };

export async function declineInvitationByToken(params: {
  rawToken: string;
  decliningUserId: string;
  decliningUserEmail: string | null;
}): Promise<DeclineByTokenResult> {
  if (!params.rawToken) return { ok: false, reason: "NOT_FOUND" };
  const tokenHash = hashToken(params.rawToken);

  const record = await prisma.projectInvitation.findUnique({
    where: { tokenHash },
  });
  if (!record) return { ok: false, reason: "NOT_FOUND" };
  if (record.status === "ACCEPTED" || record.status === "DECLINED") {
    return { ok: false, reason: "ALREADY_USED" };
  }
  if (record.status === "REVOKED") return { ok: false, reason: "REVOKED" };

  if (
    !params.decliningUserEmail ||
    normalizeEmail(params.decliningUserEmail) !== record.email
  ) {
    return { ok: false, reason: "EMAIL_MISMATCH" };
  }

  const updated = await prisma.projectInvitation.updateMany({
    where: { id: record.id, status: "PENDING" },
    data: { status: "DECLINED", declinedAt: new Date() },
  });
  if (updated.count === 0) {
    return { ok: false, reason: "ALREADY_USED" };
  }

  return {
    ok: true,
    invitation: {
      id: record.id,
      projectId: record.projectId,
      email: record.email,
    },
  };
}

export type DeclineByIdResult =
  | { ok: true; invitation: { id: string; projectId: string } }
  | { ok: false; reason: "NOT_FOUND" | "ALREADY_USED" | "NOT_RECIPIENT" };

export async function declineInvitationById(params: {
  invitationId: string;
  projectId: string;
  userId: string;
  userEmail: string | null;
}): Promise<DeclineByIdResult> {
  const record = await prisma.projectInvitation.findUnique({
    where: { id: params.invitationId },
  });
  if (!record || record.projectId !== params.projectId) {
    return { ok: false, reason: "NOT_FOUND" };
  }
  if (record.status === "ACCEPTED" || record.status === "DECLINED") {
    return { ok: false, reason: "ALREADY_USED" };
  }
  if (!params.userEmail || normalizeEmail(params.userEmail) !== record.email) {
    return { ok: false, reason: "NOT_RECIPIENT" };
  }

  const updated = await prisma.projectInvitation.updateMany({
    where: { id: record.id, status: "PENDING" },
    data: { status: "DECLINED", declinedAt: new Date() },
  });
  if (updated.count === 0) {
    return { ok: false, reason: "ALREADY_USED" };
  }
  return {
    ok: true,
    invitation: { id: record.id, projectId: record.projectId },
  };
}

export type RevokeResult =
  | { ok: true; invitation: { id: string } }
  | { ok: false; reason: "NOT_FOUND" | "ALREADY_USED" };

export async function revokeInvitation(params: {
  invitationId: string;
  projectId: string;
}): Promise<RevokeResult> {
  const record = await prisma.projectInvitation.findUnique({
    where: { id: params.invitationId },
  });
  if (!record || record.projectId !== params.projectId) {
    return { ok: false, reason: "NOT_FOUND" };
  }
  if (record.status === "ACCEPTED" || record.status === "DECLINED") {
    return { ok: false, reason: "ALREADY_USED" };
  }

  const updated = await prisma.projectInvitation.updateMany({
    where: { id: record.id, status: "PENDING" },
    data: { status: "REVOKED" },
  });
  if (updated.count === 0) {
    return { ok: false, reason: "ALREADY_USED" };
  }
  return { ok: true, invitation: { id: record.id } };
}

export type ResendResult =
  | {
      ok: true;
      invitation: {
        id: string;
        projectId: string;
        email: string;
        role: UserRole;
        status: string;
        expiresAt: Date;
      };
      rawToken: string;
    }
  | { ok: false; reason: "NOT_FOUND" | "ALREADY_USED" };

export async function resendInvitation(params: {
  invitationId: string;
  projectId: string;
}): Promise<ResendResult> {
  const record = await prisma.projectInvitation.findUnique({
    where: { id: params.invitationId },
  });
  if (!record || record.projectId !== params.projectId) {
    return { ok: false, reason: "NOT_FOUND" };
  }
  if (record.status === "ACCEPTED" || record.status === "DECLINED") {
    return { ok: false, reason: "ALREADY_USED" };
  }

  const { raw, hash } = generateToken();
  const expiresAt = new Date(Date.now() + getInvitationExpirySeconds() * 1000);

  const updated = await prisma.projectInvitation.updateMany({
    where: { id: record.id, status: "PENDING" },
    data: { tokenHash: hash, expiresAt },
  });
  if (updated.count === 0) {
    return { ok: false, reason: "ALREADY_USED" };
  }
  return {
    ok: true,
    invitation: {
      id: record.id,
      projectId: record.projectId,
      email: record.email,
      role: record.role,
      status: "PENDING",
      expiresAt,
    },
    rawToken: raw,
  };
}

export async function listInvitationsForProject(projectId: string) {
  return prisma.projectInvitation.findMany({
    where: { projectId },
    include: {
      invitedBy: { select: { id: true, name: true, username: true } },
      acceptedBy: { select: { id: true, name: true, username: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function findExistingPendingInvitation(
  projectId: string,
  email: string,
) {
  return prisma.projectInvitation.findFirst({
    where: {
      projectId,
      email: normalizeEmail(email),
      status: "PENDING",
    },
  });
}
