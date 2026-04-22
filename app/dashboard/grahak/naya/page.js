'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NayaGrahakPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ naam: '', phone: '', email: '', address: '' })

  async function submit() {
    if (!form.naam) return alert('नाम जरूरी है')
    setLoading(true)
    const res = await fetch('/api/grahak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push('/dashboard/grahak')
    } else {
      alert('कुछ गलत हुआ')
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => router.back()} className="text-gray-500 text-xl leading-none">←</button>
        <h2 className="text-lg font-bold text-gray-800">नया ग्राहक</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">नाम *</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ग्राहक का नाम"
            value={form.naam}
            onChange={(e) => setForm({ ...form, naam: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">फोन</label>
          <input
            type="tel"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="मोबाइल नंबर"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">ईमेल</label>
          <input
            type="email"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ईमेल (वैकल्पिक)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">पता</label>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="पता (वैकल्पिक)"
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <button
          onClick={submit}
          disabled={loading || !form.naam}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? 'सहेज रहे हैं...' : 'सहेजें'}
        </button>
      </div>
    </div>
  )
}