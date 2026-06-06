/**
 * Auth middleware for AdMan API
 * Protects admin endpoints from unauthorized access
 */

import { NextRequest, NextResponse } from 'next/server'

const ADMIN_TOKEN = process.env.ADMAN_ADMIN_TOKEN

/**
 * Verify admin authorization from Bearer token
 */
export function verifyAuth(request: NextRequest): boolean {
  if (!ADMIN_TOKEN) {
    // If no token configured, reject all requests (secure by default)
    return false
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return false
  }

  // Support both "Bearer xxx" and raw token
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader

  return token === ADMIN_TOKEN
}

/**
 * Middleware wrapper for protected endpoints
 * Returns 401 if auth fails, otherwise calls handler
 * Generic over context so it works for both static and dynamic routes
 */
export function withAuth<Ctx = unknown>(
  handler: (request: NextRequest, context: Ctx) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: Ctx): Promise<NextResponse> => {
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Valid admin token required' },
        { status: 401 }
      )
    }
    return handler(request, context)
  }
}
