"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NayaSamanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    naam: "", unit: "pcs", daam: "", gst: "0"
  })

  async function submit() {
    setLoading(true)
    await fetch("/api/saman", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam: form.naam, unit: form.unit, daam: form.daam, gst: form.gst }),
    })
    router.push("/dashboard/saman")
  }

  return (
    <div className="px-4 py-5">
      <h2 className="text-lg font-bold text-gray-800 mb-5">नया सामान जोड़ें</h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">सामान का नाम</label>
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
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
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
          <label className="text-xs text-gray-500 mb-1 block">दाम (₹)</label>
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
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
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