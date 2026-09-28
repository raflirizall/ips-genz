'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { 
  ArrowLeft, Play, Pause, Volume2, VolumeX, BookOpen, Lightbulb, 
  Target, Eye, Headphones, Clock, Sparkles, CheckCircle, Rocket,
  Video, Compass, Award
} from 'lucide-react'

export default function MateriDetail() {
  const params = useParams()
  const router = useRouter()
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      const current = await getCurrentUser()
      if (current && current.profile?.role === 'admin') {
        setIsAdmin(true)
      }

      const { data, error } = await supabase
        .from('materials')
        .select('*, categories(name, icon, color)')
        .eq('slug', params.slug)
        .eq('is_published', true)
        .single()

      if (!error && data) {
        setMaterial(data)
      }
      setLoading(false)
    }
    fetchData()
  }, [params.slug])

  const toggleAudio = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Browser kamu belum mendukung fitur bacakan materi')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const textToRead = [
      material.title,
      material.intro,
      material.content ? material.content.replace(/<[^>]*>/g, '') : '',
      material.conclusion,
    ].filter(Boolean).join('. ')

    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.lang = 'id-ID'
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null
    let videoId = ''
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0]
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0]
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  // ===== FIX: TOMBOL KEMBALI TANPA router.back() =====
  // Admin → /admin/materi
  // Siswa → / (Home siswa)
  // Tidak ada loop kembali ke kuis
  const handleBack = () => {
    if (isAdmin) {
      router.push('/admin/materi')
    } else {
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce">🧭</div>
          <p className="text-violet-600 font-bold">Memuat materi...</p>
        </div>
      </div>
    )
  }

  if (!material) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50 p-6">
        <div className="text-7xl mb-4">😕</div>
        <h1 className="text-2xl font-black text-violet-900 mb-2">Materi Tidak Ditemukan</h1>
        <p className="text-violet-500 mb-6 text-center font-medium">Materi yang kamu cari belum ada atau sudah dihapus.</p>
        <button
          onClick={handleBack}
          className="bg-gradient-to-r from-violet-500 to-pink-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>
      </div>
    )
  }

  const youtubeEmbed = getYoutubeEmbedUrl(material.video_url)
  const categoryColor = material.categories?.color || '#8B5CF6'

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-amber-50">

      {/* ===== HEADER ===== */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-violet-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="bg-violet-100 hover:bg-violet-200 text-violet-700 p-2.5 rounded-2xl transition-colors flex items-center gap-1.5 font-black active:scale-95"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl">{material.categories?.icon}</span>
            <span className="font-black text-violet-900 text-sm truncate">{material.categories?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {/* ===== JUDUL ===== */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-2 text-white px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black mb-3 shadow-lg"
            style={{ backgroundColor: categoryColor, boxShadow: `0 8px 20px -5px ${categoryColor}80` }}
          >
            <span>{material.categories?.icon}</span>
            <span>{material.categories?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-violet-900 mb-3 leading-tight">
            {material.title}
          </h1>
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-violet-500 font-bold flex-wrap">
            {material.duration_minutes && (
              <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border-2 border-violet-100">
                <Clock size={12} />
                {material.duration_minutes} menit
              </span>
            )}
            {youtubeEmbed && (
              <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border-2 border-violet-100">
                <Video size={12} />
                Video
              </span>
            )}
            {material.audio_url && (
              <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border-2 border-violet-100">
                <Headphones size={12} />
                Audio
              </span>
            )}
          </div>
        </div>

        {/* ===== 1. LIHAT — VIDEO ===== */}
        {youtubeEmbed && (
          <section className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-br from-violet-500 to-cyan-500 text-white p-2 rounded-2xl shadow-lg shadow-violet-300/50">
                <Eye size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-violet-900">Lihat</h2>
              <span className="text-[10px] font-black bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full uppercase">Video</span>
            </div>
            <div className="bg-white rounded-3xl p-3 shadow-xl border-2 border-violet-100">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
                <iframe
                  src={youtubeEmbed}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={material.title}
                />
              </div>
            </div>
          </section>
        )}

        {/* ===== 2. DENGARKAN — AUDIO ===== */}
        <section className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white p-2 rounded-2xl shadow-lg shadow-pink-300/50">
              <Headphones size={18} />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-violet-900">Dengarkan</h2>
            <span className="text-[10px] font-black bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full uppercase">Audio</span>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-pink-100">
            {material.audio_url ? (
              <>
                <p className="text-xs text-violet-500 font-bold mb-3 flex items-center gap-1">
                  <Headphones size={12} className="text-pink-500" />
                  Dengarkan materi ini:
                </p>
                <audio
                  ref={audioRef}
                  src={material.audio_url}
                  onEnded={() => setIsPlaying(false)}
                  preload="metadata"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAudio}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-2xl shadow-lg shadow-pink-300/50 active:scale-95 transition-transform"
                  >
                    {isPlaying ? <Pause size={22} className="fill-white" /> : <Play size={22} className="fill-white" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="bg-pink-50 hover:bg-pink-100 text-pink-600 p-3 rounded-2xl transition-colors"
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <div className="flex-1 bg-pink-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all ${isPlaying ? 'w-1/2' : 'w-0'}`}></div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-violet-500 font-bold mb-3 text-center">
                Audio belum tersedia. Pakai fitur Bacakan Materi:
              </p>
            )}

            {material.tts_enabled !== false && (
              <button
                onClick={handleTTS}
                className={`w-full mt-4 font-black py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                  isSpeaking
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-300/50'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-300/50'
                }`}
              >
                <span className="text-xl">{isSpeaking ? '⏹' : '🔊'}</span>
                {isSpeaking ? 'STOP BACA' : 'BACAKAN MATERI'}
              </button>
            )}
          </div>
        </section>

        {/* ===== 3. PAHAMI — KONTEN ===== */}
        {(material.intro || material.content) && (
          <section className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-2 rounded-2xl shadow-lg shadow-emerald-300/50">
                <BookOpen size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-violet-900">Pahami</h2>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Teks</span>
            </div>
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border-2 border-emerald-100">
              {material.intro && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-400 p-4 rounded-r-2xl mb-4">
                  <p className="text-violet-900 font-bold text-sm sm:text-base leading-relaxed">{material.intro}</p>
                </div>
              )}
              {material.content && (
                <div
                  className="text-violet-800 leading-relaxed text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: material.content }}
                />
              )}
            </div>
          </section>
        )}

        {/* ===== 4. INGAT — POIN PENTING ===== */}
        {material.key_points && material.key_points.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-2 rounded-2xl shadow-lg shadow-amber-300/50">
                <Lightbulb size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-violet-900">Ingat!</h2>
              <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">
                {material.key_points.length} Poin
              </span>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-4 sm:p-6 shadow-xl border-2 border-amber-200">
              <div className="space-y-2.5">
                {material.key_points.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-sm border border-amber-100">
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md text-sm">
                      {i + 1}
                    </div>
                    <p className="text-violet-900 font-bold text-sm sm:text-base pt-1">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== KESIMPULAN ===== */}
        {material.conclusion && (
          <section className="mb-5">
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-5 sm:p-6 shadow-xl shadow-purple-300/40 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-7xl opacity-15 -mt-2 -mr-2">✨</div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-xl">
                    <Sparkles size={16} className="fill-yellow-300 text-yellow-300" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black">Kesimpulan</h3>
                </div>
                <p className="text-white/95 font-medium leading-relaxed text-sm sm:text-base">
                  {material.conclusion}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ===== 5. COBA — KUIS ===== */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white p-2 rounded-2xl shadow-lg shadow-pink-300/50">
              <Target size={18} />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-violet-900">Coba</h2>
            <span className="text-[10px] font-black bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full uppercase">Kuis</span>
          </div>

          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-pink-300/50 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 text-7xl opacity-20 -mt-2 -ml-2">🎯</div>
            <div className="absolute bottom-0 right-0 text-7xl opacity-20 -mb-2 -mr-2">🏆</div>

            <div className="relative">
              <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black mb-3 border border-white/30">
                <Award size={10} />
                KUIS SERU
              </div>
              <div className="text-5xl sm:text-6xl mb-3">🎯</div>
              <h3 className="text-xl sm:text-2xl font-black mb-2">Sudah Paham?</h3>
              <p className="text-white/90 font-medium mb-5 text-sm sm:text-base">
                Uji pemahamanmu dan dapatkan <strong>+XP</strong>!
              </p>
              <button
                onClick={() => router.push(`/materi/${params.slug}/kuis`)}
                className="bg-white text-pink-600 font-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-xl active:scale-95 hover:scale-105 transition-transform text-base sm:text-lg inline-flex items-center gap-2"
              >
                <Rocket size={20} />
                MULAI KUIS
              </button>
            </div>
          </div>
        </section>

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