-- CreateTable
CREATE TABLE "neorelis_default"."email_verification_codes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "code_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_codes_user_id_key" ON "neorelis_default"."email_verification_codes"("user_id");

-- CreateIndex
CREATE INDEX "email_verification_codes_expires_at_idx" ON "neorelis_default"."email_verification_codes"("expires_at");

-- AddForeignKey
ALTER TABLE "neorelis_default"."email_verification_codes" ADD CONSTRAINT "email_verification_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "neorelis_default"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
