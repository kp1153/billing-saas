export default function ExpiredPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-4">⏰</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">परीक्षण अवधि समाप्त</h1>
        <p className="text-gray-500 text-sm mb-6">
          आपके 7 दिन का मुफ़्त परीक्षण समाप्त हो गया है।<br />
          सॉफ्टवेयर जारी रखने के लिए योजना लें।
        </p>
        <a
          href="https://wa.me/917XXXXXXXXX?text=निशांत बिलिंग — योजना लेनी है"
          className="block w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition"
        >
          WhatsApp पर संपर्क करें
        </a>
      </div>
    </main>
  )
}