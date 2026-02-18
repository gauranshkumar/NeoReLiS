-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'REVIEWER', 'VALIDATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ScreeningStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'INCLUDED', 'EXCLUDED', 'IN_CONFLICT', 'RESOLVED_INCLUDED', 'RESOLVED_EXCLUDED');

-- CreateEnum
CREATE TYPE "ClassificationStatus" AS ENUM ('WAITING', 'TO_CLASSIFY', 'CLASSIFIED');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('INCLUDE', 'EXCLUDE', 'MAYBE');

-- CreateEnum
CREATE TYPE "ConflictType" AS ENUM ('INCLUDE_EXCLUDE', 'INCLUSION_CRITERIA', 'EXCLUSION_CRITERIA', 'ALL_CRITERIA');

-- CreateEnum
CREATE TYPE "ConflictResolution" AS ENUM ('UNANIMITY', 'MAJORITY');

-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'VALIDATED');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('UPLOADED', 'PARSING', 'VALIDATED', 'PERSISTED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('AUTH', 'PROJECT', 'MEMBERSHIP', 'SCREENING', 'EXTRACTION', 'IMPORT', 'EXPORT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "InfoType" AS ENUM ('HOME', 'FEATURES', 'HELP', 'REFERENCE');

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "user_name" VARCHAR(50) NOT NULL,
    "user_username" VARCHAR(20) NOT NULL,
    "user_mail" VARCHAR(100),
    "user_password" VARCHAR(255),
    "user_picture" BYTEA,
    "user_usergroup" UUID NOT NULL,
    "created_by" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    "creation_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_state" INTEGER NOT NULL DEFAULT 1,
    "user_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "usergroup" (
    "usergroup_id" UUID NOT NULL,
    "usergroup_name" VARCHAR(100) NOT NULL,
    "usergroup_description" VARCHAR(100),
    "usergroup_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "usergroup_pkey" PRIMARY KEY ("usergroup_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(50),
    "user_agent" VARCHAR(150),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "project_id" UUID NOT NULL,
    "project_label" VARCHAR(100) NOT NULL,
    "project_title" VARCHAR(250) NOT NULL,
    "project_description" VARCHAR(1000),
    "project_icon" BYTEA,
    "project_creator" UUID NOT NULL,
    "creation_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "project_status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "project_public" INTEGER NOT NULL DEFAULT 0,
    "project_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "userproject" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "user_role" "UserRole" NOT NULL DEFAULT 'REVIEWER',
    "added_by" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    "add_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userproject_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "userproject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "config_type" VARCHAR(100) NOT NULL DEFAULT 'default',
    "import_papers_on" INTEGER NOT NULL DEFAULT 1,
    "source_papers_on" INTEGER NOT NULL DEFAULT 0,
    "search_strategy_on" INTEGER NOT NULL DEFAULT 0,
    "assign_papers_on" INTEGER NOT NULL DEFAULT 1,
    "screening_reviewer_number" INTEGER NOT NULL DEFAULT 2,
    "screening_on" INTEGER NOT NULL DEFAULT 0,
    "screening_validation_on" INTEGER NOT NULL DEFAULT 1,
    "screening_result_on" INTEGER NOT NULL DEFAULT 1,
    "screening_conflict_type" "ConflictType" NOT NULL DEFAULT 'INCLUDE_EXCLUDE',
    "screening_screening_conflict_resolution" "ConflictResolution" NOT NULL DEFAULT 'UNANIMITY',
    "screening_status_to_validate" VARCHAR(50) NOT NULL DEFAULT 'Excluded',
    "validation_default_percentage" INTEGER NOT NULL DEFAULT 20,
    "classification_on" INTEGER NOT NULL DEFAULT 0,
    "qa_on" INTEGER NOT NULL DEFAULT 0,
    "qa_open" INTEGER NOT NULL DEFAULT 0,
    "qa_validation_on" INTEGER NOT NULL DEFAULT 0,
    "qa_cutt_off_score" INTEGER,
    "key_paper_prefix" VARCHAR(20) NOT NULL DEFAULT 'Paper_',
    "key_paper_serial" INTEGER NOT NULL DEFAULT 1,
    "csv_field_separator" VARCHAR(1) NOT NULL DEFAULT ';',
    "csv_field_separator_export" VARCHAR(1) NOT NULL DEFAULT ',',
    "editor_url" VARCHAR(100),
    "editor_generated_path" VARCHAR(100),

    CONSTRAINT "config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "papers" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "bibtexKey" VARCHAR(100),
    "title" TEXT NOT NULL,
    "preview" TEXT,
    "paper_abstract" TEXT,
    "doi" VARCHAR(100),
    "year" INTEGER,
    "bibtex" TEXT,
    "venue_id" UUID,
    "papers_sources" VARCHAR(100),
    "search_strategy" VARCHAR(100),
    "screening_status" "ScreeningStatus" NOT NULL DEFAULT 'PENDING',
    "classification_status" "ClassificationStatus" NOT NULL DEFAULT 'WAITING',
    "added_by" UUID NOT NULL,
    "add_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addition_mode" VARCHAR(50),
    "operation_code" VARCHAR(100),
    "paper_active" INTEGER NOT NULL DEFAULT 1,
    "paper_excluded" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "author" (
    "id" UUID NOT NULL,
    "author_lastname" VARCHAR(50) NOT NULL,
    "author_firstname" VARCHAR(50),
    "author_email" VARCHAR(100),

    CONSTRAINT "author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_author" (
    "id" UUID NOT NULL,
    "paper_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "author_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "paper_author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "venue_type" VARCHAR(50),

    CONSTRAINT "venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_phase" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "phase_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "screen_phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assigned" (
    "id" UUID NOT NULL,
    "paper_id" UUID NOT NULL,
    "screen_phase_id" UUID NOT NULL,
    "assigned_user_id" UUID NOT NULL,
    "assigned_note" TEXT,
    "assigned_by" UUID NOT NULL,
    "assigned_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "assigned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_decison" (
    "id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "paper_id" UUID NOT NULL,
    "screen_phase_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "decision_type" "DecisionType" NOT NULL,
    "decision_criteria" TEXT,
    "decision_rationale" TEXT,
    "decision_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decision_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "screen_decison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_conflict" (
    "id" UUID NOT NULL,
    "decision_id" UUID NOT NULL,
    "paper_id" UUID NOT NULL,
    "screen_phase_id" UUID NOT NULL,
    "conflict_type" "ConflictType" NOT NULL DEFAULT 'INCLUDE_EXCLUDE',
    "resolved_by" UUID,
    "resolution" "DecisionType",
    "resolved_at" TIMESTAMP(3),
    "resolution_note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "screening_conflict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_inclusion_mapping" (
    "id" UUID NOT NULL,
    "screen_phase_id" UUID NOT NULL,
    "criteria_id" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "screening_inclusion_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inclusioncrieria" (
    "id" UUID NOT NULL,
    "config_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "inclusioncrieria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exclusioncrieria" (
    "id" UUID NOT NULL,
    "config_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "exclusioncrieria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_template" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "active" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_questions" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "question_type" VARCHAR(20) NOT NULL DEFAULT 'binary',
    "order" INTEGER NOT NULL DEFAULT 0,
    "required" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "qa_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_responses" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "value" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "is_positive" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "qa_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_assignment" (
    "id" UUID NOT NULL,
    "paper_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "assigned_user_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "qa_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_result" (
    "id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "paper_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "option_id" UUID,
    "entry_value" VARCHAR(100),
    "entry_score" DOUBLE PRECISION,
    "submitted_at" TIMESTAMP(3),
    "validated_at" TIMESTAMP(3),
    "validated_by" UUID,
    "active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "qa_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extraction_form" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_published" INTEGER NOT NULL DEFAULT 0,
    "is_locked" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extraction_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extraction_field" (
    "id" UUID NOT NULL,
    "form_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "field_type" VARCHAR(20) NOT NULL,
    "is_required" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "extraction_field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extraction_entry" (
    "id" UUID NOT NULL,
    "paper_id" UUID NOT NULL,
    "form_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "ExtractionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "submitted_at" TIMESTAMP(3),
    "validated_at" TIMESTAMP(3),
    "validated_by" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extraction_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extraction_entry_value" (
    "id" UUID NOT NULL,
    "entry_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "value" TEXT,

    CONSTRAINT "extraction_entry_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classification" (
    "id" UUID NOT NULL,
    "class_paper_id" UUID NOT NULL,
    "note" VARCHAR(500),
    "class_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imports" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(20) NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'UPLOADED',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "processed_rows" INTEGER NOT NULL DEFAULT 0,
    "success_rows" INTEGER NOT NULL DEFAULT 0,
    "duplicate_rows" INTEGER NOT NULL DEFAULT 0,
    "error_rows" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exports" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "export_type" VARCHAR(50) NOT NULL,
    "filename" VARCHAR(255),
    "filters" JSONB,
    "status" "ExportStatus" NOT NULL DEFAULT 'PENDING',
    "file_path" VARCHAR(500),
    "error" TEXT,
    "created_by" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_snapshots" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "screen_phase_id" UUID,
    "snapshot_type" VARCHAR(50) NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log" (
    "id" UUID NOT NULL,
    "project_id" UUID,
    "user_id" UUID,
    "log_type" "LogType" NOT NULL,
    "log_event" TEXT NOT NULL,
    "log_ip_address" VARCHAR(50),
    "log_user_agent" VARCHAR(150),
    "metadata" JSONB,
    "log_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "info" (
    "id" UUID NOT NULL,
    "info_title" VARCHAR(500) NOT NULL,
    "info_desc" TEXT,
    "info_link" VARCHAR(500),
    "info_type" "InfoType" NOT NULL DEFAULT 'HELP',
    "info_order" INTEGER NOT NULL DEFAULT 1,
    "info_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_config" (
    "id" UUID NOT NULL,
    "config_label" VARCHAR(100) NOT NULL,
    "config_value" VARCHAR(100) NOT NULL,
    "config_description" VARCHAR(500),
    "config_user" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    "config_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "admin_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "str_management" (
    "id" UUID NOT NULL,
    "str_label" VARCHAR(500) NOT NULL,
    "str_text" VARCHAR(1000) NOT NULL,
    "str_category" VARCHAR(20) NOT NULL DEFAULT 'default',
    "str_lang" VARCHAR(3) NOT NULL DEFAULT 'en',
    "str_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "str_management_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_creation" (
    "id" UUID NOT NULL,
    "creation_user_id" UUID NOT NULL,
    "confirmation_code" VARCHAR(50) NOT NULL,
    "confirmation_expiration" INTEGER NOT NULL,
    "confirmation_try" INTEGER NOT NULL DEFAULT 0,
    "user_creation_active" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "user_creation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_username_key" ON "users"("user_username");

-- CreateIndex
CREATE UNIQUE INDEX "usergroup_usergroup_name_key" ON "usergroup"("usergroup_name");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "projects_project_label_key" ON "projects"("project_label");

-- CreateIndex
CREATE UNIQUE INDEX "userproject_user_id_project_id_key" ON "userproject"("user_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "config_project_id_key" ON "config"("project_id");

-- CreateIndex
CREATE INDEX "papers_project_id_idx" ON "papers"("project_id");

-- CreateIndex
CREATE INDEX "papers_project_id_screening_status_idx" ON "papers"("project_id", "screening_status");

-- CreateIndex
CREATE INDEX "papers_project_id_doi_idx" ON "papers"("project_id", "doi");

-- CreateIndex
CREATE UNIQUE INDEX "papers_project_id_bibtexKey_key" ON "papers"("project_id", "bibtexKey");

-- CreateIndex
CREATE UNIQUE INDEX "paper_author_paper_id_author_id_key" ON "paper_author"("paper_id", "author_id");

-- CreateIndex
CREATE UNIQUE INDEX "venue_project_id_name_key" ON "venue"("project_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "screen_phase_project_id_name_key" ON "screen_phase"("project_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "assigned_paper_id_screen_phase_id_assigned_user_id_key" ON "assigned"("paper_id", "screen_phase_id", "assigned_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "screen_decison_assignment_id_key" ON "screen_decison"("assignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "screening_conflict_decision_id_key" ON "screening_conflict"("decision_id");

-- CreateIndex
CREATE INDEX "screening_conflict_paper_id_screen_phase_id_idx" ON "screening_conflict"("paper_id", "screen_phase_id");

-- CreateIndex
CREATE UNIQUE INDEX "screening_inclusion_mapping_screen_phase_id_criteria_id_key" ON "screening_inclusion_mapping"("screen_phase_id", "criteria_id");

-- CreateIndex
CREATE UNIQUE INDEX "qa_assignment_paper_id_template_id_assigned_user_id_key" ON "qa_assignment"("paper_id", "template_id", "assigned_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "qa_result_assignment_id_question_id_key" ON "qa_result"("assignment_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "extraction_field_form_id_name_key" ON "extraction_field"("form_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "extraction_entry_paper_id_form_id_version_key" ON "extraction_entry"("paper_id", "form_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "extraction_entry_value_entry_id_field_id_key" ON "extraction_entry_value"("entry_id", "field_id");

-- CreateIndex
CREATE UNIQUE INDEX "classification_class_paper_id_key" ON "classification"("class_paper_id");

-- CreateIndex
CREATE INDEX "report_snapshots_project_id_screen_phase_id_idx" ON "report_snapshots"("project_id", "screen_phase_id");

-- CreateIndex
CREATE INDEX "log_project_id_idx" ON "log"("project_id");

-- CreateIndex
CREATE INDEX "log_user_id_idx" ON "log"("user_id");

-- CreateIndex
CREATE INDEX "log_log_time_idx" ON "log"("log_time");

-- CreateIndex
CREATE UNIQUE INDEX "admin_config_config_label_key" ON "admin_config"("config_label");

-- CreateIndex
CREATE UNIQUE INDEX "str_management_str_label_str_lang_key" ON "str_management"("str_label", "str_lang");

-- CreateIndex
CREATE UNIQUE INDEX "user_creation_creation_user_id_key" ON "user_creation"("creation_user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_usergroup_fkey" FOREIGN KEY ("user_usergroup") REFERENCES "usergroup"("usergroup_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_creator_fkey" FOREIGN KEY ("project_creator") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userproject" ADD CONSTRAINT "userproject_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userproject" ADD CONSTRAINT "userproject_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config" ADD CONSTRAINT "config_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papers" ADD CONSTRAINT "papers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papers" ADD CONSTRAINT "papers_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papers" ADD CONSTRAINT "papers_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_author" ADD CONSTRAINT "paper_author_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_author" ADD CONSTRAINT "paper_author_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue" ADD CONSTRAINT "venue_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_phase" ADD CONSTRAINT "screen_phase_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned" ADD CONSTRAINT "assigned_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned" ADD CONSTRAINT "assigned_screen_phase_id_fkey" FOREIGN KEY ("screen_phase_id") REFERENCES "screen_phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_decison" ADD CONSTRAINT "screen_decison_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assigned"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_decison" ADD CONSTRAINT "screen_decison_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_decison" ADD CONSTRAINT "screen_decison_screen_phase_id_fkey" FOREIGN KEY ("screen_phase_id") REFERENCES "screen_phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_conflict" ADD CONSTRAINT "screening_conflict_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "screen_decison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_inclusion_mapping" ADD CONSTRAINT "screening_inclusion_mapping_screen_phase_id_fkey" FOREIGN KEY ("screen_phase_id") REFERENCES "screen_phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_inclusion_mapping" ADD CONSTRAINT "screening_inclusion_mapping_criteria_id_fkey" FOREIGN KEY ("criteria_id") REFERENCES "inclusioncrieria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inclusioncrieria" ADD CONSTRAINT "inclusioncrieria_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusioncrieria" ADD CONSTRAINT "exclusioncrieria_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_template" ADD CONSTRAINT "qa_template_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_questions" ADD CONSTRAINT "qa_questions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "qa_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_responses" ADD CONSTRAINT "qa_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "qa_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_assignment" ADD CONSTRAINT "qa_assignment_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_assignment" ADD CONSTRAINT "qa_assignment_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "qa_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_result" ADD CONSTRAINT "qa_result_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "qa_assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_result" ADD CONSTRAINT "qa_result_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_result" ADD CONSTRAINT "qa_result_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "qa_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_result" ADD CONSTRAINT "qa_result_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "qa_responses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extraction_form" ADD CONSTRAINT "extraction_form_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extraction_field" ADD CONSTRAINT "extraction_field_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "extraction_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extraction_entry" ADD CONSTRAINT "extraction_entry_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extraction_entry" ADD CONSTRAINT "extraction_entry_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "extraction_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extraction_entry_value" ADD CONSTRAINT "extraction_entry_value_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "extraction_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extraction_entry_value" ADD CONSTRAINT "extraction_entry_value_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "extraction_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classification" ADD CONSTRAINT "classification_class_paper_id_fkey" FOREIGN KEY ("class_paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imports" ADD CONSTRAINT "imports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exports" ADD CONSTRAINT "exports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_snapshots" ADD CONSTRAINT "report_snapshots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_snapshots" ADD CONSTRAINT "report_snapshots_screen_phase_id_fkey" FOREIGN KEY ("screen_phase_id") REFERENCES "screen_phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
