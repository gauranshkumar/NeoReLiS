/**
 * protocol-schema.ts
 *
 * Zod validation schema that mirrors the Xtext DSL grammar / JSON Schema.
 * This is the single definition of the ReviewProtocol JSON contract.
 *
 * Xtext grammar   → JSON Schema (xtext DSL to json schema.md)
 *                 → Zod Schema  (this file)
 *                 → Form types  (shared with frontend)
 *                 → Protocol Compiler input
 *
 * Reference: /xtext-DSL.md, /xtext DSL to json schema.md
 */
import { z } from 'zod'

// ─── Enum / Leaf Types ─────────────────────────────────────────────

export const SimpleTypeEnum = z.enum(['int', 'text', 'string', 'bool', 'real', 'date'])
export type SimpleType = z.infer<typeof SimpleTypeEnum>

export const ConflictTypeEnum = z.enum(['Decision', 'Criteria'])
export type ConflictType = z.infer<typeof ConflictTypeEnum>

export const ConflictResolutionEnum = z.enum(['Majority', 'Unanimity'])
export type ConflictResolution = z.infer<typeof ConflictResolutionEnum>

export const AssignmentModeEnum = z.enum(['Normal', 'Veto', 'Info'])
export type AssignmentMode = z.infer<typeof AssignmentModeEnum>

export const GraphTypeEnum = z.enum(['bar', 'pie', 'line'])
export type GraphType = z.infer<typeof GraphTypeEnum>

export const PhaseFieldEnum = z.enum(['Title', 'Abstract', 'Link', 'Preview', 'Bibtex'])
export type PhaseField = z.infer<typeof PhaseFieldEnum>

// Identifiers follow Xtext ID rule: [a-zA-Z_][a-zA-Z0-9_]*
const idPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/

/** A wrapped string value — mirrors the grammar's `Values` rule */
export const ValuesSchema = z.object({
  name: z.string().min(1),
})

/** nValues: -1 (unlimited) or non-negative integer */
export const NValuesSchema = z.number().int().refine((n) => n === -1 || n >= 0, {
  message: 'numberOfValues must be -1 (unlimited) or >= 0',
})

// ─── Response (QA answers) ─────────────────────────────────────────

export const ResponseSchema = z.object({
  title: z.string().min(1),
  score: z.number(),
})

// ─── Phase ─────────────────────────────────────────────────────────

export const PhaseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(PhaseFieldEnum).optional(),
})

// ─── Screening ─────────────────────────────────────────────────────

export const ScreeningSchema = z.object({
  review_per_paper: z.number().int().min(1),
  conflict_type: ConflictTypeEnum,
  conflict_resolution: ConflictResolutionEnum,
  exclusion_criteria: z.array(ValuesSchema).min(1),
  source_papers: z.array(ValuesSchema).optional(),
  search_strategy: z.array(ValuesSchema).optional(),
  validation_percentage: z.number().int().min(0).max(100).optional(),
  validation_assignment_mode: AssignmentModeEnum.optional(),
  phases: z.array(PhaseSchema).optional(),
})

// ─── Quality Assessment ────────────────────────────────────────────

export const QASchema = z.object({
  question: z.array(z.string().min(1)).min(1),
  response: z.array(ResponseSchema).min(1),
  min_score: z.number(),
})

// ─── Categories (Data Extraction Fields) ───────────────────────────

// Forward-declare the category schema for recursive sub_categories
const baseCategoryFields = {
  name: z.string().regex(idPattern, 'Must be a valid identifier'),
  title: z.string().optional(),
  mandatory: z.boolean().default(false),
  numberOfValues: NValuesSchema.optional(),
}

// FreeCategory — "Simple name :type"
export const FreeCategorySchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    category_type: z.literal('Simple'),
    ...baseCategoryFields,
    type: SimpleTypeEnum,
    max_char: z.number().int().positive().optional(),
    pattern: z.string().optional(),
    initial_value: z.string().optional(),
    sub_categories: z.array(CategorySchema).min(1).optional(),
  })
)

// StaticCategory — "List name = [values]"
export const StaticCategorySchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    category_type: z.literal('List'),
    ...baseCategoryFields,
    values: z.array(ValuesSchema).min(2),
    sub_categories: z.array(CategorySchema).min(1).optional(),
  })
)

// IndependentDynamicCategory — "DynamicList name = [initial_values]"
export const IndependentDynamicCategorySchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    category_type: z.literal('DynamicList'),
    dynamic_subtype: z.literal('Independent').default('Independent'),
    ...baseCategoryFields,
    reference_name: z.string().optional(),
    initial_values: z.array(z.string().min(1)).min(1),
    sub_categories: z.array(CategorySchema).min(1).optional(),
  })
)

// DependentDynamicCategory — "DynamicList name depends_on other_field"
export const DependentDynamicCategorySchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    category_type: z.literal('DynamicList'),
    dynamic_subtype: z.literal('Dependent').default('Dependent'),
    ...baseCategoryFields,
    depends_on: z.string().regex(idPattern, 'Must reference a valid category identifier'),
    sub_categories: z.array(CategorySchema).min(1).optional(),
  })
)

/** Union of all category types. Uses z.union since z.lazy() types lose ZodObject shape. */
export const CategorySchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    FreeCategorySchema,
    StaticCategorySchema,
    z.object({
      category_type: z.literal('DynamicList'),
      dynamic_subtype: z.literal('Independent').default('Independent'),
      ...baseCategoryFields,
      reference_name: z.string().optional(),
      initial_values: z.array(z.string().min(1)).min(1),
      sub_categories: z.lazy(() => z.array(CategorySchema).min(1).optional()),
    }),
    z.object({
      category_type: z.literal('DynamicList'),
      dynamic_subtype: z.literal('Dependent'),
      ...baseCategoryFields,
      depends_on: z.string().regex(idPattern, 'Must reference a valid category identifier'),
      sub_categories: z.lazy(() => z.array(CategorySchema).min(1).optional()),
    }),
  ])
)

// ─── Reports (Synthesis) ───────────────────────────────────────────

export const SimpleGraphSchema = z.object({
  report_type: z.literal('Simple'),
  name: z.string().regex(idPattern),
  title: z.string().optional(),
  value: z.string().regex(idPattern),
  chart: z.array(GraphTypeEnum).min(1),
})

export const CompareGraphSchema = z.object({
  report_type: z.literal('Compared'),
  name: z.string().regex(idPattern),
  title: z.string().optional(),
  value: z.string().regex(idPattern),
  reference: z.string().regex(idPattern),
  chart: z.array(GraphTypeEnum).min(1),
})

export const ReportSchema = z.discriminatedUnion('report_type', [
  SimpleGraphSchema,
  CompareGraphSchema,
])

// ─── Top-Level Protocol Schema ─────────────────────────────────────

export const ReviewProtocolSchema = z.object({
  project: z.object({
    short_name: z.string().regex(idPattern, 'Must be a valid identifier (letters, numbers, underscores)'),
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
  }),
  screening: ScreeningSchema.optional(),
  quality_assess: QASchema.optional(),
  category: z.array(CategorySchema).min(1, 'At least one data extraction field is required'),
  reporting: z.array(ReportSchema).optional(),
})

// ─── Exported Types ────────────────────────────────────────────────

export type ReviewProtocol = z.infer<typeof ReviewProtocolSchema>
export type ScreeningConfig = z.infer<typeof ScreeningSchema>
export type QAConfig = z.infer<typeof QASchema>
export type Category = z.infer<typeof CategorySchema>
export type FreeCategory = z.infer<typeof FreeCategorySchema>
export type StaticCategory = z.infer<typeof StaticCategorySchema>
export type Report = z.infer<typeof ReportSchema>
export type SimpleGraph = z.infer<typeof SimpleGraphSchema>
export type CompareGraph = z.infer<typeof CompareGraphSchema>
export type Phase = z.infer<typeof PhaseSchema>
export type Values = z.infer<typeof ValuesSchema>
export type Response = z.infer<typeof ResponseSchema>
