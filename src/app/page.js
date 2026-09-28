'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, logout } from '@/lib/auth'
import { 
  Play, Flame, Trophy, ArrowRight, Zap, Star, Lock, Crown, 
  LogOut, User, BarChart3, X, LayoutDashboard, Target, BookOpen,
  TrendingUp, Award, ChevronRight, Video, Headphones, Sparkles,
  CheckCircle, Rocket, Gem, Compass
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [materials, setMaterials] = useState([])
  const [allMaterials, setAllMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [progress, setProgress] = useState({ completed: 0, total: 0, xp: 0, level: 1 })

  useEffect(() => {
    async function fetchData() {
      const current = await getCurrentUser()
      if (current) {
        setUser(current.user)
        setProfile(current.profile)

        const { data: progressData } = await supabase
          .from('student_progress')
          .select('*')
          .eq('student_id', current.user.id)

        const completedCount = progressData?.filter((p) => p.is_completed)?.length || 0

        const { count: totalCount } = await supabase
          .from('materials')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true)

        const xp = completedCount * 100
        const level = Math.floor(xp / 500) + 1

        setProgress({
          completed: completedCount,
          total: totalCount || 0,
          xp: xp,
          level: level,
        })
      }

      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('order_index')

      const { data: mats } = await supabase
        .from('materials')
        .select('*, categories(name, icon, color)')
        .eq('is_published', true)
        .order('order_index')

      setCategories(cats || [])
      setAllMaterials(mats || [])
      setMaterials(mats || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleCategoryClick = (category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null)
      setMaterials(allMaterials)
    } else {
      setSelectedCategory(category)
      setMaterials(allMaterials.filter((m) => m.category_id === category.id))
    }
  }

  const clearFilter = () => {
    setSelectedCategory(null)
    setMaterials(allMaterials)
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    setProfile(null)
    router.refresh()
  }

  const isAdmin = profile?.role === 'admin'
  const displayName = profile?.full_name?.split(' ')[0] || (isAdmin ? 'Admin' : 'Sahabat')
  const xpProgressInLevel = progress.xp % 500
  const levelProgressPercent = (xpProgressInLevel / 500) * 100

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce">🧭</div>
          <p className="text-violet-600 font-bold">Memuat petualangan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-amber-50">

      {/* ===== HEADER ===== */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-violet-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between py-3 gap-2">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-gradient-to-br from-violet-500 to-pink-500 p-2 rounded-2xl shadow-lg shadow-violet-300/50">
                <span className="text-xl sm:text-2xl">🧭</span>
              </div>
              <div className="text-left">
                <h1 className="font-black text-base sm:text-lg text-violet-900 leading-none">IPS GenZ</h1>
                <p className="text-[9px] sm:text-[10px] text-violet-500 font-bold leading-none mt-0.5">PETUALANGAN SERU!</p>
              </div>
            </button>

            {!user && (
              <button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs sm:text-sm font-black px-4 sm:px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-300/50 active:scale-95 transition-transform flex items-center gap-1.5 flex-shrink-0"
              >
                Mulai
                <ArrowRight size={14} />
              </button>
            )}

            {user && (
              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-black px-3 py-2 rounded-xl shadow-md active:scale-95 transition-transform flex items-center gap-1"
                  >
                    <LayoutDashboard size={13} />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}
                <button
                  onClick={() => router.push('/progress')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-black px-3 py-2 rounded-xl shadow-md active:scale-95 transition-transform flex items-center gap-1"
                >
                  <BarChart3 size={13} />
                  <span className="hidden sm:inline">Progress</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-100 text-red-600 p-2 rounded-xl active:scale-95 transition-transform"
                  title="Keluar"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {/* ===== SAPAAN + AVATAR ===== */}
        {user && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] sm:text-xs text-violet-600 font-black uppercase tracking-wide mb-0.5">
                Halo Sahabat! 👋
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-violet-900">
                {displayName}
              </h2>
            </div>
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shadow-violet-300/50">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full px-2 py-0.5 text-[9px] font-black text-white shadow-lg border-2 border-white">
                LV {progress.level}
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-black text-violet-900 mb-1">
              Selamat Datang! 🧭
            </h2>
            <p className="text-violet-600 text-sm font-medium">
              Login untuk menyimpan progress & dapatkan pencapaian!
            </p>
          </div>
        )}

        {/* ===== LEVEL CARD ===== */}
        {user && (
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-4 sm:p-5 text-white mb-4 relative overflow-hidden shadow-xl shadow-purple-400/40">
            <div className="absolute top-0 right-0 text-8xl opacity-15 rotate-12 -mt-2 -mr-2">🧭</div>
            <div className="absolute bottom-0 left-0 text-6xl opacity-15 -rotate-12 -mb-2 -ml-2">✨</div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <div className="bg-white/25 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border border-white/30">
                  <Crown size={10} className="fill-yellow-300 text-yellow-300" />
                  LEVEL {progress.level}
                </div>
                <div className="bg-white/25 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border border-white/30">
                  <Flame size={10} className="fill-orange-300 text-orange-300" />
                  {progress.completed > 0 ? `${progress.completed} HARI` : 'MULAI!'}
                </div>
                <div className="bg-white/25 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border border-white/30">
                  <Gem size={10} className="fill-cyan-300 text-cyan-300" />
                  {progress.xp} XP
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black mb-1">
                {progress.level === 1 ? 'Pemula IPS! 🌱' :
                 progress.level === 2 ? 'Petualang IPS! 🧭' :
                 progress.level === 3 ? 'Penjelajah IPS! 🗺️' :
                 progress.level === 4 ? 'Ahli IPS! 🎯' :
                 'Master IPS! 👑'}
              </div>
              <p className="text-xs opacity-90 font-medium mb-3">
                {progress.completed === 0 ? 'Ayo mulai belajar pertama kali!' :
                 progress.completed === progress.total && progress.total > 0 ? 'Semua materi selesai! Hebat! 🎉' :
                 `Kamu sudah selesaikan ${progress.completed} dari ${progress.total} materi`}
              </p>

              <div>
                <div className="flex justify-between text-[10px] font-bold opacity-90 mb-1">
                  <span>Menuju Level {progress.level + 1}</span>
                  <span>{xpProgressInLevel}/500 XP</span>
                </div>
                <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(levelProgressPercent, 3)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== STATS GRID ===== */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border-2 border-violet-100 text-center">
            <div className="text-xl sm:text-2xl mb-1">📚</div>
            <div className="text-sm sm:text-lg font-black text-violet-900">{progress.total}</div>
            <div className="text-[8px] sm:text-[9px] font-black text-violet-500 uppercase">Materi</div>
          </div>
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border-2 border-emerald-100 text-center">
            <div className="text-xl sm:text-2xl mb-1">✅</div>
            <div className="text-sm sm:text-lg font-black text-emerald-700">{progress.completed}</div>
            <div className="text-[8px] sm:text-[9px] font-black text-emerald-500 uppercase">Selesai</div>
          </div>
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border-2 border-amber-100 text-center">
            <div className="text-xl sm:text-2xl mb-1">🎯</div>
            <div className="text-sm sm:text-lg font-black text-amber-700">{categories.length}</div>
            <div className="text-[8px] sm:text-[9px] font-black text-amber-500 uppercase">Peta</div>
          </div>
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border-2 border-pink-100 text-center">
            <div className="text-xl sm:text-2xl mb-1">🏆</div>
            <div className="text-sm sm:text-lg font-black text-pink-700">∞</div>
            <div className="text-[8px] sm:text-[9px] font-black text-pink-500 uppercase">Badge</div>
          </div>
        </div>

        {/* ===== PETA BELAJAR ===== */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gradient-to-r from-violet-500 to-pink-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={10} className="fill-white" />
              PETA BELAJAR
            </div>
            {selectedCategory && (
              <button
                onClick={clearFilter}
                className="text-[10px] text-violet-600 font-black flex items-center gap-1 hover:text-violet-800"
              >
                <X size={10} />
                Reset
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
            {categories.map((cat) => {
              const isActive = selectedCategory?.id === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex-shrink-0 active:scale-95 ${
                    isActive
                      ? 'text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-violet-200'
                  }`}
                  style={{
                    backgroundColor: isActive ? cat.color : undefined,
                    boxShadow: isActive ? `0 8px 20px -5px ${cat.color}80` : undefined,
                  }}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                  {isActive && <CheckCircle size={12} className="fill-white/30" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* ===== MATERI LIST ===== */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-violet-900 text-sm sm:text-base flex items-center gap-2">
              {selectedCategory ? (
                <>
                  <span>{selectedCategory.icon}</span>
                  Materi {selectedCategory.name}
                </>
              ) : (
                <>
                  <Rocket size={16} className="text-pink-500" />
                  Mulai Bertualang
                </>
              )}
            </h3>
            <span className="text-[10px] text-violet-500 font-black bg-violet-100 px-2 py-1 rounded-full">
              {materials.length} Misi
            </span>
          </div>

          {materials.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-violet-100 p-8 text-center">
              <div className="text-5xl mb-3">📭</div>
              <h4 className="font-black text-violet-900 mb-1">Belum ada materi</h4>
              <p className="text-xs text-violet-500 font-medium mb-4">
                {selectedCategory ? `Belum ada materi untuk ${selectedCategory.name}` : 'Materi akan segera hadir!'}
              </p>
              {selectedCategory && (
                <button
                  onClick={clearFilter}
                  className="bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md active:scale-95 transition-transform"
                >
                  Lihat Semua
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {materials.map((mat, index) => {
                const isCompleted = index < progress.completed
                const isCurrent = index === progress.completed

                return (
                  <button
                    key={mat.id}
                    onClick={() => router.push(`/materi/${mat.slug}`)}
                    className={`w-full rounded-2xl p-3 sm:p-4 text-left transition-all active:scale-[0.98] group relative overflow-hidden border-2 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                        : isCurrent
                        ? 'bg-white border-violet-300 shadow-lg shadow-violet-200/50'
                        : 'bg-white border-violet-100 hover:border-violet-300 hover:shadow-md'
                    }`}
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1.5"
                      style={{ backgroundColor: mat.categories?.color || '#8B5CF6' }}
                    ></div>

                    <div className="flex items-center gap-3 pl-2">
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md bg-gradient-to-br`}
                          style={{ 
                            background: `linear-gradient(135deg, ${mat.categories?.color || '#8B5CF6'}, ${mat.categories?.color || '#8B5CF6'}CC)` 
                          }}
                        >
                          <span className="drop-shadow">{mat.categories?.icon || '📖'}</span>
                        </div>
                        {isCompleted && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white shadow-md">
                            <CheckCircle size={10} className="text-white fill-white" />
                          </div>
                        )}
                        {isCurrent && (
                          <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1 border-2 border-white shadow-md animate-pulse">
                            <Star size={10} className="text-white fill-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span 
                            className="text-[9px] font-black px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: mat.categories?.color || '#8B5CF6' }}
                          >
                            {mat.categories?.name}
                          </span>
                          {isCompleted && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              ✓ SELESAI
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              ⭐ LANJUTKAN
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-violet-900 text-sm line-clamp-1 mb-1 group-hover:text-violet-700">
                          {mat.title}
                        </h4>
                        <div className="flex items-center gap-2.5 text-[10px] text-violet-500 font-bold">
                          <span className="flex items-center gap-0.5">
                            ⏱ {mat.duration_minutes || 5} menit
                          </span>
                          {mat.video_type && mat.video_type !== 'none' && (
                            <span className="flex items-center gap-0.5">
                              <Video size={9} /> Video
                            </span>
                          )}
                          <span className="flex items-center gap-0.5">
                            💎 +100 XP
                          </span>
                        </div>
                      </div>

                      <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-md'
                          : isCurrent
                          ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg group-hover:scale-110'
                          : 'bg-violet-100 text-violet-600 group-hover:bg-violet-500 group-hover:text-white'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle size={18} />
                        ) : (
                          <Play size={16} className="fill-current" />
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ===== PENCAPAIAN ===== */}
        {user && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                <Trophy size={10} className="fill-white" />
                PENCAPAIANMU
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: '🥇', title: 'PEMULA', desc: 'Buka 1 misi', unlocked: progress.completed >= 1, from: 'from-emerald-400', to: 'to-teal-500' },
                { icon: '🎖️', title: 'PENJELAJAH', desc: 'Selesai 3 misi', unlocked: progress.completed >= 3, from: 'from-blue-400', to: 'to-indigo-500' },
                { icon: '👑', title: 'JUARA', desc: 'Semua materi', unlocked: progress.completed >= progress.total && progress.total > 0, from: 'from-amber-400', to: 'to-orange-500' },
              ].map((badge, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-3 text-center border-2 relative overflow-hidden ${
                    badge.unlocked
                      ? `bg-gradient-to-br ${badge.from} ${badge.to} text-white border-transparent shadow-lg`
                      : 'bg-white border-violet-100 opacity-60'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl mb-1.5">{badge.unlocked ? badge.icon : '🔒'}</div>
                  <div className={`text-[10px] sm:text-xs font-black uppercase ${badge.unlocked ? 'text-white' : 'text-violet-600'}`}>
                    {badge.title}
                  </div>
                  <div className={`text-[8px] sm:text-[9px] font-bold mt-0.5 ${badge.unlocked ? 'text-white/90' : 'text-violet-400'}`}>
                    {badge.desc}
                  </div>
                  {badge.unlocked && (
                    <div className="absolute top-1.5 right-1.5 bg-white/30 backdrop-blur-sm rounded-full p-0.5">
                      <CheckCircle size={10} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TIPS ===== */}
        <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-3xl p-5 text-white mb-4 relative overflow-hidden shadow-xl shadow-violet-300/30">
          <div className="absolute top-0 right-0 text-7xl opacity-15 -mt-2 -mr-2">💡</div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="fill-yellow-300 text-yellow-300" />
              <span className="text-[10px] font-black uppercase tracking-wider">Tips Belajar</span>
            </div>
            <div className="text-lg font-black mb-1">Belajar 5 menit/hari</div>
            <p className="text-xs opacity-90 font-medium">
              Lebih baik sedikit tapi konsisten, daripada banyak tapi sekali. Jaga streak belajarmu! 🔥
            </p>
          </div>
        </div>

        {/* ===== CTA LOGIN ===== */}
        {!user && (
          <div className="bg-white rounded-3xl p-6 border-2 border-violet-200 text-center mb-4 shadow-lg">
            <div className="text-5xl mb-3">🚀</div>
            <h3 className="text-xl font-black text-violet-900 mb-2">Siap Bertualang?</h3>
            <p className="text-sm text-violet-600 font-medium mb-4">
              Login untuk menyimpan progress, dapatkan XP, dan kumpulkan pencapaian!
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-violet-500 to-pink-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-violet-300/50 active:scale-95 transition-transform inline-flex items-center gap-2"
            >
              <Rocket size={18} />
              Mulai Sekarang
            </button>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <footer className="pt-4 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-gradient-to-br from-violet-500 to-pink-500 p-1.5 rounded-lg shadow-md">
              <span className="text-sm">🧭</span>
            </div>
            <span className="font-black text-violet-900 text-sm">IPS GenZ</span>
          </div>
          <p className="text-[10px] text-violet-400 font-medium">
            © 2026 IPS GenZ • Petualangan Belajar Seru!
          </p>
        </footer>

      </main>
    </div>
  )
}