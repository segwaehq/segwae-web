import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyByOwner, createCompany, updateCompany } from '@/lib/hiring/queries'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const company = await getCompanyByOwner(user.id)
  return NextResponse.json({ company })
}

export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getCompanyByOwner(user.id)
  if (existing) return NextResponse.json({ error: 'Company already exists' }, { status: 409 })

  const body = await request.json()
  const { name, logo_url, industry, description, website, size, location } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Company name is required' }, { status: 400 })

  try {
    const company = await createCompany(user.id, { name, logo_url, industry, description, website, size, location })
    return NextResponse.json({ company }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to create company' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const company = await getCompanyByOwner(user.id)
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const body = await request.json()
  const { name, logo_url, industry, description, website, size, location } = body

  try {
    const updated = await updateCompany(company.id, { name, logo_url, industry, description, website, size, location })
    return NextResponse.json({ company: updated })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to update company' }, { status: 500 })
  }
}
