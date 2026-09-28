'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  BookOpen, FolderOpen, Target, Users, TrendingUp, Plus, 
  ArrowRight, Sparkles, Rocket, Crown, Award, Compass,
  BarChart3, CheckCircle
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    materials: 0,
    categories: 0,
    quizzes: 0,
    students: 0,
  })
  const [recentResults, setRecentResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [mat, cat, qz, st] = await Promise.all([
        supabase.from('materials').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('quizzes').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      ])

      setStats({
        materials: mat.count || 0,
        categories: cat.count || 0,
        quizzes: qz.count || 0,
        students: st.count || 0,
      })

      const { data: results } = await supabase
        .from('quiz_results')
        .select(`
          *,
          profiles:student_id (full_name, class_name),
          quizzes:quiz_id (title)
        `)
        .order('completed_at', { ascending: false })
        .limit(5)

      setRecentResults(results || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

  const statCards = [
    { 
      label: 'Materi', value: stats.materials, icon: BookOpen, 
      gradient: 'from-violet-500 to-purple-600', 
      shadow: 'shadow-violet-300/50',
      href: '/admin/materi',
      emoji: '📚'
    },
    { 
      label: 'Kategori', value: stats.categories, icon: FolderOpen, 
      gradient: 'from-pink-500 to-rose-500', 
      shadow: 'shadow-pink-300/50',
      href: '/admin/kategori',
      emoji: '🗂️'
    },
    { 
      label: 'Kuis', value: stats.quizzes, icon: Target, 
      gradient: 'from-amber-400 to-orange-500', 
      shadow: 'shadow-amber-300/50',
      href: '/admin/kuis',
      emoji: '🎯'
    },
    { 
      label: 'Siswa', value: stats.students, icon: Users, 
      gradient: 'from-emerald-500 to-teal-500', 
      shadow: 'shadow-emerald-300/50',
      href: '/admin/siswa',
      emoji: '👥'
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-3 animate-bounce">🧭</div>
          <p className="text-violet-600 font-bold">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div>

      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black mb-3 shadow-lg shadow-violet-300/50">
          <Sparkles size={12} className="fill-yellow-300 text-yellow-300" />
          ADMIN PANEL
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-violet-900 mb-1">
          Dashboard Admin 🧭
        </h1>
        <p className="text-violet-500 font-bold text-sm">
          Kelola materi, kuis, dan siswa dari sini
        </p>
      </div>

      {/* ===== STATISTIK ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-4 text-white shadow-lg ${card.shadow} hover:scale-105 active:scale-95 transition-transform relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 text-6xl opacity-15 -mt-1 -mr-1">{card.emoji}</div>
              <div className="relative">
                <Icon size={22} className="mb-2" />
                <div className="text-3xl font-black mb-0.5">{card.value}</div>
                <div className="text-[10px] font-black uppercase tracking-wide opacity-90">{card.label}</div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ===== AKSI CEPAT ===== */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-1.5 rounded-xl shadow-md shadow-amber-300/50">
            <Rocket size={14} />
          </div>
          <h2 className="font-black text-violet-900 text-sm sm:text-base">⚡ Aksi Cepat</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/admin/materi/tambah"
            className="bg-white border-2 border-violet-200 hover:border-violet-400 rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-3 rounded-2xl shadow-md shadow-violet-300/50">
              <Plus size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-violet-900 text-sm">Tambah Materi</p>
              <p className="text-[10px] text-violet-500 font-bold">Buat materi baru</p>
            </div>
            <ArrowRight size={16} className="text-violet-400 flex-shrink-0" />
          </Link>

          <Link
            href="/admin/kategori"
            className="bg-white border-2 border-pink-200 hover:border-pink-400 rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white p-3 rounded-2xl shadow-md shadow-pink-300/50">
              <FolderOpen size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-violet-900 text-sm">Kelola Kategori</p>
              <p className="text-[10px] text-violet-500 font-bold">Tambah kategori</p>
            </div>
            <ArrowRight size={16} className="text-pink-400 flex-shrink-0" />
          </Link>

          <Link
            href="/admin/siswa"
            className="bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-3 rounded-2xl shadow-md shadow-emerald-300/50">
              <Users size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-violet-900 text-sm">Lihat Siswa</p>
              <p className="text-[10px] text-violet-500 font-bold">Daftar siswa aktif</p>
            </div>
            <ArrowRight size={16} className="text-emerald-400 flex-shrink-0" />
          </Link>
        </div>
      </div>

      {/* ===== AKTIVITAS TERBARU ===== */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-violet-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-gradient-to-br from-violet-500 to-pink-500 text-white p-2 rounded-xl shadow-md shadow-violet-300/50">
            <TrendingUp size={16} />
          </div>
          <h2 className="font-black text-violet-900 text-sm sm:text-base">Aktivitas Terbaru</h2>
          <span className="text-[10px] font-black bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full ml-auto">
            5 terbaru
          </span>
        </div>

        {recentResults.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-violet-700 font-black mb-1">Belum ada aktivitas kuis</p>
            <p className="text-violet-400 text-xs font-bold">
              Siswa akan muncul di sini setelah mengerjakan kuis
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentResults.map((result) => {
              const score = result.score
              const scoreGradient = 
                score >= 80 ? 'from-emerald-400 to-teal-500' :
                score >= 60 ? 'from-blue-400 to-cyan-500' :
                score >= 40 ? 'from-amber-400 to-orange-500' :
                'from-red-400 to-pink-500'

              return (
                <div
                  key={result.id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl border-2 border-violet-100"
                >
                  <div className="bg-gradient-to-br from-violet-500 to-pink-500 text-white p-2.5 rounded-2xl shadow-md flex-shrink-0">
                    <CheckCircle size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-violet-900 text-sm truncate">
                      {result.profiles?.full_name || 'Siswa'}
                    </p>
                    <p className="text-[10px] text-violet-500 font-bold truncate">
                      {result.quizzes?.title || 'Kuis'}
                    </p>
                  </div>
                  <div className={`bg-gradient-to-br ${scoreGradient} text-white rounded-2xl px-3 py-2 shadow-lg flex-shrink-0 min-w-[55px] text-center`}>
                    <div className="text-xl font-black leading-none">{score}</div>
                    <div className="text-[8px] font-black opacity-90 mt-0.5">NILAI</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}