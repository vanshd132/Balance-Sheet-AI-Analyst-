"use client";
import Link from 'next/link'
import { User, LogOut, Building2, BarChart3, UserCircle, ChevronDown } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [dropdown, setDropdown] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user')
      setUser(u ? JSON.parse(u) : null)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-3 font-bold text-xl text-primary-700 hover:text-primary-800 transition-colors">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg px-3 py-1.5 text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span>Balance</span>
          </div>
          <span className="text-primary-900">Sheet Analyst</span>
        </Link>
        
        <div className="flex items-center gap-1">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              pathname.startsWith('/dashboard') 
                ? 'bg-primary-100 text-primary-800 border border-primary-200' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </Link>
          <Link 
            href="/companies" 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              pathname.startsWith('/companies') 
                ? 'bg-primary-100 text-primary-800 border border-primary-200' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Companies
          </Link>
          <Link 
            href="/profile" 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              pathname.startsWith('/profile') 
                ? 'bg-primary-100 text-primary-800 border border-primary-200' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <UserCircle className="w-4 h-4" />
            Profile
          </Link>
          
          {user && (
            <div className="relative ml-2">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 text-primary-800 font-semibold hover:from-primary-100 hover:to-primary-200 transition-all border border-primary-200"
                onClick={() => setDropdown((d) => !d)}
              >
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {user.name?.split(' ').map(w => w[0]).join('').toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <span className="hidden md:inline">{user.name?.split(' ')[0]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdown ? 'rotate-180' : ''}`} />
              </button>
              {dropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</div>
                  </div>
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <UserCircle className="w-4 h-4" /> 
                    Profile
                  </Link>
                  <button
                    className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-red-50 text-red-600 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" /> 
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 