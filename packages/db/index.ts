import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

// Export Prisma types for use in backend
export { Prisma };
export {
  ProjectStatus,
  ScreeningStatus,
  ClassificationStatus,
  ExtractionStatus,
  ImportStatus,
  ExportStatus,
} from "@prisma/client";
export type {
  User,
  Project,
  Paper,
  ScreeningPhase,
  ScreeningAssignment,
  ScreeningDecision,
  QATemplate,
  QAEntry,
  ExtractionForm,
  ExtractionEntry,
  ProjectMember,
  Notification,
  AuditLog,
  ImportJob,
  Export,
  ReportSnapshot,
  ProjectStatus,
  ScreeningStatus,
  ClassificationStatus,
  ExtractionStatus,
  ImportStatus,
  ExportStatus,
} from "@prisma/client";
