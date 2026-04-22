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

  const { naam, unit, daam, gst, stock, minStock } = await request.json()
  if (!naam || !daam) return NextResponse.json({ error: "नाम और दाम जरूरी है" }, { status: 400 })

  await db.insert(products).values({
    tenantId: session.tenantId,
    name: naam,
    unit: unit || 'pcs',
    pricePerUnit: parseInt(daam),
    gstPercent: parseInt(gst || 0),
    currentStock: parseInt(stock || 0),
    minStock: parseInt(minStock || 5),
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "अनधिकृत" }, { status: 401 })

  const { id, naam, daam, gst, stock, minStock } = await request.json()
  if (!id) return NextResponse.json({ error: "id जरूरी है" }, { status: 400 })

  await db
    .update(products)
    .set({
      ...(naam && { name: naam }),
      ...(daam && { pricePerUnit: parseInt(daam) }),
      ...(gst !== undefined && { gstPercent: parseInt(gst) }),
      ...(stock !== undefined && { currentStock: parseInt(stock) }),
      ...(minStock !== undefined && { minStock: parseInt(minStock) }),
    })
    .where(eq(products.id, id))

  return NextResponse.json({ success: true })
}