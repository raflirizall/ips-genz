'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Save, Upload, Video, Image as ImageIcon, Music, 
  BookOpen, Lightbulb, X, Plus, Eye, EyeOff, Sparkles, Rocket,
  FileText, AlertTriangle
} from 'lucide-react'

export default function TambahMateriPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    category_id: '',
    grade: 'VII',
    excerpt: '',
    thumbnail: '',
    video_type: 'none',
    video_url: '',
    video_file: '',
    audio_url: '',
    audio_file: '',
    intro: '',
    content: '',
    key_points: [''],
    conclusion: '',
    tts_enabled: true,
    is_published: true,
    duration_minutes: 5,
  })

  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('order_index')

      setCategories(data || [])
      if (data && data.length > 0) {
        setForm((f) => ({ ...f, category_id: data[0].id }))
      }
      setLoading(false)
    }
    fetchCategories()
  }, [])

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const addKeyPoint = () => {
    setForm((prev) => ({ ...prev, key_points: [...prev.key_points, ''] }))
  }

  const updateKeyPoint = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.key_points]
      updated[index] = value
      return { ...prev, key_points: updated }
    })
  }

  const removeKeyPoint = (index) => {
    setForm((prev) => ({
      ...prev,
      key_points: prev.key_points.filter((_, i) => i !== index),
    }))
  }

  async function uploadFile(file, bucket, setUploading, fieldName) {
    setUploading(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      updateForm(fieldName, urlData.publicUrl)
    } catch (err) {
      setError(`Gagal upload: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Judul materi wajib diisi')
      return
    }
    if (!form.category_id) {
      setError('Pilih kategori dulu')
      return
    }

    setSaving(true)

    try {
      const slug = form.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')

      const cleanKeyPoints = form.key_points.filter((p) => p.trim() !== '')

      const { error: insertError } = await supabase
        .from('materials')
        .insert({
          title: form.title,
          slug: slug,
          category_id: form.category_id,
          excerpt: form.excerpt,
          cover_image: form.thumbnail,
          video_type: form.video_type,
          video_url: form.video_url,
          video_file: form.video_file,
          audio_url: form.audio_url,
          audio_file: form.audio_file,
          intro: form.intro,
          content: form.content,
          key_points: cleanKeyPoints,
          conclusion: form.conclusion,
          grade: form.grade,
          tts_enabled: form.tts_enabled,
          is_published: form.is_published,
          duration_minutes: parseInt(form.duration_minutes) || 5,
        })

      if (insertError) throw insertError

      router.push('/admin/materi')
      router.refresh()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan materi')
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
    <div className="max-w-4xl mx-auto">

      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/materi')}
          className="mb-4 flex items-center gap-2 text-violet-600 hover:text-violet-800 font-black transition-colors active:scale-95"
        >
          <ArrowLeft size={18} />
          Kembali ke Daftar Materi
        </button>
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black mb-3 shadow-lg shadow-violet-300/50">
          <Sparkles size={12} className="fill-yellow-300 text-yellow-300" />
          TAMBAH MATERI
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-violet-900 mb-1">
          ✨ Buat Materi Baru
        </h1>
        <p className="text-violet-500 font-bold text-sm">
          Isi form di bawah untuk membuat materi baru
        </p>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 font-bold p-4 rounded-2xl mb-5 flex items-start gap-2 text-sm">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* SECTION 1: INFORMASI DASAR */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-violet-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2 rounded-2xl shadow-lg shadow-violet-300/50">
              <BookOpen size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-violet-900">📝 Informasi Dasar</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-violet-700 mb-1.5">
                Judul Materi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="Contoh: Kondisi Geografis Indonesia"
                required
                className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal bg-violet-50/30 focus:bg-white transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-violet-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                <select
                  value={form.category_id}
                  onChange={(e) => updateForm('category_id', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 bg-violet-50/30 focus:bg-white text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-violet-700 mb-1.5">Kelas</label>
                <select
                  value={form.grade}
                  onChange={(e) => updateForm('grade', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 bg-violet-50/30 focus:bg-white text-sm"
                >
                  <option value="VII">VII</option>
                  <option value="VIII">VIII</option>
                  <option value="IX">IX</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-violet-700 mb-1.5">Deskripsi Singkat</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => updateForm('excerpt', e.target.value)}
                placeholder="Ringkasan materi dalam 1-2 kalimat..."
                rows={2}
                className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal bg-violet-50/30 focus:bg-white resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-violet-700 mb-1.5">Durasi (menit)</label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => updateForm('duration_minutes', e.target.value)}
                min="1"
                className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 bg-violet-50/30 focus:bg-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: THUMBNAIL */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-pink-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white p-2 rounded-2xl shadow-lg shadow-pink-300/50">
              <ImageIcon size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-violet-900">🖼️ Thumbnail</h2>
          </div>

          <div>
            {form.thumbnail && (
              <div className="relative mb-3 inline-block">
                <img src={form.thumbnail} alt="Thumbnail" className="w-48 h-32 object-cover rounded-2xl border-4 border-pink-200 shadow-lg" />
                <button
                  type="button"
                  onClick={() => updateForm('thumbnail', '')}
                  className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadFile(file, 'thumbnails', setUploadingThumb, 'thumbnail')
              }}
              className="hidden"
              id="upload-thumb"
            />
            <label
              htmlFor="upload-thumb"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 text-pink-700 font-black px-5 py-3 rounded-2xl cursor-pointer transition-all active:scale-95"
            >
              {uploadingThumb ? (
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

        {/* SECTION 3: VIDEO */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-2 rounded-2xl shadow-lg shadow-amber-300/50">
              <Video size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-violet-900">🎬 Video (Opsional)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-amber-700 mb-1.5">Jenis Video</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => updateForm('video_type', 'none')}
                  className={`px-4 py-2 rounded-2xl font-black text-xs transition-all active:scale-95 ${
                    form.video_type === 'none'
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
                      : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                  }`}
                >
                  🚫 Tidak Ada
                </button>
                <button
                  type="button"
                  onClick={() => updateForm('video_type', 'youtube')}
                  className={`px-4 py-2 rounded-2xl font-black text-xs transition-all active:scale-95 ${
                    form.video_type === 'youtube'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
                      : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                  }`}
                >
                  ▶️ YouTube
                </button>
                <button
                  type="button"
                  onClick={() => updateForm('video_type', 'upload')}
                  className={`px-4 py-2 rounded-2xl font-black text-xs transition-all active:scale-95 ${
                    form.video_type === 'upload'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
                      : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                  }`}
                >
                  📤 Upload
                </button>
              </div>
            </div>

            {form.video_type === 'youtube' && (
              <div>
                <label className="block text-xs font-black text-amber-700 mb-1.5">URL YouTube</label>
                <input
                  type="url"
                  value={form.video_url}
                  onChange={(e) => updateForm('video_url', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=xxxxx"
                  className="w-full px-4 py-3 border-2 border-amber-100 rounded-2xl focus:border-amber-400 focus:outline-none font-bold text-violet-900 placeholder:text-amber-300 placeholder:font-normal bg-amber-50/30 focus:bg-white text-sm"
                />
              </div>
            )}

            {form.video_type === 'upload' && (
              <div>
                <label className="block text-xs font-black text-amber-700 mb-1.5">Upload Video (MP4)</label>
                {form.video_file && (
                  <p className="text-[10px] text-emerald-600 font-black mb-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-3 py-1.5 inline-block">
                    ✅ Video ter-upload
                  </p>
                )}
                <div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadFile(file, 'videos', setUploadingVideo, 'video_file')
                    }}
                    className="hidden"
                    id="upload-video"
                  />
                  <label
                    htmlFor="upload-video"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-700 font-black px-5 py-3 rounded-2xl cursor-pointer transition-all active:scale-95"
                  >
                    {uploadingVideo ? (
                      <>
                        <div className="w-5 h-5 border-3 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Pilih Video
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: AUDIO */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-2 rounded-2xl shadow-lg shadow-emerald-300/50">
              <Music size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-violet-900">🔊 Audio (Opsional)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-emerald-700 mb-1.5">URL Audio</label>
              <input
                type="url"
                value={form.audio_url}
                onChange={(e) => updateForm('audio_url', e.target.value)}
                placeholder="https://contoh.com/audio.mp3"
                className="w-full px-4 py-3 border-2 border-emerald-100 rounded-2xl focus:border-emerald-400 focus:outline-none font-bold text-violet-900 placeholder:text-emerald-300 placeholder:font-normal bg-emerald-50/30 focus:bg-white text-sm"
              />
            </div>

            <div className="text-center text-[10px] text-violet-400 font-black">— ATAU —</div>

            <div>
              <label className="block text-xs font-black text-emerald-700 mb-1.5">Upload Audio (MP3/WAV)</label>
              {form.audio_file && (
                <p className="text-[10px] text-emerald-600 font-black mb-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-3 py-1.5 inline-block">
                  ✅ Audio ter-upload
                </p>
              )}
              <div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(file, 'audio', setUploadingAudio, 'audio_file')
                  }}
                  className="hidden"
                  id="upload-audio"
                />
                <label
                  htmlFor="upload-audio"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 text-emerald-700 font-black px-5 py-3 rounded-2xl cursor-pointer transition-all active:scale-95"
                >
                  {uploadingAudio ? (
                    <>
                      <div className="w-5 h-5 border-3 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Pilih Audio
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-3 text-[11px] text-amber-700 font-bold">
              💡 <strong>TTS</strong>: Kalau audio tidak diupload, siswa tetap bisa dengarkan materi dengan tombol "🔊 Bacakan Materi" otomatis.
            </div>
          </div>
        </div>

        {/* SECTION 5: KONTEN */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-violet-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2 rounded-2xl shadow-lg shadow-violet-300/50">
              <FileText size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-violet-900">📖 Konten Materi</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-violet-700 mb-1.5">Pengantar Singkat</label>
              <textarea
                value={form.intro}
                onChange={(e) => updateForm('intro', e.target.value)}
                placeholder="Kalimat pembuka untuk memancing rasa ingin tahu siswa..."
                rows={2}
                className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal bg-violet-50/30 focus:bg-white resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-violet-700 mb-1.5">Isi Materi</label>
              <textarea
                value={form.content}
                onChange={(e) => updateForm('content', e.target.value)}
                placeholder="Tulis materi di sini. Bisa pakai HTML sederhana."
                rows={8}
                className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal bg-violet-50/30 focus:bg-white resize-none font-mono text-xs"
              />
              <p className="text-[10px] text-violet-400 font-bold mt-1.5">
                💡 Bisa pakai HTML: &lt;b&gt;tebal&lt;/b&gt;, &lt;i&gt;miring&lt;/i&gt;
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-violet-700 mb-1.5">Kesimpulan</label>
              <textarea
                value={form.conclusion}
                onChange={(e) => updateForm('conclusion', e.target.value)}
                placeholder="Poin utama yang harus diingat siswa..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal bg-violet-50/30 focus:bg-white resize-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: POIN PENTING */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-2 rounded-2xl shadow-lg shadow-amber-300/50">
                <Lightbulb size={18} />
              </div>
              <h2 className="text-base sm:text-lg font-black text-violet-900">📌 Poin Penting</h2>
            </div>
            <button
              type="button"
              onClick={addKeyPoint}
              className="bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-700 font-black px-3 py-2 rounded-2xl text-xs transition-all active:scale-95 flex items-center gap-1"
            >
              <Plus size={14} />
              Tambah
            </button>
          </div>

          <div className="space-y-2.5">
            {form.key_points.map((point, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black w-10 h-10 rounded-2xl flex items-center justify-center shadow-md text-sm">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => updateKeyPoint(index, e.target.value)}
                  placeholder={`Poin penting ${index + 1}...`}
                  className="flex-1 px-4 py-2.5 border-2 border-amber-100 rounded-2xl focus:border-amber-400 focus:outline-none font-bold text-violet-900 placeholder:text-amber-300 placeholder:font-normal bg-amber-50/30 focus:bg-white text-sm"
                />
                {form.key_points.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKeyPoint(index)}
                    className="flex-shrink-0 bg-gradient-to-br from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-500 p-2.5 rounded-2xl transition-all active:scale-95"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: PENGATURAN */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-violet-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-violet-500 to-pink-500 text-white p-2 rounded-2xl shadow-lg shadow-violet-300/50">
              <Sparkles size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-violet-900">⚙️ Pengaturan</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
              <div className="flex items-center gap-3">
                {form.is_published ? (
                  <Eye size={18} className="text-emerald-600" />
                ) : (
                  <EyeOff size={18} className="text-violet-400" />
                )}
                <div>
                  <p className="font-black text-violet-900 text-sm">Publikasikan</p>
                  <p className="text-[10px] text-violet-500 font-bold">
                    {form.is_published ? 'Materi tampil untuk siswa' : 'Materi disembunyikan (draft)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateForm('is_published', !form.is_published)}
                className={`relative w-14 h-8 rounded-full transition-colors active:scale-95 ${
                  form.is_published ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-violet-200'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${form.is_published ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl border-2 border-violet-200">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔊</span>
                <div>
                  <p className="font-black text-violet-900 text-sm">Text-to-Speech</p>
                  <p className="text-[10px] text-violet-500 font-bold">
                    Siswa bisa dengarkan materi dengan tombol "Bacakan"
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateForm('tts_enabled', !form.tts_enabled)}
                className={`relative w-14 h-8 rounded-full transition-colors active:scale-95 ${
                  form.tts_enabled ? 'bg-gradient-to-r from-violet-500 to-pink-500' : 'bg-violet-200'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${form.tts_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* TOMBOL SIMPAN */}
        <div className="sticky bottom-4 z-30">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-violet-200 p-4 flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/materi')}
              className="flex-1 bg-violet-100 hover:bg-violet-200 text-violet-700 font-black py-4 rounded-2xl transition-all active:scale-95 text-sm"
            >
              BATAL
            </button>
            <button
              type="submit"
              disabled={saving || uploadingThumb || uploadingVideo || uploadingAudio}
              className={`flex-[2] font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
                saving || uploadingThumb || uploadingVideo || uploadingAudio
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
                  SIMPAN MATERI
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}