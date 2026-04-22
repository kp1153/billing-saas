"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NayaSamanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    naam: "", unit: "pcs", daam: "", gst: "0", stock: "0", minStock: "5"
  })

  async function submit() {
    if (!form.naam || !form.daam) return alert('नाम और दाम जरूरी है')
    setLoading(true)
    const res = await fetch("/api/saman", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push("/dashboard/saman")
    } else {
      alert('कुछ गलत हुआ')
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => router.back()} className="text-gray-500 text-xl leading-none">←</button>
        <h2 className="text-lg font-bold text-gray-800">नया सामान जोड़ें</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">सामान का नाम *</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="जैसे: लड्डू, चावल, कमीज़"
            value={form.naam}
            onChange={(e) => setForm({ ...form, naam: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">इकाई (Unit)</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          >
            <option value="pcs">नग (Pcs)</option>
            <option value="kg">किलो (KG)</option>
            <option value="g">ग्राम (G)</option>
            <option value="ltr">लीटर (Ltr)</option>
            <option value="mtr">मीटर (Mtr)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">दाम (₹) *</label>
          <input
            type="number"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            value={form.daam}
            onChange={(e) => setForm({ ...form, daam: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">GST (%)</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
            value={form.gst}
            onChange={(e) => setForm({ ...form, gst: e.target.value })}
          >
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>

        {/* नया — Stock */}
        <div className="bg-blue-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">📦 स्टॉक ट्रैकिंग</p>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">शुरुआती स्टॉक</label>
            <input
              type="number"
              min="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white"
              placeholder="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">कम स्टॉक चेतावनी (न्यूनतम)</label>
            <input
              type="number"
              min="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white"
              placeholder="5"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: e.target.value })}
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading || !form.naam || !form.daam}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "सहेज रहे हैं..." : "सहेजें"}
        </button>
      </div>
    </div>
  )
}