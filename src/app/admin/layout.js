'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, logout } from '@/lib/auth'
import { LayoutDashboard, BookOpen, Target, Users, LogOut, Home, Menu, X, FolderOpen } from 'lucide-react'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      const current = await getCurrentUser()

      if (!current) {
        router.push('/login')
        return
      }

      if (current.profile?.role !== 'admin') {
        alert('Akses ditolak. Halaman ini khusus admin.')
        router.push('/')
        return
      }

      setProfile(current.profile)
      setLoading(false)
    }
    checkAdmin()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
    router.refresh()
  }

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/materi', label: 'Materi', icon: BookOpen },
    { href: '/admin/kategori', label: 'Kategori', icon: FolderOpen },
    { href: '/admin/kuis', label: 'Kuis & Soal', icon: Target },
    { href: '/admin/siswa', label: 'Siswa', icon: Users },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-spin">⚙️</div>
          <p className="text-gray-600 font-bold">Memeriksa akses admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ===== SIDEBAR DESKTOP ===== */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-2xl">
        <div className="p-6 border-b border-blue-500/30">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🦎</span>
            <div>
              <h1 className="font-black text-lg leading-none">IPS GenZ</h1>
              <p className="text-[10px] text-blue-200 font-bold mt-0.5">ADMIN PANEL</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-blue-100 hover:bg-blue-500/30'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-blue-500/30 space-y-2">
          <div className="bg-blue-500/30 rounded-xl p-3">
            <p className="text-xs text-blue-200 font-bold">Login sebagai:</p>
            <p className="font-black truncate">{profile?.full_name || 'Admin'}</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-blue-100 hover:bg-blue-500/30 transition-all"
          >
            <Home size={20} />
            <span>Ke Home Siswa</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-200 hover:bg-red-500/30 transition-all"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 flex items-center justify-between z-40 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦎</span>
          <span className="font-black">IPS GenZ Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-blue-500/30"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ===== MOBILE SIDEBAR ===== */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)}>
          <aside
            className="w-72 h-full bg-gradient-to-b from-blue-600 to-indigo-700 text-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 pt-12">
              <p className="text-xs text-blue-200 font-bold">Login sebagai:</p>
              <p className="font-black">{profile?.full_name || 'Admin'}</p>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : 'text-blue-100 hover:bg-blue-500/30'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="mt-6 pt-6 border-t border-blue-500/30 space-y-2">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-blue-100"
              >
                <Home size={20} />
                <span>Ke Home Siswa</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-200"
              >
                <LogOut size={20} />
                <span>Keluar</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 md:ml-0 pt-16 md:pt-0 overflow-x-hidden">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}