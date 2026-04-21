import { google } from '@/lib/google.js'
import { db } from '@/lib/db.js'
import { tenants, users } from '@/db/schema.js'
import { createSession, setSessionCookie } from '@/lib/session.js'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const cookieStore = await cookies()
  const savedState = cookieStore.get('google_state')?.value
  const codeVerifier = cookieStore.get('google_code_verifier')?.value

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url))
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier)
    const accessToken = tokens.accessToken()

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const googleUser = await userRes.json()

    // user ढूंढो
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1)

    if (user.length === 0) {
      // slug बनाओ
      const slug = googleUser.email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')

      // tenant बनाओ
      await db.insert(tenants).values({
        name: googleUser.name,
        slug,
        ownerEmail: googleUser.email,
      })

      // tenant fetch करो
      const newTenant = await db
        .select()
        .from(tenants)
        .where(eq(tenants.ownerEmail, googleUser.email))
        .limit(1)

      // user बनाओ
      await db.insert(users).values({
        tenantId: newTenant[0].id,
        name: googleUser.name,
        email: googleUser.email,
        avatarUrl: googleUser.picture,
        role: 'owner',
      })

      // user fetch करो
      user = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email))
        .limit(1)
    }

    // tenant fetch करो
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, user[0].tenantId))
      .limit(1)

    const token = await createSession({
      userId: user[0].id,
      tenantId: user[0].tenantId,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role,
      plan: tenant[0].plan,
      isActive: tenant[0].isActive,
    })

    await setSessionCookie(token)

    // HUB_SECRET वाला super admin
    if (googleUser.email === process.env.HUB_SECRET) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (tenant[0].isActive) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Trial — 7 दिन
    const createdAt = new Date(tenant[0].createdAt.replace(' ', 'T'))
    const now = new Date()
    const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24)

    if (diffDays <= 7) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.redirect(new URL('/expired', request.url))

  } catch (e) {
    console.error(e)
    return NextResponse.redirect(new URL('/login?error=failed', request.url))
  }
}