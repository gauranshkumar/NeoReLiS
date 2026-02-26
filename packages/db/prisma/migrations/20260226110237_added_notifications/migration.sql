-- CreateEnum
CREATE TYPE "neorelis_default"."NotificationType" AS ENUM ('PROJECT_MEMBER_ADDED', 'PROJECT_MEMBER_REMOVED', 'PROJECT_ROLE_CHANGED', 'SCREENING_ASSIGNED', 'GENERAL');

-- CreateTable
CREATE TABLE "neorelis_default"."notifications" (
    "notification_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "notification_type" "neorelis_default"."NotificationType" NOT NULL,
    "notification_title" VARCHAR(200) NOT NULL,
    "notification_message" VARCHAR(1000) NOT NULL,
    "notification_data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "neorelis_default"."notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "neorelis_default"."notifications"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "neorelis_default"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "neorelis_default"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
