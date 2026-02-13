import type { WidgetCategory } from './constants'
import type { LoginFormConfig, FeedbackFormConfig } from './models'

export const DEFAULT_LOGIN_CONFIG: LoginFormConfig = {
  title: 'Login',
  subtitle: '',
  fields: [
    { name: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
    { name: 'password', type: 'password', label: 'Password', placeholder: '', required: true },
  ],
  submitText: 'Sign In',
  submitUrl: '',
  successRedirect: '',
  showSocialLogins: false,
  socialLogins: [],
  showRegisterLink: true,
  registerUrl: '',
  showForgotPassword: true,
  forgotPasswordUrl: '',
}

export const DEFAULT_FEEDBACK_CONFIG: FeedbackFormConfig = {
  title: 'Feedback',
  subtitle: '',
  fields: [
    { name: 'name', type: 'text', label: 'Name', placeholder: 'Your name', required: true },
    { name: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
    { name: 'message', type: 'textarea', label: 'Message', placeholder: 'Your feedback...', required: true },
  ],
  submitText: 'Send Feedback',
  submitUrl: '',
  successMessage: 'Thank you for your feedback!',
}

export function getDefaultWidgetConfig(category: WidgetCategory): Record<string, unknown> | undefined {
  switch (category) {
    case 'login-form':
      return DEFAULT_LOGIN_CONFIG as unknown as Record<string, unknown>
    case 'feedback-form':
      return DEFAULT_FEEDBACK_CONFIG as unknown as Record<string, unknown>
    default:
      return undefined
  }
}
