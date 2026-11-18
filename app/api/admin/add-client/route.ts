import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  if (!url || !key) {
    return NextResponse.json({ error: 'Server key is missing' }, { status: 500 })
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Only platform admins may use this
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { data: adminRow } = await supabase
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (!adminRow) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  // Read and check the form
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const companyName = String(body.companyName ?? '').trim()
  const branchName = String(body.branchName ?? '').trim()
  const location = String(body.location ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const colorInput = String(body.brandColor ?? '')
  const brandColor = /^#[0-9a-fA-F]{6}$/.test(colorInput) ? colorInput : '#1D9E75'

  if (!companyName || !branchName || !email) {
    return NextResponse.json(
      { error: 'Company, branch and email are required' },
      { status: 400 }
    )
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    )
  }

  // 1. Create the client login
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError || !created.user) {
    return NextResponse.json(
      { error: 'Could not create login: ' + (createError ? createError.message : 'unknown') },
      { status: 400 }
    )
  }
  const newUserId = created.user.id

  // 2. Create the company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({ name: companyName })
    .select('id')
    .single()

  if (companyError || !company) {
    await supabase.auth.admin.deleteUser(newUserId)
    return NextResponse.json(
      { error: 'Could not create company: ' + (companyError ? companyError.message : 'unknown') },
      { status: 500 }
    )
  }

  // 3. Create the first branch
  const branchId = crypto.randomUUID()
  const { error: branchError } = await supabase.from('branches').insert({
    id: branchId,
    name: branchName,
    location: location || null,
    company_id: company.id,
    brand_color: brandColor,
  })

  if (branchError) {
    await supabase.from('companies').delete().eq('id', company.id)
    await supabase.auth.admin.deleteUser(newUserId)
    return NextResponse.json(
      { error: 'Could not create branch: ' + branchError.message },
      { status: 500 }
    )
  }

  // 4. Link the login to the company
  const { error: memberError } = await supabase
    .from('company_members')
    .insert({ user_id: newUserId, company_id: company.id })

  if (memberError) {
    await supabase.from('companies').delete().eq('id', company.id)
    await supabase.auth.admin.deleteUser(newUserId)
    return NextResponse.json(
      { error: 'Could not link login: ' + memberError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, companyId: company.id, branchId })
}
