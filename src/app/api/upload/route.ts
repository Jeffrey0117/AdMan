import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { nanoid } from 'nanoid'
import { withAuth } from '@/lib/auth'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// SVG 移除：可內嵌 script，從同源 serve 出去就是 stored XSS
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

// Magic bytes 驗證：不信任 client 宣稱的 MIME type
function sniffImageType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47)
    return 'image/png'
  if (buffer.subarray(0, 4).toString('ascii') === 'GIF8') return 'image/gif'
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return 'image/webp'
  return null
}

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max size: 5MB' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // 真實格式以 magic bytes 為準，宣稱的 MIME 只當參考
    const sniffed = sniffImageType(buffer)
    if (!sniffed || !ALLOWED_TYPES[sniffed]) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    // 檔名完全不信任使用者輸入：隨機 ID + 由實際格式決定副檔名
    const ext = ALLOWED_TYPES[sniffed]
    const filename = `${Date.now()}-${nanoid(10)}.${ext}`
    const filePath = path.join(UPLOAD_DIR, filename)

    await writeFile(filePath, buffer)

    const url = `/uploads/${filename}`
    return NextResponse.json({ url, filename, ext, size: file.size }, { status: 201 })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
})
