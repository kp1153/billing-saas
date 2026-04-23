import { db } from '@/lib/db'
import { tenants, preActivations } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization')
    const body = await req.json()
    const { email, secret } = body

    const secretValid =
      authHeader === `Bearer ${process.env.HUB_SECRET}` ||
      secret === process.env.HUB_SECRET

    if (!secretValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const existing = await db
      .select()
      .from(tenants)
      .where(eq(tenants.ownerEmail, email))
      .limit(1)

    if (!existing.length) {
      // Tenant नहीं है — pre_activations में save करो
      try {
        await db.insert(preActivations).values({ email })
      } catch (_) {
        // already exists — ignore
      }
      return NextResponse.json({ success: true, message: 'pre-activated' })
    }

    await db
      .update(tenants)
      .set({ isActive: true })
      .where(eq(tenants.ownerEmail, email))

    return NextResponse.json({ success: true, message: `${email} activated` })

  } catch (err) {
    console.error('[activate]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}