import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
}

async function readJsonFile<T>(filename: string): Promise<T[]> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    const raw = await readFile(filePath, 'utf-8')
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  const tmpPath = `${filePath}.tmp`
  await writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  // Clean up tmp file (best effort)
  try {
    const { unlink } = await import('fs/promises')
    await unlink(tmpPath)
  } catch {
    // ignore
  }
}

// ── Generic CRUD ─────────────────────────────────────────

export interface HasId {
  id: string
}

export async function getAll<T extends HasId>(filename: string): Promise<T[]> {
  return readJsonFile<T>(filename)
}

export async function getById<T extends HasId>(
  filename: string,
  id: string
): Promise<T | null> {
  const items = await readJsonFile<T>(filename)
  return items.find((item) => item.id === id) ?? null
}

export async function create<T extends HasId>(
  filename: string,
  item: T
): Promise<T> {
  const items = await readJsonFile<T>(filename)
  const updated = [...items, item]
  await writeJsonFile(filename, updated)
  return item
}

// 🆕 批量建立 — 讀一次、全部 append、寫一次 (避免逐筆 create 的 N 次 IO + 競態)
export async function createMany<T extends HasId>(
  filename: string,
  newItems: T[]
): Promise<T[]> {
  if (newItems.length === 0) return []
  const items = await readJsonFile<T>(filename)
  const updated = [...items, ...newItems]
  await writeJsonFile(filename, updated)
  return newItems
}

export async function update<T extends HasId>(
  filename: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  const items = await readJsonFile<T>(filename)
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return null
  const updatedItem = { ...items[index], ...updates }
  const updatedItems = items.map((item, i) => (i === index ? updatedItem : item))
  await writeJsonFile(filename, updatedItems)
  return updatedItem
}

export async function remove<T extends HasId>(
  filename: string,
  id: string
): Promise<boolean> {
  const items = await readJsonFile<T>(filename)
  const filtered = items.filter((item) => item.id !== id)
  if (filtered.length === items.length) return false
  await writeJsonFile(filename, filtered)
  return true
}

export async function findByField<T extends HasId>(
  filename: string,
  field: keyof T,
  value: unknown
): Promise<T[]> {
  const items = await readJsonFile<T>(filename)
  return items.filter((item) => item[field] === value)
}

// ── File constants ───────────────────────────────────────

export const PROJECTS_FILE = 'projects.json'
export const ADS_FILE = 'ads.json'
export const SITES_FILE = 'sites.json'
