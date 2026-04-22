'use client'
import { useState, useEffect, useRef } from 'react'

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    gstin: '',
    logoUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setForm({
          name: d.data.name || '',
          phone: d.data.phone || '',
          address: d.data.address || '',
          gstin: d.data.gstin || '',
          logoUrl: d.data.logoUrl || '',
        })
        setLoading(false)
      })
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleLogo(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return alert('Logo 2MB से छोटा होना चाहिए')

    setLogoUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setForm((f) => ({ ...f, logoUrl: reader.result }))
      setLogoUploading(false)
    }
    reader.readAsDataURL(file)
  }

  async function save() {
    setSaving(true)
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      alert('कुछ गलत हुआ')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-400 text-sm">लोड हो रहा है...</p>
    </div>
  )

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-5">दुकान की सेटिंग</h2>

      {/* Logo */}
      <div className="mb-5 flex flex-col items-center gap-3">
        <div
          onClick={() => fileRef.current.click()}
          className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-white cursor-pointer overflow-hidden"
        >
          {form.logoUrl ? (
            <img src={form.logoUrl} alt="logo" className="w-full h-full object-contain" />
          ) : (
            <span className="text-3xl">🏪</span>
          )}
        </div>
        <button
          onClick={() => fileRef.current.click()}
          className="text-xs text-blue-500 border border-blue-200 px-3 py-1.5 rounded-lg"
        >
          {logoUploading ? 'अपलोड हो रहा है...' : 'Logo बदलें'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
        <p className="text-xs text-gray-400">PNG, JPG — अधिकतम 2MB</p>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">दुकान / व्यवसाय का नाम *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
            placeholder="जैसे: राम जनरल स्टोर"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">मोबाइल नंबर</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            type="tel"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
            placeholder="9876543210"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">पता</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none"
            placeholder="दुकान का पूरा पता"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">GSTIN (वैकल्पिक)</label>
          <input
            name="gstin"
            value={form.gstin}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm uppercase"
            placeholder="22AAAAA0000A1Z5"
            maxLength={15}
          />
          <p className="text-xs text-gray-400 mt-1">15 अंकों का GST नंबर — बिल पर छपेगा</p>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving || !form.name}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {saving ? 'सेव हो रहा है...' : saved ? '✓ सेव हो गया!' : 'सेव करें'}
      </button>
    </div>
  )
}