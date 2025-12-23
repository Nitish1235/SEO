import { z } from 'zod'

export const urlSchema = z.string().url('Please enter a valid URL')

export const keywordSchema = z
  .string()
  .min(1, 'Keyword is required')
  .max(100, 'Keyword must be less than 100 characters')

export const analyzeRequestSchema = z.object({
  url: urlSchema,
  type: z.enum(['instant', 'full']).default('instant'),
})

export const keywordResearchSchema = z.object({
  keyword: keywordSchema,
})

export const competitorAnalysisSchema = z.object({
  method: z.enum(['keyword', 'url']),
  keyword: keywordSchema.optional(),
  url: urlSchema.optional(),
})

