-- AlterTable
ALTER TABLE "neorelis_default"."config" ADD COLUMN     "protocol_json" JSONB,
ADD COLUMN     "validation_assignment_mode" VARCHAR(10) NOT NULL DEFAULT 'Normal';

-- AlterTable
ALTER TABLE "neorelis_default"."screen_phase" ADD COLUMN     "phase_fields" JSONB;
