import { z } from 'zod'
import { AD_TYPES, AD_STATUSES, AD_POSITIONS, WIDGET_CATEGORIES } from './constants'

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

// ── Widget Config Schemas ────────────────────────────────

export const LoginFormFieldSchema = z.object({
  name: z.string(),
  type: z.enum(['email', 'password', 'text']),
  label: z.string(),
  placeholder: z.string().default(''),
  required: z.boolean().default(true),
})

export type LoginFormField = z.infer<typeof LoginFormFieldSchema>

export const LoginFormConfigSchema = z.object({
  title: z.string().default('Login'),
  subtitle: z.string().default(''),
  fields: z.array(LoginFormFieldSchema).default([
    { name: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
    { name: 'password', type: 'password', label: 'Password', placeholder: '', required: true },
  ]),
  submitText: z.string().default('Sign In'),
  submitUrl: z.string().default(''),
  successRedirect: z.string().default(''),
  showSocialLogins: z.boolean().default(false),
  socialLogins: z.array(z.enum(['google', 'github', 'facebook'])).default([]),
  showRegisterLink: z.boolean().default(true),
  registerUrl: z.string().default(''),
  showForgotPassword: z.boolean().default(true),
  forgotPasswordUrl: z.string().default(''),
})

export type LoginFormConfig = z.infer<typeof LoginFormConfigSchema>

export const FeedbackFieldSchema = z.object({
  name: z.string(),
  type: z.enum(['text', 'email', 'textarea', 'rating']),
  label: z.string(),
  placeholder: z.string().default(''),
  required: z.boolean().default(true),
})

export type FeedbackField = z.infer<typeof FeedbackFieldSchema>

export const FeedbackFormConfigSchema = z.object({
  title: z.string().default('Feedback'),
  subtitle: z.string().default(''),
  fields: z.array(FeedbackFieldSchema).default([
    { name: 'name', type: 'text', label: 'Name', placeholder: 'Your name', required: true },
    { name: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
    { name: 'message', type: 'textarea', label: 'Message', placeholder: 'Your feedback...', required: true },
  ]),
  submitText: z.string().default('Send Feedback'),
  submitUrl: z.string().default(''),
  successMessage: z.string().default('Thank you for your feedback!'),
})

export type FeedbackFormConfig = z.infer<typeof FeedbackFormConfigSchema>

export const WidgetConfigSchema = z.union([
  LoginFormConfigSchema,
  FeedbackFormConfigSchema,
])

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>

// ── Ad ───────────────────────────────────────────────────

export const AdSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().min(1, 'Name is required'),
  category: z.enum(WIDGET_CATEGORIES).default('ad'),
  type: z.enum(AD_TYPES),
  status: z.enum(AD_STATUSES),
  position: z.enum(AD_POSITIONS),
  // Ad-specific fields (optional for widget categories)
  headline: z.string().default(''),
  bodyText: z.string().default(''),
  ctaText: z.string().default(''),
  ctaUrl: z.string().default(''),
  imageUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  // Widget-specific config
  widgetConfig: z.record(z.string(), z.unknown()).optional(),
  style: AdStyleSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Ad = z.infer<typeof AdSchema>

export const CreateAdSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Name is required'),
  category: z.enum(WIDGET_CATEGORIES).default('ad'),
  type: z.enum(AD_TYPES).default('bottom-banner'),
  status: z.enum(AD_STATUSES).default('draft'),
  position: z.enum(AD_POSITIONS),
  // Ad-specific fields
  headline: z.string().default(''),
  bodyText: z.string().default(''),
  ctaText: z.string().default(''),
  ctaUrl: z.string().default(''),
  imageUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  // Widget-specific config
  widgetConfig: z.record(z.string(), z.unknown()).optional(),
  style: AdStyleSchema.optional(),
})

export type CreateAdInput = z.infer<typeof CreateAdSchema>

export const UpdateAdSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(WIDGET_CATEGORIES).optional(),
  type: z.enum(AD_TYPES).optional(),
  status: z.enum(AD_STATUSES).optional(),
  position: z.enum(AD_POSITIONS).optional(),
  headline: z.string().optional(),
  bodyText: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  widgetConfig: z.record(z.string(), z.unknown()).optional(),
  style: AdStyleSchema.partial().optional(),
})

export type UpdateAdInput = z.infer<typeof UpdateAdSchema>
