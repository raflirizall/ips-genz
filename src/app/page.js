'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, logout } from '@/lib/auth'
import { Play, Target, Sparkles, Trophy, ArrowRight, Star, Heart, Zap, LogOut, User, BarChart3 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const current = await getCurrentUser()
      if (current) {
        setUser(current.user)
        setProfile(current.profile)
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
      setMaterials(mats || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    setProfile(null)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-wiggle">🦎</div>
          <p className="text-gray-600 font-bold text-lg">Sebentar ya...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-pink-50">

      <header className="bg-white/90 backdrop-blur-md border-b-4 border-yellow-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-2xl shadow-lg shadow-orange-200">
              <span className="text-2xl">🦎</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-xl text-gray-800 leading-none">IPS GenZ</h1>
              <p className="text-[10px] text-orange-500 font-bold leading-none mt-0.5">PETUALANGAN IPS!</p>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/progress')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-black px-4 py-2.5 rounded-2xl shadow-lg shadow-blue-200 hover:scale-105 transition-transform flex items-center gap-1.5"
              >
                <BarChart3 size={16} />
                <span className="hidden md:inline">Progress</span>
              </button>
              <div className="bg-yellow-100 border-2 border-yellow-300 text-yellow-800 text-sm font-black px-3 py-2 rounded-2xl flex items-center gap-1.5">
                <User size={14} />
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {profile?.full_name || 'Siswa'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-100 hover:bg-red-200 text-red-600 p-2.5 rounded-2xl transition-colors"
                title="Keluar"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-sm font-black px-5 py-2.5 rounded-2xl shadow-lg shadow-orange-200 hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <span>Masuk</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-400"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-black mb-5 border-2 border-white/50">
                <Sparkles size={16} />
                <span>Petualangan Belajar Seru!</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight drop-shadow-lg">
                {user ? `Halo, ${profile?.full_name?.split(' ')[0] || 'Sahabat'}! 👋` : 'Halo Sahabat! 👋'}
                <br />
                <span className="text-yellow-100">Ayo Petualangan IPS!</span>
              </h2>

              <p className="text-white text-lg md:text-xl mb-7 leading-relaxed font-medium drop-shadow">
                Jelajahi Indonesia lewat video seru, audio keren,
                dan kuis yang bikin ketagihan! 🎉
              </p>

              <div className="flex flex-wrap gap-3 mb-7">
                <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold border-2 border-white/40">
                  🎬 Video Seru
                </div>
                <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold border-2 border-white/40">
                  🔊 Audio Keren
                </div>
                <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold border-2 border-white/40">
                  🎯 Kuis Seru
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => document.getElementById('peta-belajar')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-orange-600 font-black px-7 py-4 rounded-2xl hover:scale-110 transition-transform shadow-2xl flex items-center gap-2 text-lg"
                >
                  <Zap size={22} className="fill-orange-500 text-orange-500" />
                  MULAI PETUALANGAN
                </button>
              </div>
            </div>

            <div className="flex justify-center relative">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl scale-75"></div>
                <div className="text-[200px] md:text-[240px] leading-none animate-wiggle relative drop-shadow-2xl">🦎</div>
                <div className="absolute -top-6 -right-2 text-5xl animate-bounce-slow">📚</div>
                <div className="absolute -bottom-2 -left-2 text-5xl animate-bounce-slow" style={{animationDelay: '0.5s'}}>🎯</div>
                <div className="absolute top-1/3 -right-8 text-4xl animate-wiggle" style={{animationDelay: '1s'}}>✨</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="#FFFBF0"/>
          </svg>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xl shadow-yellow-100 border-4 border-yellow-200 text-center">
            <div className="text-4xl md:text-5xl mb-2">🗺️</div>
            <div className="text-3xl md:text-4xl font-black text-orange-500">{categories.length}</div>
            <div className="text-xs md:text-sm text-gray-500 font-bold">PETA</div>
          </div>
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xl shadow-pink-100 border-4 border-pink-200 text-center">
            <div className="text-4xl md:text-5xl mb-2">🎯</div>
            <div className="text-3xl md:text-4xl font-black text-pink-500">{materials.length}</div>
            <div className="text-xs md:text-sm text-gray-500 font-bold">MISI</div>
          </div>
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xl shadow-green-100 border-4 border-green-200 text-center">
            <div className="text-4xl md:text-5xl mb-2">🏆</div>
            <div className="text-3xl md:text-4xl font-black text-green-500">∞</div>
            <div className="text-xs md:text-sm text-gray-500 font-bold">PENCAPAIAN</div>
          </div>
        </div>
      </section>

      <section id="peta-belajar" className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-5 py-2 rounded-full text-sm font-black mb-3 shadow-lg">
            <span>🗺️</span>
            <span>PETA BELAJAR</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-800">Pilih Petualanganmu!</h3>
          <p className="text-gray-500 mt-2 font-medium">Klik peta untuk mulai menjelajah</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/?kategori=${cat.slug}`)}
              className="group relative bg-white rounded-3xl p-4 md:p-5 text-center shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-4 border-transparent overflow-hidden"
              style={{ borderColor: cat.color + '40' }}
            >
              <div
                className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: cat.color }}
              ></div>
              <div className="relative">
                <div className="text-4xl md:text-5xl mb-3 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
                  {cat.icon}
                </div>
                <div className="text-xs md:text-sm font-black text-gray-700 leading-tight">
                  {cat.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white px-5 py-2 rounded-full text-sm font-black mb-3 shadow-lg">
            <span>🎯</span>
            <span>MISI HARI INI</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-800">Siap Bertualang?</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((mat) => (
            <button
              key={mat.id}
              onClick={() => router.push(`/materi/${mat.slug}`)}
              className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 text-left border-4 border-yellow-100"
            >
              <div
                className="h-48 relative flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: mat.categories?.color || '#FF8C42' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-4 -left-4 text-6xl opacity-30">✨</div>
                <div className="absolute bottom-4 -right-4 text-6xl opacity-30">⭐</div>
                <div className="text-8xl group-hover:scale-125 transition-transform duration-500 relative z-10 drop-shadow-2xl">
                  {mat.categories?.icon || '📖'}
                </div>
                <div className="absolute top-4 left-4 bg-white text-xs font-black px-3 py-1.5 rounded-full text-gray-700 shadow-lg">
                  {mat.categories?.name}
                </div>
                <div className="absolute top-4 right-4 bg-yellow-400 text-xs font-black px-3 py-1.5 rounded-full text-white shadow-lg flex items-center gap-1">
                  <Star size={12} className="fill-white" />
                  MISI
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-black text-gray-800 text-lg mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors">
                  {mat.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium">
                  {mat.excerpt}
                </p>

                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-center py-3 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <Play size={18} className="fill-white" />
                  MULAI MISI
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-400 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl opacity-20 -mt-6 -mr-6">🏆</div>
          <div className="absolute bottom-0 left-0 text-9xl opacity-20 -mb-6 -ml-6">🎖️</div>

          <div className="relative text-center text-white mb-8">
            <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-black mb-4 border-2 border-white/50">
              <Trophy size={16} />
              <span>PENCAPAIANMU</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black drop-shadow-lg">
              Kumpulkan Lencana! 🏅
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4 relative">
            <div className="bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-3xl p-5 text-center">
              <div className="text-5xl mb-2 animate-bounce-slow">🥇</div>
              <div className="text-xs font-black text-white">PEMULA</div>
              <div className="text-[10px] text-white/80 mt-1">Buka 1 misi</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-3xl p-5 text-center opacity-60">
              <div className="text-5xl mb-2">🔒</div>
              <div className="text-xs font-black text-white">PENJELAJAH</div>
              <div className="text-[10px] text-white/80 mt-1">Selesaikan 3 misi</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-3xl p-5 text-center opacity-60">
              <div className="text-5xl mb-2">🔒</div>
              <div className="text-xs font-black text-white">JUARA</div>
              <div className="text-[10px] text-white/80 mt-1">Selesaikan semua</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-black text-gray-800">
            Kenapa Seru Belajar di Sini? 🤔
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-7 text-center shadow-xl border-4 border-blue-100 hover:-translate-y-2 transition-all">
            <div className="bg-blue-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎬</span>
            </div>
            <h4 className="font-black text-lg mb-2 text-gray-800">Belajar Visual</h4>
            <p className="text-sm text-gray-500 font-medium">Tonton video seru, belajar sambil nonton!</p>
          </div>

          <div className="bg-white rounded-3xl p-7 text-center shadow-xl border-4 border-green-100 hover:-translate-y-2 transition-all">
            <div className="bg-green-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔊</span>
            </div>
            <h4 className="font-black text-lg mb-2 text-gray-800">Belajar Audio</h4>
            <p className="text-sm text-gray-500 font-medium">Dengarkan materi, cocok buat semua gaya belajar!</p>
          </div>

          <div className="bg-white rounded-3xl p-7 text-center shadow-xl border-4 border-pink-100 hover:-translate-y-2 transition-all">
            <div className="bg-pink-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <h4 className="font-black text-lg mb-2 text-gray-800">Kuis Seru</h4>
            <p className="text-sm text-gray-500 font-medium">Uji kemampuan dengan kuis yang bikin ketagihan!</p>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t-4 border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-2xl shadow-lg">
              <span className="text-xl">🦎</span>
            </div>
            <span className="font-black text-gray-800 text-lg">IPS GenZ</span>
          </div>
          <p className="text-sm text-gray-500 font-bold flex items-center justify-center gap-1">
            Dibuat dengan <Heart size={14} className="fill-red-500 text-red-500" /> untuk Sahabat IPS SMP
          </p>
          <p className="text-xs text-gray-400 mt-2 font-medium">© 2026 IPS GenZ • Petualangan Belajar Seru</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}