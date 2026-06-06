import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'

/** Token 驗證 probe：通過 withAuth 就代表 token 有效 */
export const GET = withAuth(async () => {
  return NextResponse.json({ ok: true })
})
