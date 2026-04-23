import { google } from '@/lib/google.js'
import { db } from '@/lib/db.js'
import { tenants, users, preActivations } from '@/db/schema.js'
import { createSession, setSessionCookie } from '@/lib/session.js'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const WHITELIST = ['prasad.kamta@gmail.com']

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

    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1)

    if (user.length === 0) {
      const slug = googleUser.email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')

      await db.insert(tenants).values({
        name: googleUser.name,
        slug,
        ownerEmail: googleUser.email,
      })

      const newTenant = await db
        .select()
        .from(tenants)
        .where(eq(tenants.ownerEmail, googleUser.email))
        .limit(1)

      // pre_activations check — पहले pay किया, बाद में login
      const preAct = await db
        .select()
        .from(preActivations)
        .where(eq(preActivations.email, googleUser.email))
        .limit(1)

      if (preAct.length > 0) {
        await db
          .update(tenants)
          .set({ isActive: true })
          .where(eq(tenants.ownerEmail, googleUser.email))

        await db
          .delete(preActivations)
          .where(eq(preActivations.email, googleUser.email))
      }

      await db.insert(users).values({
        tenantId: newTenant[0].id,
        name: googleUser.name,
        email: googleUser.email,
        avatarUrl: googleUser.picture,
        role: 'owner',
      })

      user = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email))
        .limit(1)
    }

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

    // 1. Whitelist — हमेशा dashboard
    if (WHITELIST.includes(googleUser.email)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 2. Active tenant — dashboard
    if (tenant[0].isActive) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 3. Trial — 7 दिन के अंदर — dashboard
    const createdAt = new Date(tenant[0].createdAt.replace(' ', 'T'))
    const diffDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24)

    if (diffDays <= 7) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 4. Expired
    return NextResponse.redirect(new URL('/expired', request.url))

  } catch (e) {
    console.error('[callback]', e)
    return NextResponse.redirect(new URL('/login?error=failed', request.url))
  }
}