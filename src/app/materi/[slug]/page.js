'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Play, Pause, Volume2, VolumeX, BookOpen, Lightbulb, Target, Eye, Headphones } from 'lucide-react'

export default function MateriDetail() {
  const params = useParams()
  const router = useRouter()
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    async function fetchMaterial() {
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
    fetchMaterial()
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-wiggle">🦎</div>
          <p className="text-gray-600 font-bold">Sebentar ya...</p>
        </div>
      </div>
    )
  }

  if (!material) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-6">
        <div className="text-7xl mb-4">😕</div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">Materi Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-6 text-center">Materi yang kamu cari belum ada atau sudah dihapus.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          ← Kembali ke Home
        </button>
      </div>
    )
  }

  const youtubeEmbed = getYoutubeEmbedUrl(material.video_url)
  const categoryColor = material.categories?.color || '#FF8C42'

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-pink-50">

      <header className="bg-white/90 backdrop-blur-md border-b-4 sticky top-0 z-50" style={{borderColor: categoryColor + '40'}}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-2xl transition-colors flex items-center gap-1.5 font-bold text-gray-700"
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">Kembali</span>
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl">{material.categories?.icon}</span>
            <span className="font-black text-gray-700 text-sm truncate">{material.categories?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">

        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 text-white px-4 py-1.5 rounded-full text-xs font-black mb-4 shadow-lg"
            style={{ backgroundColor: categoryColor }}
          >
            <span>{material.categories?.icon}</span>
            <span>{material.categories?.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-3 leading-tight">
            {material.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 font-bold">
            {material.duration_minutes && (
              <span>⏱️ {material.duration_minutes} menit</span>
            )}
            {youtubeEmbed && <span>🎬 Video</span>}
            {material.audio_url && <span>🔊 Audio</span>}
          </div>
        </div>

        {youtubeEmbed && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                <Eye size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-800">👀 Lihat</h2>
            </div>
            <div className="bg-white rounded-3xl p-3 shadow-xl border-4 border-blue-100">
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

        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-xl">
              <Headphones size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800">🔊 Dengarkan</h2>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xl border-4 border-purple-100">
            {material.audio_url ? (
              <>
                <p className="text-sm text-gray-500 font-bold mb-3">Dengarkan materi ini:</p>
                <audio
                  ref={audioRef}
                  src={material.audio_url}
                  onEnded={() => setIsPlaying(false)}
                  preload="metadata"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAudio}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-lg hover:scale-110 transition-transform"
                  >
                    {isPlaying ? <Pause size={24} className="fill-white" /> : <Play size={24} className="fill-white" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-2xl transition-colors"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <div className="flex-1 bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all ${isPlaying ? 'w-1/2' : 'w-0'}`}></div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 font-bold mb-3 text-center">Audio belum tersedia. Tapi kamu bisa pakai fitur Bacakan Materi:</p>
            )}

            {material.tts_enabled !== false && (
              <button
                onClick={handleTTS}
                className={`w-full mt-4 font-black py-4 rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 ${
                  isSpeaking
                    ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}
              >
                <span className="text-2xl">{isSpeaking ? '⏹️' : '🔊'}</span>
                {isSpeaking ? 'STOP BACA' : 'BACAKAN MATERI'}
              </button>
            )}
          </div>
        </section>

        {(material.intro || material.content) && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-green-100 text-green-600 p-2 rounded-xl">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-800">📖 Pahami</h2>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-green-100">
              {material.intro && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-2xl mb-4">
                  <p className="text-gray-700 font-bold text-lg leading-relaxed">{material.intro}</p>
                </div>
              )}
              {material.content && (
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: material.content }}
                />
              )}
            </div>
          </section>
        )}

        {material.key_points && material.key_points.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-yellow-100 text-yellow-600 p-2 rounded-xl">
                <Lightbulb size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-800">📌 Ingat!</h2>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-6 shadow-xl border-4 border-yellow-200">
              <div className="space-y-3">
                {material.key_points.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-gray-800 font-bold text-base md:text-lg">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {material.conclusion && (
          <section className="mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 shadow-xl text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💡</span>
                <h3 className="text-lg font-black">Kesimpulan</h3>
              </div>
              <p className="text-blue-50 font-medium leading-relaxed">{material.conclusion}</p>
            </div>
          </section>
        )}

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-pink-100 text-pink-600 p-2 rounded-xl">
              <Target size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800">🎯 Coba</h2>
          </div>
          <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl p-8 shadow-2xl text-center text-white">
            <div className="text-6xl mb-3">🎯</div>
            <h3 className="text-2xl font-black mb-2">Sudah Paham?</h3>
            <p className="text-pink-100 font-medium mb-6">Uji pemahamanmu dengan kuis seru!</p>
            <button
  onClick={() => router.push(`/materi/${params.slug}/kuis`)}
  className="bg-white text-pink-500 font-black px-8 py-4 rounded-2xl shadow-xl hover:scale-110 transition-transform text-lg inline-flex items-center gap-2"
>
  <Target size={22} />
  MULAI KUIS
</button>
          </div>
        </section>

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