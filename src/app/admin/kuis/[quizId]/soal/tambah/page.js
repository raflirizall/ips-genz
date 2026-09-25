'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Plus, X, Check, Upload, Image as ImageIcon, Music, HelpCircle } from 'lucide-react'

export default function TambahSoalPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
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

  // === OPTIONS ===
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

  // === HANDLE TYPE CHANGE (Benar/Salah) ===
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

  // === UPLOAD ===
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

  // === SUBMIT ===
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
      // Cek order_index saat ini
      const { data: existing } = await supabase
        .from('questions')
        .select('order_index')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrder = existing && existing.length > 0 ? existing[0].order_index + 1 : 1

      // 1. Insert question
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

      // 2. Insert options
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
          <div className="text-6xl mb-3 animate-spin">📝</div>
          <p className="text-gray-500 font-bold">Memuat form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/kuis')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-purple-500 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          Kembali ke Daftar Kuis
        </button>
        <h1 className="text-3xl font-black text-gray-800 mb-1">
          ✨ Tambah Soal Baru
        </h1>
        <p className="text-gray-500 font-bold">
          Kuis: <span className="text-purple-600">{quiz?.title}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-4 border-red-200 text-red-600 font-bold p-4 rounded-2xl mb-6 flex items-start gap-3">
          <X size={24} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECTION 1: PERTANYAAN */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-purple-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-xl">
              <HelpCircle size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800">📝 Pertanyaan</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Tipe Soal
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQuestionType('multiple_choice')}
                  className={`px-5 py-3 rounded-xl font-black text-sm transition-colors ${
                    questionType === 'multiple_choice'
                      ? 'bg-purple-500 text-white'
                      : 'bg-purple-100 text-purple-600'
                  }`}
                >
                  📋 Pilihan Ganda
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionType('true_false')}
                  className={`px-5 py-3 rounded-xl font-black text-sm transition-colors ${
                    questionType === 'true_false'
                      ? 'bg-purple-500 text-white'
                      : 'bg-purple-100 text-purple-600'
                  }`}
                >
                  ✓✗ Benar / Salah
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Teks Pertanyaan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Contoh: Berapa jumlah pulau di Indonesia?"
                rows={3}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Poin Nilai
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none font-bold text-gray-800"
              />
            </div>

            {/* Audio text untuk TTS */}
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Teks Audio (Opsional)
              </label>
              <input
                type="text"
                value={audioText}
                onChange={(e) => setAudioText(e.target.value)}
                placeholder="Kalau diisi, soal bisa dibacakan otomatis (TTS)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: GAMBAR & AUDIO SOAL */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-blue-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
              <ImageIcon size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800">🖼️ Media Soal (Opsional)</h2>
          </div>

          <div className="space-y-5">
            {/* Gambar soal */}
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Gambar Soal
              </label>
              {questionImage && (
                <div className="relative mb-3 inline-block">
                  <img
                    src={questionImage}
                    alt="Soal"
                    className="w-40 h-40 object-cover rounded-xl border-4 border-blue-200"
                  />
                  <button
                    type="button"
                    onClick={() => setQuestionImage('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
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
                  className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-black px-5 py-3 rounded-xl cursor-pointer transition-colors"
                >
                  {uploadingImage ? (
                    <>
                      <div className="w-5 h-5 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Pilih Gambar
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Audio soal */}
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Audio Soal (untuk siswa ABK)
              </label>
              {questionAudio && (
                <p className="text-xs text-green-600 font-black mb-2">
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
                  className="inline-flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-black px-5 py-3 rounded-xl cursor-pointer transition-colors"
                >
                  {uploadingAudio ? (
                    <>
                      <div className="w-5 h-5 border-4 border-green-300 border-t-green-600 rounded-full animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Music size={20} />
                      Upload Audio Soal
                    </>
                  )}
                </label>
                {questionAudio && (
                  <button
                    type="button"
                    onClick={() => setQuestionAudio('')}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-black px-4 py-3 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <X size={18} />
                    Hapus Audio
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 font-bold mt-2">
                💡 Audio soal membantu siswa ABK mendengar pertanyaan
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: PILIHAN JAWABAN */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-green-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 text-green-600 p-2 rounded-xl">
                <Check size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-800">
                {questionType === 'true_false' ? '✓✗ Jawaban' : '📋 Pilihan Jawaban'}
              </h2>
            </div>
            {questionType === 'multiple_choice' && (
              <button
                type="button"
                onClick={addOption}
                className="bg-green-100 hover:bg-green-200 text-green-700 font-black px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-1"
              >
                <Plus size={16} />
                Tambah
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 font-bold mb-4">
            💡 Klik tombol <span className="text-green-600">✓</span> untuk menandai jawaban yang <strong>BENAR</strong>
          </p>

          <div className="space-y-3">
            {options.map((opt, index) => (
              <div key={index} className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setCorrectOption(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black transition-colors ${
                    opt.isCorrect
                      ? 'bg-green-500 text-white shadow-lg scale-110'
                      : 'bg-gray-100 text-gray-400 hover:bg-green-100'
                  }`}
                  title="Tandai sebagai jawaban benar"
                >
                  {opt.isCorrect ? <Check size={24} /> : String.fromCharCode(65 + index)}
                </button>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOption(index, 'text', e.target.value)}
                  placeholder={`Pilihan ${String.fromCharCode(65 + index)}...`}
                  disabled={questionType === 'true_false'}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal disabled:bg-gray-50 disabled:text-gray-500"
                />
                {questionType === 'multiple_choice' && options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="flex-shrink-0 bg-red-50 hover:bg-red-100 text-red-500 p-3 rounded-xl transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TOMBOL SIMPAN */}
        <div className="sticky bottom-4 z-30">
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-200 p-4 flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/kuis')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-4 rounded-2xl transition-colors"
            >
              BATAL
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage || uploadingAudio}
              className={`flex-[2] font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                saving || uploadingImage || uploadingAudio
                  ? 'bg-gray-300 text-gray-500 cursor-wait'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-4 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={22} />
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