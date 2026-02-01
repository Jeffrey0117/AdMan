import { z } from 'zod'
import { AD_TYPES, AD_STATUSES, AD_POSITIONS } from './constants'

// ── Project ──────────────────────────────────────────────

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  domain: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Project = z.infer<typeof ProjectSchema>

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  domain: z.string().optional(),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

export const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  domain: z.string().optional(),
})

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>

// ── Ad Style ─────────────────────────────────────────────

export const AdStyleSchema = z.object({
  backgroundColor: z.string().default('#ffffff'),
  textColor: z.string().default('#000000'),
  ctaBackgroundColor: z.string().default('#2563eb'),
  ctaTextColor: z.string().default('#ffffff'),
  borderRadius: z.string().default('8px'),
  zIndex: z.number().default(9999),
  maxWidth: z.string().default('100%'),
  padding: z.string().default('16px'),
  customCSS: z.string().default(''),
})

export type AdStyle = z.infer<typeof AdStyleSchema>

// ── Ad ───────────────────────────────────────────────────

export const AdSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(AD_TYPES),
  status: z.enum(AD_STATUSES),
  position: z.enum(AD_POSITIONS),
  headline: z.string().min(1, 'Headline is required'),
  bodyText: z.string(),
  ctaText: z.string().min(1, 'CTA text is required'),
  ctaUrl: z.string().url('Must be a valid URL'),
  imageUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  style: AdStyleSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Ad = z.infer<typeof AdSchema>

export const CreateAdSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(AD_TYPES),
  status: z.enum(AD_STATUSES).default('draft'),
  position: z.enum(AD_POSITIONS),
  headline: z.string().min(1, 'Headline is required'),
  bodyText: z.string().default(''),
  ctaText: z.string().min(1, 'CTA text is required'),
  ctaUrl: z.string().url('Must be a valid URL'),
  imageUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  style: AdStyleSchema.optional(),
})

export type CreateAdInput = z.infer<typeof CreateAdSchema>

export const UpdateAdSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(AD_TYPES).optional(),
  status: z.enum(AD_STATUSES).optional(),
  position: z.enum(AD_POSITIONS).optional(),
  headline: z.string().min(1).optional(),
  bodyText: z.string().optional(),
  ctaText: z.string().min(1).optional(),
  ctaUrl: z.string().url().optional(),
  imageUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  style: AdStyleSchema.partial().optional(),
})

export type UpdateAdInput = z.infer<typeof UpdateAdSchema>
