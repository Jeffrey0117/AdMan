import { NextRequest, NextResponse } from 'next/server'
import { getById, update, remove, PROJECTS_FILE, findByField, ADS_FILE } from '@/lib/storage'
import { UpdateProjectSchema, type Project } from '@/lib/models'
import type { Ad } from '@/lib/models'
import { withAuth } from '@/lib/auth'

type RouteParams = { params: Promise<{ projectId: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params
    const project = await getById<Project>(PROJECTS_FILE, projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export const PUT = withAuth<RouteParams>(async (request, { params }) => {
  try {
    const { projectId } = await params
    const body = await request.json()
    const parsed = UpdateProjectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const updated = await update<Project>(PROJECTS_FILE, projectId, {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    } as Partial<Project>)

    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
})

export const DELETE = withAuth<RouteParams>(async (_request, { params }) => {
  try {
    const { projectId } = await params

    // Check for associated ads
    const ads = await findByField<Ad>(ADS_FILE, 'projectId', projectId)
    if (ads.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete project with ${ads.length} associated ad(s). Delete ads first.` },
        { status: 409 }
      )
    }

    const deleted = await remove<Project>(PROJECTS_FILE, projectId)
    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
})
