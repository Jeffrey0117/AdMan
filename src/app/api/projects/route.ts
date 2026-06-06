import { NextRequest, NextResponse } from 'next/server'
import { getAll, create, PROJECTS_FILE } from '@/lib/storage'
import { CreateProjectSchema, type Project } from '@/lib/models'
import { generateProjectId } from '@/lib/id'
import { withAuth } from '@/lib/auth'

export async function GET() {
  try {
    const projects = await getAll<Project>(PROJECTS_FILE)
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const parsed = CreateProjectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const project: Project = {
      id: generateProjectId(),
      name: parsed.data.name,
      description: parsed.data.description ?? '',
      domain: parsed.data.domain,
      createdAt: now,
      updatedAt: now,
    }

    await create(PROJECTS_FILE, project)
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
})
