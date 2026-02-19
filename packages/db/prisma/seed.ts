import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NeoReLiS database...\n");

  // ── Clean existing data (reverse dependency order) ──
  console.log("🧹 Cleaning existing data...");
  await prisma.screeningConflict.deleteMany();
  await prisma.screeningDecision.deleteMany();
  await prisma.screeningAssignment.deleteMany();
  await prisma.screeningInclusionMapping.deleteMany();
  await prisma.screeningPhase.deleteMany();
  await prisma.qAEntry.deleteMany();
  await prisma.qAAssignment.deleteMany();
  await prisma.qAOption.deleteMany();
  await prisma.qAQuestion.deleteMany();
  await prisma.qATemplate.deleteMany();
  await prisma.extractionEntryValue.deleteMany();
  await prisma.extractionEntry.deleteMany();
  await prisma.extractionField.deleteMany();
  await prisma.extractionForm.deleteMany();
  await prisma.classification.deleteMany();
  await prisma.paperAuthor.deleteMany();
  await prisma.author.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.export.deleteMany();
  await prisma.reportSnapshot.deleteMany();
  await prisma.inclusionCriteria.deleteMany();
  await prisma.exclusionCriteria.deleteMany();
  await prisma.projectConfig.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.session.deleteMany();
  await prisma.userCreation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.userGroup.deleteMany();
  await prisma.info.deleteMany();
  await prisma.adminConfig.deleteMany();
  await prisma.stringResource.deleteMany();

  // ── 1. User Groups ──
  console.log("👥 Creating user groups...");
  const adminGroup = await prisma.userGroup.create({
    data: { name: "Administrators", description: "Platform administrators" },
  });
  const researcherGroup = await prisma.userGroup.create({
    data: { name: "Researchers", description: "Research team members" },
  });

  // ── 2. Users ──
  console.log("👤 Creating users...");
  const admin = await prisma.user.create({
    data: {
      name: "Alice Chen",
      username: "alice_admin",
      email: "alice@neorelis.dev",
      passwordHash: "$2b$10$placeholder_hash_alice",
      userGroupId: adminGroup.id,
    },
  });
  const manager = await prisma.user.create({
    data: {
      name: "Bob Martinez",
      username: "bob_manager",
      email: "bob@neorelis.dev",
      passwordHash: "$2b$10$placeholder_hash_bob",
      userGroupId: researcherGroup.id,
    },
  });
  const reviewer1 = await prisma.user.create({
    data: {
      name: "Carol Wang",
      username: "carol_reviewer",
      email: "carol@neorelis.dev",
      passwordHash: "$2b$10$placeholder_hash_carol",
      userGroupId: researcherGroup.id,
    },
  });
  const reviewer2 = await prisma.user.create({
    data: {
      name: "David Kim",
      username: "david_reviewer",
      email: "david@neorelis.dev",
      passwordHash: "$2b$10$placeholder_hash_david",
      userGroupId: researcherGroup.id,
    },
  });
  const validator = await prisma.user.create({
    data: {
      name: "Eva Patel",
      username: "eva_validator",
      email: "eva@neorelis.dev",
      passwordHash: "$2b$10$placeholder_hash_eva",
      userGroupId: researcherGroup.id,
    },
  });

  // ── 3. Projects ──
  console.log("📁 Creating projects...");
  const project1 = await prisma.project.create({
    data: {
      label: "ai_code_review_slr",
      title: "AI-Assisted Code Review: A Systematic Literature Review",
      description:
        "Investigating the state of AI-assisted code review tools and their effectiveness in modern software engineering workflows.",
      creatorId: manager.id,
      status: "PUBLISHED",
      isPublic: 1,
    },
  });
  const project2 = await prisma.project.create({
    data: {
      label: "ml_testing_slr",
      title: "Machine Learning Testing Practices: An SLR",
      description:
        "Systematic review of testing methodologies and quality assurance practices for ML-based systems.",
      creatorId: manager.id,
      status: "DRAFT",
    },
  });

  // ── 4. Project Members ──
  console.log("🤝 Assigning project members...");
  const memberData = [
    { userId: admin.id, projectId: project1.id, role: "ADMIN" as const, addedBy: admin.id },
    { userId: manager.id, projectId: project1.id, role: "MANAGER" as const, addedBy: admin.id },
    { userId: reviewer1.id, projectId: project1.id, role: "REVIEWER" as const, addedBy: manager.id },
    { userId: reviewer2.id, projectId: project1.id, role: "REVIEWER" as const, addedBy: manager.id },
    { userId: validator.id, projectId: project1.id, role: "VALIDATOR" as const, addedBy: manager.id },
    { userId: manager.id, projectId: project2.id, role: "MANAGER" as const, addedBy: admin.id },
    { userId: reviewer1.id, projectId: project2.id, role: "REVIEWER" as const, addedBy: manager.id },
  ];
  for (const m of memberData) {
    await prisma.projectMember.create({ data: m });
  }

  // ── 5. Project Config ──
  console.log("⚙️  Creating project configs...");
  const config1 = await prisma.projectConfig.create({
    data: {
      projectId: project1.id,
      screeningOn: 1,
      screeningReviewerNum: 2,
      screeningConflictType: "INCLUDE_EXCLUDE",
      screeningConflictRes: "UNANIMITY",
      classificationOn: 1,
      qaOn: 1,
      paperPrefix: "AICR_",
    },
  });
  await prisma.projectConfig.create({
    data: { projectId: project2.id, paperPrefix: "MLT_" },
  });

  // ── 6. Inclusion / Exclusion Criteria ──
  console.log("📋 Creating screening criteria...");
  const ic1 = await prisma.inclusionCriteria.create({
    data: { configId: config1.id, title: "Peer-reviewed publication", description: "Study is published in a peer-reviewed venue", order: 1 },
  });
  const ic2 = await prisma.inclusionCriteria.create({
    data: { configId: config1.id, title: "AI/ML technique applied to code review", description: "Study applies AI or ML for automated code review", order: 2 },
  });
  await prisma.exclusionCriteria.create({
    data: { configId: config1.id, title: "Non-English publication", description: "Studies not available in English", order: 1 },
  });
  await prisma.exclusionCriteria.create({
    data: { configId: config1.id, title: "Grey literature / blog posts", description: "Non-academic grey literature", order: 2 },
  });

  // ── 7. Venues ──
  console.log("🏛️  Creating venues...");
  const venues = await Promise.all([
    prisma.venue.create({ data: { projectId: project1.id, name: "IEEE TSE", type: "journal" } }),
    prisma.venue.create({ data: { projectId: project1.id, name: "ACM TOSEM", type: "journal" } }),
    prisma.venue.create({ data: { projectId: project1.id, name: "ICSE", type: "conference" } }),
    prisma.venue.create({ data: { projectId: project1.id, name: "FSE", type: "conference" } }),
    prisma.venue.create({ data: { projectId: project1.id, name: "ASE", type: "conference" } }),
  ]);

  // ── 8. Authors ──
  console.log("✍️  Creating authors...");
  const authors = await Promise.all([
    prisma.author.create({ data: { lastName: "Zhang", firstName: "Wei" } }),
    prisma.author.create({ data: { lastName: "Smith", firstName: "John" } }),
    prisma.author.create({ data: { lastName: "Garcia", firstName: "Maria" } }),
    prisma.author.create({ data: { lastName: "Li", firstName: "Xin" } }),
    prisma.author.create({ data: { lastName: "Johnson", firstName: "Emily" } }),
    prisma.author.create({ data: { lastName: "Brown", firstName: "Michael" } }),
  ]);

  // ── 9. Papers ──
  console.log("📄 Creating papers...");
  const paperDefs = [
    { title: "Deep Learning for Automated Code Review: A Survey", abstract: "This paper surveys deep learning approaches applied to automated code review, covering neural program analysis, transformer-based models, and their integration into CI/CD pipelines.", doi: "10.1109/TSE.2024.001", year: 2024, venueIdx: 0, authorIdxs: [0, 1], status: "INCLUDED" as const },
    { title: "LLM-Based Code Review Assistants: Effectiveness and Limitations", abstract: "We evaluate the effectiveness of large language model-based assistants for code review, measuring defect detection rate, false positive rate, and developer satisfaction across 15 open-source projects.", doi: "10.1145/TOSEM.2024.002", year: 2024, venueIdx: 1, authorIdxs: [2, 3], status: "INCLUDED" as const },
    { title: "Automated Static Analysis vs AI Review: A Comparative Study", abstract: "This comparative study evaluates traditional static analysis tools against modern AI-powered review systems on a benchmark of 5,000 code changes.", doi: "10.1109/ICSE.2023.003", year: 2023, venueIdx: 2, authorIdxs: [1, 4], status: "IN_REVIEW" as const },
    { title: "Transformer Models for Code Understanding and Review", abstract: "We propose CodeReviewBERT, a transformer model fine-tuned for code review tasks including defect detection, code smell identification, and improvement suggestion generation.", doi: "10.1145/FSE.2023.004", year: 2023, venueIdx: 3, authorIdxs: [0, 5], status: "IN_REVIEW" as const },
    { title: "Human-AI Collaboration in Code Review Processes", abstract: "This paper investigates how human reviewers interact with AI-generated code review suggestions, analyzing acceptance rates, trust calibration, and the impact on review quality.", doi: "10.1109/ASE.2024.005", year: 2024, venueIdx: 4, authorIdxs: [4, 5], status: "PENDING" as const },
    { title: "Bias in AI Code Review Tools: A Systematic Analysis", abstract: "We analyze potential biases in AI code review tools, including language-specific biases, coding style preferences, and demographic factors that may influence review recommendations.", doi: "10.1109/TSE.2024.006", year: 2024, venueIdx: 0, authorIdxs: [2, 3], status: "PENDING" as const },
    { title: "Privacy-Preserving Code Review with Federated Learning", abstract: "This paper proposes a federated learning approach for building code review models that preserve intellectual property while learning from distributed codebases.", doi: "10.1145/ICSE.2024.007", year: 2024, venueIdx: 2, authorIdxs: [0, 1, 3], status: "EXCLUDED" as const },
    { title: "Evaluating GPT-4 for Security-Focused Code Review", abstract: "We evaluate GPT-4's capability to identify security vulnerabilities during code review across OWASP Top 10 categories on a curated dataset of 2,000 vulnerable code snippets.", doi: "10.1145/FSE.2024.008", year: 2024, venueIdx: 3, authorIdxs: [1, 5], status: "IN_CONFLICT" as const },
  ];

  const papers = [];
  for (const p of paperDefs) {
    const paper = await prisma.paper.create({
      data: {
        projectId: project1.id,
        title: p.title,
        abstract: p.abstract,
        doi: p.doi,
        year: p.year,
        venueId: venues[p.venueIdx]!.id,
        bibtexKey: p.doi.replace(/[/.]/g, "_"),
        screeningStatus: p.status,
        addedBy: manager.id,
        source: "Scopus",
      },
    });
    papers.push(paper);
    // Link authors
    for (let i = 0; i < p.authorIdxs.length; i++) {
      await prisma.paperAuthor.create({
        data: { paperId: paper.id, authorId: authors[p.authorIdxs[i]!]!.id, order: i + 1 },
      });
    }
  }

  // ── 10. Screening Phase, Assignments & Decisions ──
  console.log("🔍 Creating screening phases and decisions...");
  const phase1 = await prisma.screeningPhase.create({
    data: { projectId: project1.id, name: "Title & Abstract Screening", description: "Initial screening based on title and abstract relevance", order: 1 },
  });

  // Map inclusion criteria to phase
  await prisma.screeningInclusionMapping.create({ data: { phaseId: phase1.id, criteriaId: ic1.id, order: 1 } });
  await prisma.screeningInclusionMapping.create({ data: { phaseId: phase1.id, criteriaId: ic2.id, order: 2 } });

  // Create assignments and decisions for first 4 papers (both reviewers)
  for (let i = 0; i < 4; i++) {
    const paper = papers[i]!;
    for (const reviewer of [reviewer1, reviewer2]) {
      const assignment = await prisma.screeningAssignment.create({
        data: { paperId: paper.id, phaseId: phase1.id, userId: reviewer.id, assignedBy: manager.id },
      });
      // Decisions for INCLUDED/IN_REVIEW papers
      if (i < 2) {
        await prisma.screeningDecision.create({
          data: {
            assignmentId: assignment.id,
            paperId: paper.id,
            phaseId: phase1.id,
            userId: reviewer.id,
            decision: "INCLUDE",
            rationale: "Directly relevant to AI code review research question.",
          },
        });
      }
    }
  }

  // ── 11. QA Template ──
  console.log("✅ Creating QA template...");
  const qaTemplate = await prisma.qATemplate.create({
    data: { projectId: project1.id, name: "Study Quality Checklist", description: "Standard quality assessment for included studies" },
  });
  const q1 = await prisma.qAQuestion.create({
    data: { templateId: qaTemplate.id, text: "Are the research objectives clearly stated?", type: "binary", order: 1 },
  });
  await prisma.qAOption.createMany({
    data: [
      { questionId: q1.id, value: "yes", label: "Yes", weight: 1.0, isPositive: 1 },
      { questionId: q1.id, value: "no", label: "No", weight: 0.0, isPositive: 0 },
    ],
  });
  const q2 = await prisma.qAQuestion.create({
    data: { templateId: qaTemplate.id, text: "Is the study methodology appropriate and well-described?", type: "binary", order: 2 },
  });
  await prisma.qAOption.createMany({
    data: [
      { questionId: q2.id, value: "yes", label: "Yes", weight: 1.0, isPositive: 1 },
      { questionId: q2.id, value: "partial", label: "Partially", weight: 0.5, isPositive: 1 },
      { questionId: q2.id, value: "no", label: "No", weight: 0.0, isPositive: 0 },
    ],
  });

  // ── 12. Extraction Form ──
  console.log("📝 Creating extraction form...");
  const extractionForm = await prisma.extractionForm.create({
    data: { projectId: project1.id, name: "Data Extraction Form v1", description: "Primary data extraction form for AI code review SLR", isPublished: 1 },
  });
  await prisma.extractionField.createMany({
    data: [
      { formId: extractionForm.id, name: "ai_technique", label: "AI/ML Technique Used", fieldType: "select", isRequired: 1, order: 1, config: { options: ["Deep Learning", "NLP/Transformers", "Traditional ML", "LLM", "Hybrid"] } },
      { formId: extractionForm.id, name: "evaluation_method", label: "Evaluation Methodology", fieldType: "select", isRequired: 1, order: 2, config: { options: ["Controlled Experiment", "Case Study", "Survey", "Mixed Methods"] } },
      { formId: extractionForm.id, name: "sample_size", label: "Sample Size", fieldType: "number", isRequired: 0, order: 3 },
      { formId: extractionForm.id, name: "key_findings", label: "Key Findings", fieldType: "textarea", isRequired: 1, order: 4 },
      { formId: extractionForm.id, name: "limitations", label: "Reported Limitations", fieldType: "textarea", isRequired: 0, order: 5 },
    ],
  });

  // ── 13. Import Job ──
  console.log("📥 Creating import jobs...");
  await prisma.importJob.create({
    data: {
      projectId: project1.id,
      filename: "scopus_ai_code_review_2024.bib",
      fileType: "bibtex",
      status: "COMPLETED",
      totalRows: 8,
      processedRows: 8,
      successRows: 8,
      duplicateRows: 0,
      errorRows: 0,
      createdBy: manager.id,
      completedAt: new Date(),
    },
  });

  // ── 14. Audit Logs ──
  console.log("📜 Creating audit logs...");
  const logEntries = [
    { logType: "AUTH" as const, event: "User alice_admin logged in", userId: admin.id },
    { logType: "PROJECT" as const, event: "Project 'ai_code_review_slr' created", userId: manager.id, projectId: project1.id },
    { logType: "MEMBERSHIP" as const, event: "carol_reviewer added to ai_code_review_slr as REVIEWER", userId: manager.id, projectId: project1.id },
    { logType: "IMPORT" as const, event: "Imported 8 papers from scopus_ai_code_review_2024.bib", userId: manager.id, projectId: project1.id },
    { logType: "SCREENING" as const, event: "Screening phase 'Title & Abstract Screening' created", userId: manager.id, projectId: project1.id },
  ];
  for (const log of logEntries) {
    await prisma.auditLog.create({ data: log });
  }

  // ── 15. System tables ──
  console.log("🔧 Creating system config...");
  await prisma.adminConfig.createMany({
    data: [
      { label: "app_name", value: "NeoReLiS", description: "Application display name" },
      { label: "app_version", value: "1.0.0-mvp", description: "Current application version" },
      { label: "max_upload_size_mb", value: "50", description: "Maximum file upload size in MB" },
      { label: "default_language", value: "en", description: "Default UI language" },
    ],
  });

  await prisma.info.createMany({
    data: [
      { title: "Welcome to NeoReLiS", description: "NeoReLiS is a modern platform for conducting Systematic Literature Reviews collaboratively.", type: "HOME", order: 1 },
      { title: "Getting Started", description: "Create a project, invite team members, import papers, and begin your review.", type: "HELP", order: 1 },
      { title: "Screening Workflow", description: "Papers are assigned to reviewers for independent screening. Conflicts are resolved by validators.", type: "HELP", order: 2 },
    ],
  });

  await prisma.stringResource.createMany({
    data: [
      { label: "btn_save", text: "Save", category: "ui", lang: "en" },
      { label: "btn_cancel", text: "Cancel", category: "ui", lang: "en" },
      { label: "msg_welcome", text: "Welcome to NeoReLiS", category: "message", lang: "en" },
      { label: "msg_no_papers", text: "No papers found. Import papers to get started.", category: "message", lang: "en" },
    ],
  });

  // ── Summary ──
  const counts = {
    userGroups: 2,
    users: 5,
    projects: 2,
    members: memberData.length,
    papers: papers.length,
    authors: authors.length,
    venues: venues.length,
    screeningPhases: 1,
    qaTemplates: 1,
    extractionForms: 1,
  };

  console.log("\n✅ Seeding complete! Summary:");
  console.log("─".repeat(40));
  for (const [key, val] of Object.entries(counts)) {
    console.log(`  ${key.padEnd(20)} ${val}`);
  }
  console.log("─".repeat(40));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
