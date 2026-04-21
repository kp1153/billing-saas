import { getSession } from "@/lib/session.js"
import { db } from "@/lib/db.js"
import { products } from "@/db/schema.js"
import { eq } from "drizzle-orm"
import Link from "next/link"

export default async function SamanPage() {
  const session = await getSession()
  const sabSaman = await db
    .select()
    .from(products)
    .where(eq(products.tenantId, session.tenantId))

  return (
    <div className="px-4 py-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">सामान की सूची</h2>
        <Link href="/dashboard/saman/naya" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl">
          + नया
        </Link>
      </div>
      <div className="space-y-2">
        {sabSaman.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">कोई सामान नहीं — पहले सामान जोड़ें</p>
        )}
        {sabSaman.map((item) => (
          <div key={item.id} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-400">{item.unit} • GST {item.gstPercent}%</p>
            </div>
            <p className="text-sm font-bold text-blue-600">₹{item.pricePerUnit}</p>
          </div>
        ))}
      </div>
    </div>
  )
}