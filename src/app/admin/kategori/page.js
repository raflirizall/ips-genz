'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Plus, Edit, Trash2, FolderOpen, X, Save, AlertTriangle, Sparkles,
  Rocket, Compass, CheckCircle, Palette, Smile 
} from 'lucide-react'

export default function AdminKategoriPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    icon: '📚',
    color: '#8B5CF6',
    order_index: 1,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('order_index')

    setCategories(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm({
      name: '',
      icon: '📚',
      color: '#8B5CF6',
      order_index: categories.length + 1,
    })
    setError('')
    setShowModal(true)
  }

  function openEdit(cat) {
    setEditing(cat)
    setForm({
      name: cat.name,
      icon: cat.icon || '📚',
      color: cat.color || '#8B5CF6',
      order_index: cat.order_index || 1,
    })
    setError('')
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Nama kategori wajib diisi')
      return
    }

    setSaving(true)

    try {
      const slug = form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')

      if (editing) {
        const { error: updateError } = await supabase
          .from('categories')
          .update({
            name: form.name,
            slug: slug,
            icon: form.icon,
            color: form.color,
            order_index: parseInt(form.order_index) || 1,
          })
          .eq('id', editing.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('categories')
          .insert({
            name: form.name,
            slug: slug,
            icon: form.icon,
            color: form.color,
            order_index: parseInt(form.order_index) || 1,
          })

        if (insertError) throw insertError
      }

      setShowModal(false)
      await fetchCategories()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  function openDeleteModal(cat) {
    setDeleteTarget(cat)
    setShowDeleteModal(true)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', deleteTarget.id)

    if (error) {
      alert('Gagal hapus: ' + error.message)
    } else {
      await fetchCategories()
    }
    setDeleting(false)
    setShowDeleteModal(false)
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-3 animate-bounce">🗂️</div>
          <p className="text-violet-600 font-bold">Memuat kategori...</p>
        </div>
      </div>
    )
  }

  const iconPresets = ['📚', '🌏', '📜', '💰', '👥', '🎭', '🇮🇩', '🧪', '🎨', '🎵', '⚽', '🔬', '🎬', '💡', '🌟', '📖', '🧭', '🏆']
  const colorPresets = [
    { name: 'Violet', color: '#8B5CF6' },
    { name: 'Pink', color: '#EC4899' },
    { name: 'Amber', color: '#F59E0B' },
    { name: 'Emerald', color: '#10B981' },
    { name: 'Sky', color: '#0EA5E9' },
    { name: 'Rose', color: '#F43F5E' },
    { name: 'Cyan', color: '#06B6D4' },
    { name: 'Orange', color: '#F97316' },
  ]

  return (
    <div>

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black mb-3 shadow-lg shadow-violet-300/50">
            <FolderOpen size={12} />
            KELOLA KATEGORI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-violet-900 mb-1">
            Kategori Mata Pelajaran 🗂️
          </h1>
          <p className="text-violet-500 font-bold text-sm">
            {categories.length} kategori tersedia
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white font-black px-5 py-3 rounded-2xl shadow-lg shadow-violet-300/50 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 justify-center"
        >
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {/* ===== LIST KATEGORI ===== */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl border-2 border-violet-200 p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-100 to-pink-100 rounded-3xl mb-4">
            <span className="text-5xl">📭</span>
          </div>
          <h3 className="text-lg font-black text-violet-900 mb-1">Belum ada kategori</h3>
          <p className="text-violet-500 font-bold text-sm mb-5">Ayo tambahkan kategori pertama!</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-black px-5 py-3 rounded-2xl shadow-lg shadow-violet-300/50 active:scale-95 hover:scale-105 transition-transform"
          >
            <Rocket size={18} />
            Tambah Kategori
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl shadow-md border-2 hover:shadow-lg transition-all p-5 relative overflow-hidden"
              style={{ borderColor: (cat.color || '#8B5CF6') + '60' }}
            >
              {/* Dekorasi background */}
              <div 
                className="absolute top-0 right-0 text-7xl opacity-5 -mt-2 -mr-2 pointer-events-none"
              >
                {cat.icon}
              </div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${cat.color || '#8B5CF6'}, ${cat.color || '#8B5CF6'}CC)` 
                    }}
                  >
                    <span className="drop-shadow-lg">{cat.icon || '📚'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-violet-900 truncate text-base">{cat.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span 
                        className="text-[9px] font-black px-2 py-0.5 rounded-full text-white shadow-md"
                        style={{ backgroundColor: cat.color || '#8B5CF6' }}
                      >
                        #{cat.order_index}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="flex-1 bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-700 font-black py-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 text-xs active:scale-95"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(cat)}
                    className="flex-1 bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 text-pink-700 font-black py-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 text-xs active:scale-95"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== MODAL ADD/EDIT ===== */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-violet-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 p-6 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-15 -mt-2 -mr-2">✨</div>
              <div className="absolute bottom-0 left-0 text-6xl opacity-15 -mb-2 -ml-2">🗂️</div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-3 border-2 border-white/30 shadow-lg">
                  <FolderOpen size={30} />
                </div>
                <h2 className="text-xl font-black">
                  {editing ? 'Edit Kategori' : 'Tambah Kategori'}
                </h2>
                <p className="text-white/80 text-[10px] font-bold mt-1">
                  {editing ? 'Ubah data kategori' : 'Buat kategori baru'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 font-bold p-3 rounded-2xl text-xs flex items-start gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Nama */}
              <div>
                <label className="block text-xs font-black text-violet-700 mb-1.5">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Geografi"
                  required
                  className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal text-sm bg-violet-50/30 focus:bg-white transition-colors"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-black text-violet-700 mb-1.5 flex items-center gap-1.5">
                  <Smile size={12} className="text-violet-500" />
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="📚"
                  maxLength="4"
                  className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 text-2xl text-center bg-violet-50/30 focus:bg-white transition-colors"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {iconPresets.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, icon: emoji })}
                      className={`w-9 h-9 rounded-xl transition-all text-lg active:scale-90 ${
                        form.icon === emoji
                          ? 'bg-gradient-to-br from-violet-500 to-pink-500 shadow-md scale-110'
                          : 'bg-violet-50 hover:bg-violet-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-black text-violet-700 mb-1.5 flex items-center gap-1.5">
                  <Palette size={12} className="text-violet-500" />
                  Warna
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-14 h-12 rounded-xl cursor-pointer border-2 border-violet-200"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="flex-1 px-3 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-mono font-bold text-violet-900 text-xs bg-violet-50/30 focus:bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => setForm({ ...form, color: preset.color })}
                      className={`w-9 h-9 rounded-xl shadow-md hover:scale-110 active:scale-95 transition-transform border-2 ${
                        form.color === preset.color ? 'border-white ring-2 ring-violet-400' : 'border-white'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Urutan */}
              <div>
                <label className="block text-xs font-black text-violet-700 mb-1.5">
                  Urutan Tampil
                </label>
                <input
                  type="number"
                  value={form.order_index}
                  onChange={(e) => setForm({ ...form, order_index: e.target.value })}
                  min="1"
                  className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 text-sm bg-violet-50/30 focus:bg-white transition-colors"
                />
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50 rounded-2xl p-4 border-2 border-violet-100">
                <p className="text-[10px] font-black text-violet-500 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1">
                  <Sparkles size={10} />
                  Preview
                </p>
                <div
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 shadow-md"
                  style={{ 
                    backgroundColor: form.color + '15',
                    borderColor: form.color + '60'
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${form.color}, ${form.color}CC)` 
                    }}
                  >
                    <span className="drop-shadow">{form.icon}</span>
                  </div>
                  <span className="font-black text-violet-900 text-sm">{form.name || 'Nama Kategori'}</span>
                </div>
              </div>

              {/* Tombol */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-violet-100 hover:bg-violet-200 text-violet-700 font-black py-3.5 rounded-2xl transition-colors active:scale-95"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 font-black py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    saving
                      ? 'bg-gray-300 text-gray-500 cursor-wait'
                      : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:scale-105 shadow-violet-300/50'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      SIMPAN
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL HAPUS ===== */}
      {showDeleteModal && deleteTarget && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-violet-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 p-6 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-20 -mt-3 -mr-3">⚠️</div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-3 border-2 border-white/30 shadow-lg">
                  <AlertTriangle size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-black">Hapus Kategori?</h2>
                <p className="text-white/90 font-bold text-xs mt-1">
                  Materi dengan kategori ini akan jadi "Tanpa Kategori"
                </p>
              </div>
            </div>

            <div className="p-5">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl p-4 mb-5">
                <p className="text-[10px] font-black text-pink-600 mb-2 uppercase tracking-wider">Kategori yang akan dihapus:</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${deleteTarget.color || '#8B5CF6'}, ${deleteTarget.color || '#8B5CF6'}CC)` 
                    }}
                  >
                    <span className="drop-shadow">{deleteTarget.icon || '📚'}</span>
                  </div>
                  <p className="font-black text-violet-900 text-sm">{deleteTarget.name}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 bg-violet-100 hover:bg-violet-200 text-violet-700 font-black py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  <X size={18} />
                  BATAL
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-pink-300/50 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      YA, HAPUS
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}