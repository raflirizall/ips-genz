'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Save, Plus, X, Check, Upload, Image as ImageIcon, Music, 
  HelpCircle, Sparkles, Rocket, AlertTriangle, ListChecks, ImagePlay,
  Volume2, Target, FileText, Crown
} from 'lucide-react'

export default function TambahSoalPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [questionText, setQuestionText] = useState('')
  const [questionImage, setQuestionImage] = useState('')
  const [questionAudio, setQuestionAudio] = useState('')
  const [audioText, setAudioText] = useState('')
  const [questionType, setQuestionType] = useState('multiple_choice')
  const [points, setPoints] = useState(10)
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])

  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)

  useEffect(() => {
    async function fetchQuiz() {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, materials(title, categories(icon, color))')
        .eq('id', quizId)
        .single()

      if (!error && data) {
        setQuiz(data)
      }
      setLoading(false)
    }
    if (quizId) fetchQuiz()
  }, [quizId])

  const updateOption = (index, field, value) => {
    setOptions((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const setCorrectOption = (index) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({ ...opt, isCorrect: i === index }))
    )
  }

  const addOption = () => {
    setOptions((prev) => [...prev, { text: '', isCorrect: false }])
  }

  const removeOption = (index) => {
    if (options.length <= 2) {
      alert('Minimal 2 pilihan jawaban')
      return
    }
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (questionType === 'true_false') {
      setOptions([
        { text: 'Benar', isCorrect: true },
        { text: 'Salah', isCorrect: false },
      ])
    } else if (questionType === 'multiple_choice' && options.length === 2) {
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionType])

  async function uploadFile(file, bucket, setUploading, setField) {
    setUploading(true)
    setError('')
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      setField(data.publicUrl)
    } catch (err) {
      setError(`Gagal upload: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!questionText.trim()) {
      setError('Pertanyaan wajib diisi')
      return
    }

    const filledOptions = options.filter((o) => o.text.trim() !== '')
    if (filledOptions.length < 2) {
      setError('Minimal 2 pilihan jawaban yang terisi')
      return
    }

    const correctCount = options.filter((o) => o.isCorrect).length
    if (correctCount === 0) {
      setError('Pilih satu jawaban yang benar')
      return
    }

    setSaving(true)

    try {
      const { data: existing } = await supabase
        .from('questions')
        .select('order_index')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrder = existing && existing.length > 0 ? existing[0].order_index + 1 : 1

      const { data: newQ, error: qError } = await supabase
        .from('questions')
        .insert({
          quiz_id: quizId,
          question_text: questionText,
          question_image: questionImage || null,
          question_audio: questionAudio || null,
          audio_text: audioText || null,
          question_type: questionType,
          points: parseInt(points) || 10,
          order_index: nextOrder,
        })
        .select()
        .single()

      if (qError) throw qError

      const optionsToInsert = options
        .filter((o) => o.text.trim() !== '')
        .map((o, i) => ({
          question_id: newQ.id,
          option_text: o.text,
          is_correct: o.isCorrect,
          order_index: i + 1,
        }))

      const { error: optError } = await supabase
        .from('answer_options')
        .insert(optionsToInsert)

      if (optError) throw optError

      router.push(`/admin/kuis`)
      router.refresh()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan soal')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-3 animate-bounce">📝</div>
          <p className="text-violet-600 font-bold">Memuat form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/kuis')}
          className="mb-4 flex items-center gap-2 text-violet-600 hover:text-violet-800 font-black transition-colors active:scale-95"
        >
          <ArrowLeft size={18} />
          Kembali ke Daftar Kuis
        </button>
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black mb-3 shadow-lg shadow-violet-300/50">
          <Sparkles size={12} className="fill-yellow-300 text-yellow-300" />
          TAMBAH SOAL
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-violet-900 mb-1">
          ✨ Buat Soal Baru
        </h1>
        <p className="text-violet-500 font-bold text-sm">
          Kuis: <span className="text-violet-700">{quiz?.title}</span>
        </p>
      </div>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 font-bold p-4 rounded-2xl mb-5 flex items-start gap-2 text-sm">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ===== SECTION 1: PERTANYAAN ===== */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-violet-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2 rounded-2xl shadow-lg shadow-violet-300/50">
              <HelpCircle size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-violet-900">📝 Pertanyaan</h2>
          </div>

          <div className="space-y-4">
            {/* Tipe Soal */}
            <div>
              <label className="block text-xs font-black text-violet-700 mb-1.5">
                Tipe Soal
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQuestionType('multiple_choice')}
                  className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all active:scale-95 flex items-center gap-1.5 ${
                    questionType === 'multiple_choice'
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md shadow-violet-300/50'
                      : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                  }`}
                >
                  <ListChecks size={14} />
                  Pilihan Ganda
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionType('true_false')}
                  className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all active:scale-95 flex items-center gap-1.5 ${
                    questionType === 'true_false'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-300/50'
                      : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                  }`}
                >
                  <Check size={14} />
                  Benar / Salah
                </button>
              </div>
            </div>

            {/* Teks Pertanyaan */}
            <div>
              <label className="block text-xs font-black text-violet-700 mb-1.5">
                Teks Pertanyaan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Contoh: Berapa jumlah pulau di Indonesia?"
                rows={3}
                required
                className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal bg-violet-50/30 focus:bg-white resize-none text-sm transition-colors"
              />
            </div>

            {/* Poin */}
            <div>
              <label className="block text-xs font-black text-violet-700 mb-1.5">
                Poin Nilai
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min="1"
                className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 bg-violet-50/30 focus:bg-white text-sm transition-colors"
              />
            </div>

            {/* Audio Text */}
            <div>
              <label className="block text-xs font-black text-violet-700 mb-1.5 flex items-center gap-1.5">
                <Volume2 size={12} className="text-violet-500" />
                Teks Audio (Opsional)
              </label>
              <input
                type="text"
                value={audioText}
                onChange={(e) => setAudioText(e.target.value)}
                placeholder="Kalau diisi, soal bisa dibacakan otomatis (TTS)"
                className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal bg-violet-50/30 focus:bg-white text-sm transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ===== SECTION 2: MEDIA SOAL ===== */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-pink-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white p-2 rounded-2xl shadow-lg shadow-pink-300/50">
              <ImagePlay size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-violet-900">🖼️ Media Soal (Opsional)</h2>
          </div>

          <div className="space-y-5">
            {/* Gambar Soal */}
            <div>
              <label className="block text-xs font-black text-pink-700 mb-1.5 flex items-center gap-1.5">
                <ImageIcon size={12} className="text-pink-500" />
                Gambar Soal
              </label>
              {questionImage && (
                <div className="relative mb-3 inline-block">
                  <img
                    src={questionImage}
                    alt="Soal"
                    className="w-40 h-40 object-cover rounded-2xl border-4 border-pink-200 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setQuestionImage('')}
                    className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(file, 'thumbnails', setUploadingImage, setQuestionImage)
                  }}
                  className="hidden"
                  id="upload-q-image"
                />
                <label
                  htmlFor="upload-q-image"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 text-pink-700 font-black px-5 py-3 rounded-2xl cursor-pointer transition-all active:scale-95"
                >
                  {uploadingImage ? (
                    <>
                      <div className="w-5 h-5 border-3 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Pilih Gambar
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Audio Soal */}
            <div>
              <label className="block text-xs font-black text-pink-700 mb-1.5 flex items-center gap-1.5">
                <Music size={12} className="text-pink-500" />
                Audio Soal (untuk siswa ABK)
              </label>
              {questionAudio && (
                <p className="text-[10px] text-emerald-600 font-black mb-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-3 py-1.5 inline-block">
                  ✅ Audio ter-upload
                </p>
              )}
              <div className="flex gap-2 flex-wrap">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(file, 'audio', setUploadingAudio, setQuestionAudio)
                  }}
                  className="hidden"
                  id="upload-q-audio"
                />
                <label
                  htmlFor="upload-q-audio"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 text-emerald-700 font-black px-5 py-3 rounded-2xl cursor-pointer transition-all active:scale-95"
                >
                  {uploadingAudio ? (
                    <>
                      <div className="w-5 h-5 border-3 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Music size={18} />
                      Upload Audio Soal
                    </>
                  )}
                </label>
                {questionAudio && (
                  <button
                    type="button"
                    onClick={() => setQuestionAudio('')}
                    className="bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-600 font-black px-4 py-3 rounded-2xl transition-all active:scale-95 flex items-center gap-2"
                  >
                    <X size={16} />
                    Hapus Audio
                  </button>
                )}
              </div>
              <p className="text-[10px] text-violet-400 font-bold mt-2">
                💡 Audio soal membantu siswa ABK mendengar pertanyaan
              </p>
            </div>
          </div>
        </div>

        {/* ===== SECTION 3: PILIHAN JAWABAN ===== */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-2 rounded-2xl shadow-lg shadow-emerald-300/50">
                <Check size={18} />
              </div>
              <h2 className="text-base sm:text-lg font-black text-violet-900">
                {questionType === 'true_false' ? '✓✗ Jawaban' : '📋 Pilihan Jawaban'}
              </h2>
            </div>
            {questionType === 'multiple_choice' && (
              <button
                type="button"
                onClick={addOption}
                className="bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 text-emerald-700 font-black px-3 py-2 rounded-2xl text-xs transition-all active:scale-95 flex items-center gap-1"
              >
                <Plus size={14} />
                Tambah
              </button>
            )}
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-3 mb-4 text-[11px] text-emerald-700 font-bold flex items-center gap-2">
            <Crown size={14} className="text-emerald-500 flex-shrink-0" />
            Klik tombol <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded font-black">✓</span> untuk menandai jawaban yang <strong>BENAR</strong>
          </div>

          <div className="space-y-2.5">
            {options.map((opt, index) => (
              <div key={index} className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setCorrectOption(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all active:scale-95 ${
                    opt.isCorrect
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-300/50 scale-110'
                      : 'bg-violet-50 text-violet-400 hover:bg-emerald-100 hover:text-emerald-600 border-2 border-violet-100'
                  }`}
                  title="Tandai sebagai jawaban benar"
                >
                  {opt.isCorrect ? <Check size={22} /> : String.fromCharCode(65 + index)}
                </button>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOption(index, 'text', e.target.value)}
                  placeholder={`Pilihan ${String.fromCharCode(65 + index)}...`}
                  disabled={questionType === 'true_false'}
                  className={`flex-1 px-4 py-3 border-2 rounded-2xl focus:outline-none font-bold text-violet-900 placeholder:font-normal text-sm transition-colors ${
                    opt.isCorrect
                      ? 'border-emerald-300 bg-emerald-50/50 focus:border-emerald-400 placeholder:text-emerald-300'
                      : 'border-violet-100 bg-violet-50/30 focus:border-violet-400 focus:bg-white placeholder:text-violet-300'
                  } disabled:bg-gray-50 disabled:text-gray-500`}
                />
                {questionType === 'multiple_choice' && options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="flex-shrink-0 bg-gradient-to-br from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-500 p-3 rounded-2xl transition-all active:scale-95"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== TOMBOL SIMPAN ===== */}
        <div className="sticky bottom-4 z-30">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-violet-200 p-4 flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/kuis')}
              className="flex-1 bg-violet-100 hover:bg-violet-200 text-violet-700 font-black py-4 rounded-2xl transition-all active:scale-95 text-sm"
            >
              BATAL
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage || uploadingAudio}
              className={`flex-[2] font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
                saving || uploadingImage || uploadingAudio
                  ? 'bg-gray-300 text-gray-500 cursor-wait'
                  : 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white hover:scale-105 shadow-violet-300/50'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Rocket size={20} />
                  SIMPAN SOAL
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}