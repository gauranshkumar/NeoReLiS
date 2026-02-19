-- AlterTable
ALTER TABLE "admin_config" ALTER COLUMN "config_user" DROP DEFAULT;

-- AlterTable
ALTER TABLE "userproject" ALTER COLUMN "added_by" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_by" DROP DEFAULT;
