'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, logout } from '@/lib/auth'
import { 
  LayoutDashboard, BookOpen, Target, Users, LogOut, Home, Menu, X, 
  FolderOpen, Sparkles, Crown 
} from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce">🧭</div>
          <p className="text-violet-600 font-bold">Memeriksa akses admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50 flex">

      {/* ===== SIDEBAR DESKTOP ===== */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-300/50">
        <div className="p-5 border-b border-white/20">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-2xl border border-white/30 shadow-lg">
              <span className="text-2xl">🧭</span>
            </div>
            <div>
              <h1 className="font-black text-lg leading-none">IPS GenZ</h1>
              <p className="text-[10px] text-white/80 font-bold mt-0.5">ADMIN PANEL</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                  isActive
                    ? 'bg-white text-violet-600 shadow-lg scale-105'
                    : 'text-white/90 hover:bg-white/15'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && <Sparkles size={14} className="ml-auto fill-amber-400 text-amber-400" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/20 space-y-2">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
            <p className="text-[10px] text-white/80 font-bold flex items-center gap-1">
              <Crown size={10} className="fill-yellow-300 text-yellow-300" />
              Login sebagai:
            </p>
            <p className="font-black truncate text-sm mt-0.5">{profile?.full_name || 'Admin'}</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl font-black text-sm text-white/90 hover:bg-white/15 transition-all"
          >
            <Home size={18} />
            <span>Ke Home Siswa</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl font-black text-sm text-red-200 hover:bg-red-500/30 transition-all"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white p-3 flex items-center justify-between z-40 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-xl border border-white/30">
            <span className="text-lg">🧭</span>
          </div>
          <span className="font-black text-sm">IPS GenZ Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-white/20 active:scale-95 transition-transform"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ===== MOBILE SIDEBAR ===== */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setSidebarOpen(false)}>
          <aside
            className="w-72 h-full bg-gradient-to-b from-violet-600 via-purple-600 to-pink-600 text-white p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 pt-14">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                <p className="text-[10px] text-white/80 font-bold flex items-center gap-1">
                  <Crown size={10} className="fill-yellow-300 text-yellow-300" />
                  Login sebagai:
                </p>
                <p className="font-black truncate text-sm mt-0.5">{profile?.full_name || 'Admin'}</p>
              </div>
            </div>
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                      isActive
                        ? 'bg-white text-violet-600 shadow-lg'
                        : 'text-white/90 hover:bg-white/15'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {isActive && <Sparkles size={14} className="ml-auto fill-amber-400 text-amber-400" />}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-6 pt-6 border-t border-white/20 space-y-2">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl font-black text-sm text-white/90 hover:bg-white/15"
              >
                <Home size={18} />
                <span>Ke Home Siswa</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl font-black text-sm text-red-200 hover:bg-red-500/30"
              >
                <LogOut size={18} />
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