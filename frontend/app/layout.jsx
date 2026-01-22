import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KIFARU Research Dashboard',
  description: 'Climate Research Knowledge Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, backgroundColor: '#f8fafc' }}>
        {children}
      </body>
    </html>
  )
}
