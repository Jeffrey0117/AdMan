import { nanoid } from 'nanoid'

export function generateProjectId(): string {
  return `proj_${nanoid(8)}`
}

export function generateAdId(): string {
  return `ad_${nanoid(8)}`
}

export function generateSiteId(): string {
  return `site_${nanoid(10)}`
}
