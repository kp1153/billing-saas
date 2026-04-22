import { getSession } from "@/lib/session.js"
import { db } from "@/lib/db.js"
import { customers, invoices } from "@/db/schema.js"
import { eq, and, sql } from "drizzle-orm"
import Link from "next/link"

export default async function GrahakPage() {
  const session = await getSession()

  const sabGrahak = await db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      bakaya: sql`coalesce(sum(case when ${invoices.status} = 'unpaid' then ${invoices.totalAmount} else 0 end), 0)`,
      kulBill: sql`coalesce(count(${invoices.id}), 0)`,
    })
    .from(customers)
    .leftJoin(
      invoices,
      and(eq(invoices.customerId, customers.id), eq(invoices.tenantId, session.tenantId))
    )
    .where(eq(customers.tenantId, session.tenantId))
    .groupBy(customers.id)

  const kulBakaya = sabGrahak.reduce((s, g) => s + Number(g.bakaya), 0)

  return (
    <div className="px-4 py-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">ग्राहक</h2>
        <Link href="/dashboard/grahak/naya" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl">
          + नया
        </Link>
      </div>

      {/* कुल बकाया summary */}
      {kulBakaya > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4 flex justify-between items-center">
          <p className="text-sm text-orange-700 font-medium">📋 कुल बकाया</p>
          <p className="text-lg font-bold text-orange-600">₹{kulBakaya}</p>
        </div>
      )}

      <div className="space-y-2">
        {sabGrahak.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">कोई ग्राहक नहीं</p>
        )}
        {sabGrahak.map((g) => (
          <div key={g.id} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-800">{g.name}</p>
              <p className="text-xs text-gray-400">{g.phone ?? "फोन नहीं"} • {g.kulBill} बिल</p>
            </div>
            <div className="text-right">
              {Number(g.bakaya) > 0 ? (
                <p className="text-sm font-bold text-orange-500">₹{g.bakaya} बाकी</p>
              ) : (
                <p className="text-xs text-green-500 font-medium">✓ क्लियर</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}