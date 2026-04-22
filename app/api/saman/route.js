import { db } from "@/lib/db.js"
import { products } from "@/db/schema.js"
import { getSession } from "@/lib/session.js"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "अनधिकृत" }, { status: 401 })

  const data = await db
    .select()
    .from(products)
    .where(eq(products.tenantId, session.tenantId))

  return NextResponse.json({ data })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "अनधिकृत" }, { status: 401 })

  const { naam, unit, daam, gst } = await request.json()
  if (!naam || !daam) return NextResponse.json({ error: "नाम और दाम जरूरी है" }, { status: 400 })

  await db.insert(products).values({
    tenantId: session.tenantId,
    name: naam,
    unit,
    pricePerUnit: parseInt(daam),
    gstPercent: parseInt(gst),
  })

  return NextResponse.json({ success: true })
}