'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { ArrowLeft, Trophy, BookOpen, Target, TrendingUp, Star, Award, CheckCircle, Clock } from 'lucide-react'

export default function ProgressPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [quizResults, setQuizResults] = useState([])
  const [totalMaterials, setTotalMaterials] = useState(0)
  const [completedMaterials, setCompletedMaterials] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const current = await getCurrentUser()

      if (!current) {
        router.push('/login')
        return
      }

      setUser(current.user)
      setProfile(current.profile)

      // Total materi
      const { count: totalCount } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      setTotalMaterials(totalCount || 0)

      // Progress siswa
      const { data: progressData } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', current.user.id)
        .eq('is_completed', true)

      setCompletedMaterials(progressData?.length || 0)

      // Riwayat kuis
      const { data: results } = await supabase
        .from('quiz_results')
        .select(`
          *,
          quizzes (
            title,
            materials (title, slug, categories(name, icon))
          )
        `)
        .eq('student_id', current.user.id)
        .order('completed_at', { ascending: false })

      setQuizResults(results || [])
      setLoading(false)
    }
    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-wiggle">🦎</div>
          <p className="text-gray-600 font-bold">Memuat progress...</p>
        </div>
      </div>
    )
  }

  // Hitung statistik
  const progressPercent = totalMaterials > 0
    ? Math.round((completedMaterials / totalMaterials) * 100)
    : 0

  const avgScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
    : 0

  const bestScore = quizResults.length > 0
    ? Math.max(...quizResults.map((r) => r.score))
    : 0

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-blue-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-blue-50 border-blue-200'
    if (score >= 40) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-pink-50">

      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-md border-b-4 border-yellow-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-2xl transition-colors flex items-center gap-1.5 font-bold text-gray-700"
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">Kembali</span>
          </button>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">📊</span>
            <span className="font-black text-gray-700">Progress Belajar</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* SAPAAN */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-wiggle inline-block">🏆</div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">
            Halo, {profile?.full_name?.split(' ')[0] || 'Sahabat'}! 👋
          </h1>
          <p className="text-gray-500 font-bold">
            Ini progress belajarmu sejauh ini
          </p>
          {profile?.class_name && (
            <div className="inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 px-4 py-1.5 rounded-full text-sm font-black mt-3">
              🏫 Kelas {profile.class_name}
            </div>
          )}
        </div>

        {/* STATISTIK UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} />
              <span className="text-xs font-black">RATA-RATA NILAI</span>
            </div>
            <div className="text-5xl font-black mb-1">{avgScore}</div>
            <div className="text-xs text-white/80 font-bold">
              dari {quizResults.length} kuis
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} />
              <span className="text-xs font-black">NILAI TERTINGGI</span>
            </div>
            <div className="text-5xl font-black mb-1">{bestScore}</div>
            <div className="text-xs text-white/80 font-bold">
              {bestScore >= 80 ? 'Luar biasa! 🏆' : 'Terus tingkatkan! 💪'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} />
              <span className="text-xs font-black">KUIS SELESAI</span>
            </div>
            <div className="text-5xl font-black mb-1">{quizResults.length}</div>
            <div className="text-xs text-white/80 font-bold">
              kuis dikerjakan
            </div>
          </div>
        </div>

        {/* PROGRESS MATERI */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-yellow-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-orange-500" size={24} />
            <h2 className="text-xl font-black text-gray-800">Progress Materi</h2>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 h-8 rounded-full overflow-hidden mb-3 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 transition-all duration-1000 flex items-center justify-end pr-3"
              style={{ width: `${Math.max(progressPercent, 8)}%` }}
            >
              <span className="text-white font-black text-sm">{progressPercent}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 font-bold">
              📚 {completedMaterials} dari {totalMaterials} materi selesai
            </span>
            {progressPercent === 100 && (
              <span className="text-green-500 font-black flex items-center gap-1">
                <CheckCircle size={16} />
                Semua selesai!
              </span>
            )}
          </div>
        </div>

        {/* RIWAYAT KUIS */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-pink-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-pink-500" size={24} />
            <h2 className="text-xl font-black text-gray-800">Riwayat Kuis</h2>
          </div>

          {quizResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-3">📝</div>
              <p className="text-gray-500 font-bold mb-2">Belum ada riwayat kuis</p>
              <p className="text-gray-400 text-sm font-medium mb-4">
                Ayo kerjakan kuis pertamamu!
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform inline-flex items-center gap-2"
              >
                <BookOpen size={18} />
                Mulai Belajar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {quizResults.map((result) => {
                const material = result.quizzes?.materials
                const category = material?.categories

                return (
                  <div
                    key={result.id}
                    className={`p-4 rounded-2xl border-4 ${getScoreBg(result.score)}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{category?.icon || '📚'}</span>
                          <span className="text-xs font-black text-gray-500">
                            {category?.name}
                          </span>
                        </div>
                        <p className="font-black text-gray-800 truncate">
                          {result.quizzes?.title || material?.title || 'Kuis'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-bold mt-1">
                          <span className="flex items-center gap-1">
                            <CheckCircle size={12} />
                            {result.correct_count} benar
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(result.completed_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-black ${getScoreColor(result.score)}`}>
                          {result.score}
                        </div>
                        <div className="text-[10px] font-black text-gray-400">
                          NILAI
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            LANJUT BELAJAR
          </button>
        </div>

      </main>

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}