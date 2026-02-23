/**
 * protocol-compiler.ts
 *
 * Takes a validated ReviewProtocol JSON and creates all project entities
 * inside a single Prisma transaction. This is the "install project" equivalent
 * from the legacy PHP system (classification_install_*.php).
 *
 * Pipeline:  Form-UI / CLI  →  ReviewProtocol JSON
 *            →  Zod validation (protocol-schema.ts)
 *            →  compileProtocol()  (this file)
 *            →  Project + Config + Phases + QA + Extraction + … in DB
 */
import { prisma } from '@neorelis/db'
import type { ReviewProtocol, Category } from './protocol-schema'

// ─── Helpers ───────────────────────────────────────────────────────

/** Map DSL conflict type string → Prisma ConflictType enum */
function mapConflictType(ct: string) {
  switch (ct) {
    case 'Decision':
      return 'INCLUDE_EXCLUDE' as const
    case 'Criteria':
      return 'ALL_CRITERIA' as const
    default:
      return 'INCLUDE_EXCLUDE' as const
  }
}

/** Map DSL conflict resolution → Prisma ConflictResolution enum */
function mapConflictResolution(cr: string) {
  switch (cr) {
    case 'Majority':
      return 'MAJORITY' as const
    case 'Unanimity':
      return 'UNANIMITY' as const
    default:
      return 'UNANIMITY' as const
  }
}

/** Map category_type to ExtractionField.fieldType */
function mapFieldType(cat: Category): string {
  switch (cat.category_type) {
    case 'Simple':
      return cat.type // 'int' | 'text' | 'string' | 'bool' | 'real' | 'date'
    case 'List':
      return 'list'
    case 'DynamicList':
      return 'dynamic_list'
    default:
      return 'string'
  }
}

/** Build the config JSON blob stored per ExtractionField */
function buildFieldConfig(cat: Category): Record<string, unknown> {
  const cfg: Record<string, unknown> = {
    category_type: cat.category_type,
  }

  if (cat.numberOfValues !== undefined) cfg.numberOfValues = cat.numberOfValues
  if (cat.mandatory !== undefined) cfg.mandatory = cat.mandatory

  switch (cat.category_type) {
    case 'Simple':
      if (cat.max_char) cfg.max_char = cat.max_char
      if (cat.pattern) cfg.pattern = cat.pattern
      if (cat.initial_value) cfg.initial_value = cat.initial_value
      break
    case 'List':
      cfg.values = cat.values.map((v: { name: string }) => v.name)
      break
    case 'DynamicList':
      if (cat.dynamic_subtype === 'Independent') {
        cfg.dynamic_subtype = 'Independent'
        if (cat.reference_name) cfg.reference_name = cat.reference_name
        cfg.initial_values = cat.initial_values
      } else {
        cfg.dynamic_subtype = 'Dependent'
        cfg.depends_on = cat.depends_on
      }
      break
  }

  return cfg
}

/**
 * Recursively flatten categories into a flat list of extraction field data,
 * preserving parent → child ordering. sub_categories become additional fields
 * with a parentName reference stored in config.
 */
function flattenCategories(
  categories: Category[],
  parentName?: string
): Array<{
  name: string
  label: string
  fieldType: string
  isRequired: number
  order: number
  config: Record<string, unknown>
}> {
  const result: Array<{
    name: string
    label: string
    fieldType: string
    isRequired: number
    order: number
    config: Record<string, unknown>
  }> = []

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]
    const cfg = buildFieldConfig(cat)
    if (parentName) cfg.parent = parentName

    result.push({
      name: cat.name,
      label: cat.title || cat.name,
      fieldType: mapFieldType(cat),
      isRequired: cat.mandatory ? 1 : 0,
      order: result.length,
      config: cfg,
    })

    // Recurse into sub-categories
    if (cat.sub_categories && cat.sub_categories.length > 0) {
      const children = flattenCategories(cat.sub_categories, cat.name)
      result.push(...children)
    }
  }

  return result
}

// ─── Main Compiler ─────────────────────────────────────────────────

export interface CompileResult {
  projectId: string
  label: string
  title: string
}

/**
 * Compile a ReviewProtocol into a fully-provisioned project.
 * Everything runs in a single Prisma transaction.
 *
 * @param protocol - A validated ReviewProtocol object (Zod-parsed)
 * @param creatorId - UUID of the authenticated user
 * @returns { projectId, label, title }
 */
export async function compileProtocol(
  protocol: ReviewProtocol,
  creatorId: string
): Promise<CompileResult> {
  const { project: projectDef, screening, quality_assess, category, reporting } = protocol

  return prisma.$transaction(async (tx) => {
    // ── 1. Create Project + Config + ADMIN membership ──

    const hasScreening = !!screening
    const hasQA = !!quality_assess
    const hasExtraction = category.length > 0

    const project = await tx.project.create({
      data: {
        label: projectDef.short_name.toLowerCase(),
        title: projectDef.name,
        description: projectDef.description,
        creatorId,
        status: 'DRAFT',
        members: {
          create: {
            userId: creatorId,
            role: 'ADMIN',
            addedBy: creatorId,
          },
        },
        config: {
          create: ({
            configType: 'protocol',
            // Store the raw protocol as source of truth
            protocolJson: JSON.parse(JSON.stringify(protocol)),

            // Screening settings derived from protocol
            screeningOn: hasScreening ? 1 : 0,
            screeningReviewerNum: screening?.review_per_paper ?? 2,
            screeningConflictType: screening
              ? mapConflictType(screening.conflict_type)
              : 'INCLUDE_EXCLUDE',
            screeningConflictRes: screening
              ? mapConflictResolution(screening.conflict_resolution)
              : 'UNANIMITY',
            validationDefaultPercent: screening?.validation_percentage ?? 20,
            screeningValidationOn: screening?.validation_percentage ? 1 : 0,
            validationAssignmentMode: screening?.validation_assignment_mode ?? 'Normal',

            // Source & strategy toggles
            sourcePapersOn: screening?.source_papers?.length ? 1 : 0,
            searchStrategyOn: screening?.search_strategy?.length ? 1 : 0,

            // Classification
            classificationOn: hasExtraction ? 1 : 0,

            // QA
            qaOn: hasQA ? 1 : 0,
            qaCutoffScore: quality_assess?.min_score,
          }) as any,
        },
      },
    })

    const configRecord = await tx.projectConfig.findUnique({
      where: { projectId: project.id },
    })

    // ── 2. Exclusion Criteria ──

    if (screening?.exclusion_criteria?.length && configRecord) {
      for (let i = 0; i < screening.exclusion_criteria.length; i++) {
        const criterion = screening.exclusion_criteria[i]
        if (criterion) {
          await tx.exclusionCriteria.create({
            data: {
              configId: configRecord.id,
              title: criterion.name,
              order: i,
            },
          })
        }
      }
    }

    // ── 3. Screening Phases ──

    if (screening?.phases?.length) {
      for (let i = 0; i < screening.phases.length; i++) {
        const phase = screening.phases[i]
        if (phase) {
          await tx.screeningPhase.create({
            data: {
              projectId: project.id,
              name: phase.title,
              description: phase.description,
              order: i,
              ...(phase.fields ? { fields: phase.fields as unknown as any } : {}),
            },
          })
        }
      }
    } else if (hasScreening) {
      // Create a default "Phase 1" if screening is on but no phases specified
      await tx.screeningPhase.create({
        data: {
          projectId: project.id,
          name: 'Phase 1',
          description: 'Default screening phase',
          order: 0,
        },
      })
    }

    // ── 4. Quality Assessment Template + Questions + Options ──

    if (quality_assess) {
      const template = await tx.qATemplate.create({
        data: {
          projectId: project.id,
          name: 'Default QA',
          description: `Min score: ${quality_assess.min_score}`,
        },
      })

      for (let qi = 0; qi < quality_assess.question.length; qi++) {
        const qText = quality_assess.question[qi]
        if (!qText) continue
        const question = await tx.qAQuestion.create({
          data: {
            templateId: template.id,
            text: qText,
            type: 'scored',
            order: qi,
          },
        })

        // Shared response options for every question (mirrors legacy behavior)
        for (let ri = 0; ri < quality_assess.response.length; ri++) {
          const resp = quality_assess.response[ri]
          if (!resp) continue
          await tx.qAOption.create({
            data: {
              questionId: question.id,
              value: String(resp.score),
              label: resp.title,
              weight: resp.score,
              isPositive: resp.score > 0 ? 1 : 0,
            },
          })
        }
      }
    }

    // ── 5. Extraction Form + Fields (from categories) ──

    if (category.length > 0) {
      const form = await tx.extractionForm.create({
        data: {
          projectId: project.id,
          name: 'Default Extraction',
          description: 'Auto-generated from protocol',
          version: 1,
          isPublished: 1,
        },
      })

      const fields = flattenCategories(category)
      for (const field of fields) {
        await tx.extractionField.create({
          data: {
            formId: form.id,
            name: field.name,
            label: field.label,
            fieldType: field.fieldType,
            isRequired: field.isRequired,
            order: field.order,
            config: field.config as any,
          },
        })
      }
    }

    // ── 6. Reporting config (stored in protocolJson, no separate table needed) ──
    // Reports are read from protocolJson at render time.
    // The protocol already includes the reporting array.

    return {
      projectId: project.id,
      label: project.label,
      title: project.title,
    }
  })
}
