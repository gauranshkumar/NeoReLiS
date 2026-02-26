-- CreateTable
CREATE TABLE "neorelis_default"."protocol_drafts" (
    "draft_id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "draft_name" VARCHAR(200) NOT NULL DEFAULT 'Untitled Draft',
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "form_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocol_drafts_pkey" PRIMARY KEY ("draft_id")
);

-- CreateIndex
CREATE INDEX "protocol_drafts_creator_id_idx" ON "neorelis_default"."protocol_drafts"("creator_id");

-- AddForeignKey
ALTER TABLE "neorelis_default"."protocol_drafts" ADD CONSTRAINT "protocol_drafts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "neorelis_default"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
