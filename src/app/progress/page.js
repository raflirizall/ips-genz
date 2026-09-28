'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { 
  ArrowLeft, Trophy, BookOpen, Target, TrendingUp, Star, Award, 
  CheckCircle, Clock, Sparkles, Rocket, Gem, Crown, Flame, Compass,
  BarChart3, Medal, Users
} from 'lucide-react'

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

      const { count: totalCount } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      setTotalMaterials(totalCount || 0)

      const { data: progressData } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', current.user.id)
        .eq('is_completed', true)

      setCompletedMaterials(progressData?.length || 0)

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce">🧭</div>
          <p className="text-violet-600 font-bold">Memuat progress...</p>
        </div>
      </div>
    )
  }

  const progressPercent = totalMaterials > 0
    ? Math.round((completedMaterials / totalMaterials) * 100)
    : 0

  const avgScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
    : 0

  const bestScore = quizResults.length > 0
    ? Math.max(...quizResults.map((r) => r.score))
    : 0

  const xp = completedMaterials * 100
  const level = Math.floor(xp / 500) + 1
  const xpInLevel = xp % 500
  const xpPercent = (xpInLevel / 500) * 100

  const getLevelTitle = (lvl) => {
    if (lvl === 1) return 'Pemula IPS! 🌱'
    if (lvl === 2) return 'Petualang IPS! 🧭'
    if (lvl === 3) return 'Penjelajah IPS! 🗺️'
    if (lvl === 4) return 'Ahli IPS! 🎯'
    return 'Master IPS! 👑'
  }

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-emerald-400 to-teal-500'
    if (score >= 60) return 'from-blue-400 to-cyan-500'
    if (score >= 40) return 'from-amber-400 to-orange-500'
    return 'from-red-400 to-pink-500'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'from-emerald-50 to-teal-50 border-emerald-200'
    if (score >= 60) return 'from-blue-50 to-cyan-50 border-blue-200'
    if (score >= 40) return 'from-amber-50 to-orange-50 border-amber-200'
    return 'from-red-50 to-pink-50 border-red-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-amber-50">

      {/* ===== HEADER ===== */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-violet-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="bg-violet-100 hover:bg-violet-200 text-violet-700 p-2.5 rounded-2xl transition-colors flex items-center gap-1.5 font-black active:scale-95"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="bg-gradient-to-br from-violet-500 to-pink-500 p-1.5 rounded-xl shadow-md shadow-violet-300/50">
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="font-black text-violet-900 text-sm truncate">Progress Belajar</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {/* ===== SAPAAN ===== */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl shadow-violet-300/50 mb-3">
            <span className="text-4xl">🧭</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-violet-900 mb-1">
            Halo, {profile?.full_name?.split(' ')[0] || 'Sahabat'}! 👋
          </h1>
          <p className="text-violet-500 font-bold text-sm">
            Ini progress belajarmu sejauh ini
          </p>
          {profile?.class_name && (
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-100 to-pink-100 border-2 border-violet-200 text-violet-700 px-3 py-1.5 rounded-full text-xs font-black mt-3">
              <Users size={12} />
              Kelas {profile.class_name}
            </div>
          )}
        </div>

        {/* ===== LEVEL CARD ===== */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-5 text-white mb-4 relative overflow-hidden shadow-xl shadow-purple-300/40">
          <div className="absolute top-0 right-0 text-8xl opacity-15 rotate-12 -mt-2 -mr-2">🧭</div>
          <div className="absolute bottom-0 left-0 text-7xl opacity-15 -rotate-12 -mb-2 -ml-2">✨</div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="bg-white/25 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border border-white/30">
                <Crown size={10} className="fill-yellow-300 text-yellow-300" />
                LEVEL {level}
              </div>
              <div className="bg-white/25 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border border-white/30">
                <Gem size={10} className="fill-cyan-300 text-cyan-300" />
                {xp} XP
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black mb-1">
              {getLevelTitle(level)}
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-bold opacity-90 mb-1">
                <span>Menuju Level {level + 1}</span>
                <span>{xpInLevel}/500 XP</span>
              </div>
              <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(xpPercent, 3)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== STATISTIK UTAMA ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-gradient-to-br from-violet-500 to-pink-500 rounded-3xl p-4 shadow-lg shadow-violet-300/40 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-6xl opacity-15 -mt-1 -mr-1">📈</div>
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={14} />
                <span className="text-[10px] font-black uppercase tracking-wide">Rata-rata Nilai</span>
              </div>
              <div className="text-4xl font-black mb-0.5">{avgScore}</div>
              <div className="text-[10px] text-white/85 font-bold">
                dari {quizResults.length} kuis
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-4 shadow-lg shadow-emerald-300/40 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-6xl opacity-15 -mt-1 -mr-1">🏅</div>
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Award size={14} />
                <span className="text-[10px] font-black uppercase tracking-wide">Nilai Tertinggi</span>
              </div>
              <div className="text-4xl font-black mb-0.5">{bestScore}</div>
              <div className="text-[10px] text-white/85 font-bold">
                {bestScore >= 80 ? 'Luar biasa! 🏆' : 'Terus tingkatkan! 💪'}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-4 shadow-lg shadow-amber-300/40 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-6xl opacity-15 -mt-1 -mr-1">🎯</div>
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Target size={14} />
                <span className="text-[10px] font-black uppercase tracking-wide">Kuis Selesai</span>
              </div>
              <div className="text-4xl font-black mb-0.5">{quizResults.length}</div>
              <div className="text-[10px] text-white/85 font-bold">
                kuis dikerjakan
              </div>
            </div>
          </div>
        </div>

        {/* ===== PROGRESS MATERI ===== */}
        <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-violet-200 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-violet-500 to-pink-500 text-white p-2 rounded-xl shadow-md shadow-violet-300/50">
              <BookOpen size={16} />
            </div>
            <h2 className="text-lg font-black text-violet-900">Progress Materi</h2>
          </div>

          <div className="w-full bg-violet-100 h-8 rounded-full overflow-hidden mb-3 relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400 transition-all duration-1000 flex items-center justify-end pr-3 rounded-full"
              style={{ width: `${Math.max(progressPercent, 8)}%` }}
            >
              <span className="text-white font-black text-xs">{progressPercent}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="text-violet-600 font-bold flex items-center gap-1.5">
              <BookOpen size={12} />
              {completedMaterials} dari {totalMaterials} materi selesai
            </span>
            {progressPercent === 100 && totalMaterials > 0 && (
              <span className="text-emerald-600 font-black flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border-2 border-emerald-200">
                <CheckCircle size={12} />
                Semua selesai!
              </span>
            )}
          </div>
        </div>

        {/* ===== RIWAYAT KUIS ===== */}
        <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-violet-200 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-2 rounded-xl shadow-md shadow-amber-300/50">
              <Trophy size={16} />
            </div>
            <h2 className="text-lg font-black text-violet-900">Riwayat Kuis</h2>
            <span className="text-[10px] font-black bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full ml-auto">
              {quizResults.length} kuis
            </span>
          </div>

          {quizResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-violet-700 font-black mb-1">Belum ada riwayat kuis</p>
              <p className="text-violet-400 text-xs font-bold mb-4">
                Ayo kerjakan kuis pertamamu!
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-violet-500 to-pink-500 text-white font-black px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-300/50 active:scale-95 hover:scale-105 transition-transform inline-flex items-center gap-2 text-sm"
              >
                <Rocket size={16} />
                Mulai Belajar
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {quizResults.map((result) => {
                const material = result.quizzes?.materials
                const category = material?.categories

                return (
                  <div
                    key={result.id}
                    className={`p-3.5 rounded-2xl border-2 bg-gradient-to-br ${getScoreBg(result.score)}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-md"
                          style={{ 
                            background: `linear-gradient(135deg, ${category?.color || '#8B5CF6'}, ${category?.color || '#8B5CF6'}CC)` 
                          }}
                        >
                          {category?.icon || '📚'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-black text-violet-500 uppercase tracking-wide mb-0.5">
                            {category?.name}
                          </div>
                          <p className="font-black text-violet-900 text-sm truncate">
                            {result.quizzes?.title || material?.title || 'Kuis'}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-violet-400 font-bold mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <CheckCircle size={10} />
                              {result.correct_count} benar
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock size={10} />
                              {new Date(result.completed_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`bg-gradient-to-br ${getScoreGradient(result.score)} text-white rounded-2xl px-3 py-2 shadow-lg flex-shrink-0 min-w-[60px] text-center`}>
                        <div className="text-2xl font-black leading-none">
                          {result.score}
                        </div>
                        <div className="text-[8px] font-black opacity-90 mt-0.5">
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

        {/* ===== TIPS ===== */}
        <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-3xl p-5 text-white mb-5 relative overflow-hidden shadow-xl shadow-violet-300/30">
          <div className="absolute top-0 right-0 text-7xl opacity-15 -mt-2 -mr-2">💡</div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="fill-yellow-300 text-yellow-300" />
              <span className="text-[10px] font-black uppercase tracking-wider">Tips</span>
            </div>
            <div className="text-base font-black mb-1">
              {progressPercent === 100 ? 'Kamu sudah selesaikan semua! 🎉' :
               progressPercent >= 50 ? 'Setengah jalan, terus semangat! 💪' :
               quizResults.length === 0 ? 'Mulai dari 1 misi dulu yuk!' :
               'Belajar sedikit tapi rutin lebih baik!'}
            </div>
            <p className="text-xs opacity-90 font-medium">
              {progressPercent === 100
                ? 'Tantang dirimu dengan kuis ulang untuk nilai sempurna!'
                : 'Jaga konsistensi, minimal 5 menit sehari.'}
            </p>
          </div>
        </div>

        {/* ===== TOMBOL ===== */}
        <div className="flex flex-col md:flex-row gap-2.5">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-black py-3.5 rounded-2xl shadow-xl shadow-violet-300/50 active:scale-95 hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Rocket size={18} />
            LANJUT BELAJAR
          </button>
        </div>

      </main>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}