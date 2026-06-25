-- CreateEnum
CREATE TYPE "neorelis_default"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "neorelis_default"."NotificationType" ADD VALUE 'PROJECT_INVITATION_RECEIVED';
ALTER TYPE "neorelis_default"."NotificationType" ADD VALUE 'PROJECT_INVITATION_ACCEPTED';
ALTER TYPE "neorelis_default"."NotificationType" ADD VALUE 'PROJECT_INVITATION_DECLINED';

-- CreateTable
CREATE TABLE "neorelis_default"."project_invitations" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "role" "neorelis_default"."UserRole" NOT NULL DEFAULT 'REVIEWER',
    "invited_by" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "status" "neorelis_default"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "declined_at" TIMESTAMP(3),
    "accepted_by" UUID,

    CONSTRAINT "project_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_invitations_token_hash_key" ON "neorelis_default"."project_invitations"("token_hash");

-- CreateIndex
CREATE INDEX "project_invitations_email_idx" ON "neorelis_default"."project_invitations"("email");

-- CreateIndex
CREATE INDEX "project_invitations_project_id_status_idx" ON "neorelis_default"."project_invitations"("project_id", "status");

-- CreateIndex
CREATE INDEX "project_invitations_expires_at_idx" ON "neorelis_default"."project_invitations"("expires_at");

-- AddForeignKey
ALTER TABLE "neorelis_default"."project_invitations" ADD CONSTRAINT "project_invitations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "neorelis_default"."projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neorelis_default"."project_invitations" ADD CONSTRAINT "project_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "neorelis_default"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neorelis_default"."project_invitations" ADD CONSTRAINT "project_invitations_accepted_by_fkey" FOREIGN KEY ("accepted_by") REFERENCES "neorelis_default"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
