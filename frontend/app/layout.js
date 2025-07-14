import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Balance Sheet Analyst - AI-Powered Financial Analysis',
  description: 'Chat-GPT for Balance-Sheet analysts with role-based access and AI-powered insights',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-blue-50 pt-16 min-h-screen'}>
        <Navbar />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
} 