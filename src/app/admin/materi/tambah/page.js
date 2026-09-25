'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Upload, Video, Image as ImageIcon, Music, BookOpen, Lightbulb, X, Plus, Eye, EyeOff } from 'lucide-react'

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

      const { data, error: insertError } = await supabase
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
        .select()
        .single()

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
          <div className="text-6xl mb-3 animate-spin">📝</div>
          <p className="text-gray-500 font-bold">Memuat form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/materi')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-500 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          Kembali ke Daftar Materi
        </button>
        <h1 className="text-3xl font-black text-gray-800 mb-1">
          ✨ Tambah Materi Baru
        </h1>
        <p className="text-gray-500 font-bold">
          Isi form di bawah untuk membuat materi baru
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-4 border-red-200 text-red-600 font-bold p-4 rounded-2xl mb-6 flex items-start gap-3">
          <X size={24} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECTION 1: INFORMASI DASAR */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-blue-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
              <BookOpen size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800">📝 Informasi Dasar</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Judul Materi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="Contoh: Kondisi Geografis Indonesia"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => updateForm('category_id', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none font-bold text-gray-800 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Kelas
                </label>
                <select
                  value={form.grade}
                  onChange={(e) => updateForm('grade', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none font-bold text-gray-800 bg-white"
                >
                  <option value="VII">VII</option>
                  <option value="VIII">VIII</option>
                  <option value="IX">IX</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Deskripsi Singkat
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => updateForm('excerpt', e.target.value)}
                placeholder="Ringkasan materi dalam 1-2 kalimat..."
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Durasi (menit)
              </label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => updateForm('duration_minutes', e.target.value)}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none font-bold text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: THUMBNAIL */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-purple-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-xl">
              <ImageIcon size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800">🖼️ Thumbnail</h2>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">
              Upload Gambar Thumbnail
            </label>

            {form.thumbnail && (
              <div className="relative mb-3 inline-block">
                <img
                  src={form.thumbnail}
                  alt="Thumbnail"
                  className="w-48 h-32 object-cover rounded-xl border-4 border-purple-200"
                />
                <button
                  type="button"
                  onClick={() => updateForm('thumbnail', '')}
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
                  if (file) uploadFile(file, 'thumbnails', setUploadingThumb, 'thumbnail')
                }}
                className="hidden"
                id="upload-thumb"
              />
              <label
                htmlFor="upload-thumb"
                className="inline-flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-black px-5 py-3 rounded-xl cursor-pointer transition-colors"
              >
                {uploadingThumb ? (
                  <>
                    <div className="w-5 h-5 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
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
        </div>

        {/* SECTION 3: VIDEO */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-red-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-red-100 text-red-600 p-2 rounded-xl">
              <Video size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800">🎬 Video (Opsional)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Jenis Video
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => updateForm('video_type', 'none')}
                  className={`px-4 py-2 rounded-xl font-black text-sm transition-colors ${
                    form.video_type === 'none'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🚫 Tidak Ada
                </button>
                <button
                  type="button"
                  onClick={() => updateForm('video_type', 'youtube')}
                  className={`px-4 py-2 rounded-xl font-black text-sm transition-colors ${
                    form.video_type === 'youtube'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  ▶️ YouTube
                </button>
                <button
                  type="button"
                  onClick={() => updateForm('video_type', 'upload')}
                  className={`px-4 py-2 rounded-xl font-black text-sm transition-colors ${
                    form.video_type === 'upload'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  📤 Upload
                </button>
              </div>
            </div>

            {form.video_type === 'youtube' && (
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  URL YouTube
                </label>
                <input
                  type="url"
                  value={form.video_url}
                  onChange={(e) => updateForm('video_url', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=xxxxx"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
            )}

            {form.video_type === 'upload' && (
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Upload Video (MP4)
                </label>
                {form.video_file && (
                  <p className="text-xs text-green-600 font-black mb-2">
                    ✅ Video ter-upload
                  </p>
                )}
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
                  className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-black px-5 py-3 rounded-xl cursor-pointer transition-colors"
                >
                  {uploadingVideo ? (
                    <>
                      <div className="w-5 h-5 border-4 border-red-300 border-t-red-600 rounded-full animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Pilih Video
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: AUDIO */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-green-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-green-100 text-green-600 p-2 rounded-xl">
              <Music size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800">🔊 Audio (Opsional)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                URL Audio (link langsung ke file MP3)
              </label>
              <input
                type="url"
                value={form.audio_url}
                onChange={(e) => updateForm('audio_url', e.target.value)}
                placeholder="https://contoh.com/audio.mp3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>

            <div className="text-center text-xs text-gray-400 font-black">ATAU</div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Upload Audio (MP3/WAV)
              </label>
              {form.audio_file && (
                <p className="text-xs text-green-600 font-black mb-2">
                  ✅ Audio ter-upload
                </p>
              )}
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
                className="inline-flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-black px-5 py-3 rounded-xl cursor-pointer transition-colors"
              >
                {uploadingAudio ? (
                  <>
                    <div className="w-5 h-5 border-4 border-green-300 border-t-green-600 rounded-full animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Pilih Audio
                  </>
                )}
              </label>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 text-xs text-yellow-700 font-bold">
              💡 <strong>TTS (Text-to-Speech)</strong>: Kalau audio tidak diupload, siswa tetap bisa dengarkan materi dengan tombol "🔊 Bacakan Materi" otomatis.
            </div>
          </div>
        </div>

        {/* SECTION 5: KONTEN */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-orange-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
              <BookOpen size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800">📖 Konten Materi</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Pengantar Singkat
              </label>
              <textarea
                value={form.intro}
                onChange={(e) => updateForm('intro', e.target.value)}
                placeholder="Kalimat pembuka untuk memancing rasa ingin tahu siswa..."
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Isi Materi
              </label>
              <textarea
                value={form.content}
                onChange={(e) => updateForm('content', e.target.value)}
                placeholder="Tulis materi di sini. Bisa pakai HTML sederhana seperti <b>bold</b>, <ul><li>list</li></ul>, dll."
                rows={8}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-400 font-bold mt-1">
                💡 Bisa pakai HTML: &lt;b&gt;tebal&lt;/b&gt;, &lt;i&gt;miring&lt;/i&gt;, &lt;ul&gt;&lt;li&gt;list&lt;/li&gt;&lt;/ul&gt;
              </p>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Kesimpulan
              </label>
              <textarea
                value={form.conclusion}
                onChange={(e) => updateForm('conclusion', e.target.value)}
                placeholder="Poin utama yang harus diingat siswa..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal resize-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: POIN PENTING */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-yellow-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-100 text-yellow-600 p-2 rounded-xl">
                <Lightbulb size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-800">📌 Poin Penting</h2>
            </div>
            <button
              type="button"
              onClick={addKeyPoint}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-black px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-1"
            >
              <Plus size={16} />
              Tambah
            </button>
          </div>

          <div className="space-y-3">
            {form.key_points.map((point, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black w-10 h-10 rounded-xl flex items-center justify-center">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => updateKeyPoint(index, e.target.value)}
                  placeholder={`Poin penting ${index + 1}...`}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
                />
                {form.key_points.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKeyPoint(index)}
                    className="flex-shrink-0 bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-xl transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: PENGATURAN */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
          <h2 className="text-xl font-black text-gray-800 mb-5">⚙️ Pengaturan</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-100">
              <div className="flex items-center gap-3">
                {form.is_published ? (
                  <Eye size={20} className="text-green-600" />
                ) : (
                  <EyeOff size={20} className="text-gray-500" />
                )}
                <div>
                  <p className="font-black text-gray-800">Publikasikan</p>
                  <p className="text-xs text-gray-500 font-bold">
                    {form.is_published ? 'Materi tampil untuk siswa' : 'Materi disembunyikan (draft)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateForm('is_published', !form.is_published)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  form.is_published ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    form.is_published ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔊</span>
                <div>
                  <p className="font-black text-gray-800">Text-to-Speech</p>
                  <p className="text-xs text-gray-500 font-bold">
                    Siswa bisa dengarkan materi dengan tombol "Bacakan"
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateForm('tts_enabled', !form.tts_enabled)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  form.tts_enabled ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    form.tts_enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* TOMBOL SIMPAN */}
        <div className="sticky bottom-4 z-30">
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-blue-200 p-4 flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/materi')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-4 rounded-2xl transition-colors"
            >
              BATAL
            </button>
            <button
              type="submit"
              disabled={saving || uploadingThumb || uploadingVideo || uploadingAudio}
              className={`flex-[2] font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                saving || uploadingThumb || uploadingVideo || uploadingAudio
                  ? 'bg-gray-300 text-gray-500 cursor-wait'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:scale-105'
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