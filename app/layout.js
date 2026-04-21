import "./globals.css"

export const metadata = {
  title: "निशांत बिलिंग",
  description: "सबसे आसान हिंदी बिलिंग सॉफ्टवेयर",
}

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}