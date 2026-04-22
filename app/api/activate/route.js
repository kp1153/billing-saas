// app/api/activate/route.js

import { db } from '@/lib/db'
import { tenants } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, secret } = body

    // 1. Secret check
    if (!secret || secret !== process.env.HUB_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Email check
    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    // 3. Tenant खोजो
    const existing = await db
      .select()
      .from(tenants)
      .where(eq(tenants.ownerEmail, email))
      .limit(1)

    if (!existing.length) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // 4. Activate करो
    await db
      .update(tenants)
      .set({ isActive: true })
      .where(eq(tenants.ownerEmail, email))

    return NextResponse.json(
      { success: true, message: `${email} activated` },
      { status: 200 }
    )
  } catch (err) {
    console.error('[activate]', err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}