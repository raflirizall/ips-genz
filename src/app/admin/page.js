'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BookOpen, FolderOpen, Target, Users, TrendingUp, Plus } from 'lucide-react'

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
    { label: 'Materi', value: stats.materials, icon: BookOpen, color: 'from-blue-500 to-indigo-600', href: '/admin/materi' },
    { label: 'Kategori', value: stats.categories, icon: FolderOpen, color: 'from-green-500 to-emerald-600', href: '/admin/kategori' },
    { label: 'Kuis', value: stats.quizzes, icon: Target, color: 'from-pink-500 to-purple-600', href: '/admin/kuis' },
    { label: 'Siswa', value: stats.students, icon: Users, color: 'from-yellow-500 to-orange-600', href: '/admin/siswa' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-3 animate-spin">⚙️</div>
          <p className="text-gray-500 font-bold">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">
          📊 Dashboard Admin
        </h1>
        <p className="text-gray-500 font-bold">
          Kelola materi, kuis, dan siswa dari sini
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white shadow-xl hover:scale-105 transition-transform`}
            >
              <Icon size={28} className="mb-3" />
              <div className="text-3xl font-black mb-1">{card.value}</div>
              <div className="text-xs font-black opacity-90">{card.label}</div>
            </Link>
          )
        })}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-black text-gray-800 mb-4">⚡ Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/admin/materi/tambah"
            className="bg-white border-4 border-blue-100 hover:border-blue-300 rounded-2xl p-5 flex items-center gap-4 shadow-md hover:shadow-xl transition-all"
          >
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <Plus size={24} />
            </div>
            <div>
              <p className="font-black text-gray-800">Tambah Materi</p>
              <p className="text-xs text-gray-500 font-bold">Buat materi baru</p>
            </div>
          </Link>

          <Link
            href="/admin/kategori"
            className="bg-white border-4 border-green-100 hover:border-green-300 rounded-2xl p-5 flex items-center gap-4 shadow-md hover:shadow-xl transition-all"
          >
            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
              <FolderOpen size={24} />
            </div>
            <div>
              <p className="font-black text-gray-800">Kelola Kategori</p>
              <p className="text-xs text-gray-500 font-bold">Tambah kategori</p>
            </div>
          </Link>

          <Link
            href="/admin/siswa"
            className="bg-white border-4 border-yellow-100 hover:border-yellow-300 rounded-2xl p-5 flex items-center gap-4 shadow-md hover:shadow-xl transition-all"
          >
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="font-black text-gray-800">Lihat Siswa</p>
              <p className="text-xs text-gray-500 font-bold">Daftar siswa aktif</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="text-blue-500" size={24} />
          <h2 className="text-xl font-black text-gray-800">Aktivitas Terbaru</h2>
        </div>

        {recentResults.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-2">📭</div>
            <p className="text-gray-500 font-bold">Belum ada aktivitas kuis</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                    <Target size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-gray-800 truncate">
                      {result.profiles?.full_name || 'Siswa'}
                    </p>
                    <p className="text-xs text-gray-500 font-bold truncate">
                      {result.quizzes?.title || 'Kuis'}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className={`text-2xl font-black ${
                    result.score >= 80 ? 'text-green-500' :
                    result.score >= 60 ? 'text-blue-500' :
                    result.score >= 40 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {result.score}
                  </div>
                  <p className="text-[10px] font-black text-gray-400">NILAI</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}