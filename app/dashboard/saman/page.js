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

  const kamStockWale = sabSaman.filter(s => s.currentStock <= s.minStock)

  return (
    <div className="px-4 py-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">सामान की सूची</h2>
        <Link href="/dashboard/saman/naya" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl">
          + नया
        </Link>
      </div>

      {/* कम स्टॉक चेतावनी */}
      {kamStockWale.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm font-semibold text-red-700 mb-1">⚠️ कम स्टॉक</p>
          {kamStockWale.map(s => (
            <p key={s.id} className="text-xs text-red-600">
              {s.name} — सिर्फ {s.currentStock} {s.unit} बचा
            </p>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {sabSaman.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">कोई सामान नहीं — पहले सामान जोड़ें</p>
        )}
        {sabSaman.map((item) => (
          <div key={item.id} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-400">{item.unit} • GST {item.gstPercent}%</p>
              <p className={`text-xs font-medium mt-0.5 ${
                item.currentStock <= item.minStock ? 'text-red-500' : 'text-green-600'
              }`}>
                स्टॉक: {item.currentStock} {item.unit}
              </p>
            </div>
            <p className="text-sm font-bold text-blue-600">₹{item.pricePerUnit}</p>
          </div>
        ))}
      </div>
    </div>
  )
}