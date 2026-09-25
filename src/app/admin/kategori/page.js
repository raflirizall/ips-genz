'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, FolderOpen, X, Save, AlertTriangle } from 'lucide-react'

export default function AdminKategoriPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Form
  const [form, setForm] = useState({
    name: '',
    icon: '📚',
    color: '#3B82F6',
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
      color: '#3B82F6',
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
      color: cat.color || '#3B82F6',
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
        // Update
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
        // Insert
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
          <div className="text-6xl mb-3 animate-spin">📂</div>
          <p className="text-gray-500 font-bold">Memuat kategori...</p>
        </div>
      </div>
    )
  }

  const iconPresets = ['📚', '🌏', '📜', '💰', '👥', '🎭', '🇮🇩', '🧪', '🎨', '🎵', '⚽', '🔬', '🎬', '💡', '🌟', '📖']
  const colorPresets = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-1">📂 Kelola Kategori</h1>
          <p className="text-gray-500 font-bold">{categories.length} kategori tersedia</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          Tambah Kategori
        </button>
      </div>

      {/* LIST KATEGORI */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-12 text-center">
          <div className="text-6xl mb-3">📭</div>
          <h3 className="text-xl font-black text-gray-800 mb-2">Belum ada kategori</h3>
          <p className="text-gray-500 font-bold mb-6">Tambah kategori pertama!</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            <Plus size={20} />
            Tambah Kategori
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl shadow-md border-4 p-5 hover:shadow-lg transition-shadow"
              style={{ borderColor: (cat.color || '#3B82F6') + '40' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                  style={{ backgroundColor: (cat.color || '#3B82F6') + '20' }}
                >
                  {cat.icon || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-800 truncate">{cat.name}</h3>
                  <p className="text-xs text-gray-400 font-bold">Urutan: {cat.order_index}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 font-black py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(cat)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-black py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
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
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-green-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-20 -mt-4 -mr-4">📂</div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FolderOpen size={32} />
                </div>
                <h2 className="text-2xl font-black">
                  {editing ? 'Edit Kategori' : 'Tambah Kategori'}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 font-bold p-3 rounded-xl text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Geografi"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="📚"
                  maxLength="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none font-bold text-gray-800 text-2xl"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {iconPresets.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, icon: emoji })}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-green-100 text-xl transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Warna
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-16 h-12 rounded-xl cursor-pointer border-2 border-gray-200"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none font-mono font-bold text-gray-800 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className="w-10 h-10 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-white"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Urutan Tampil
                </label>
                <input
                  type="number"
                  value={form.order_index}
                  onChange={(e) => setForm({ ...form, order_index: e.target.value })}
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none font-bold text-gray-800"
                />
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs font-black text-gray-500 mb-2">PREVIEW</p>
                <div
                  className="inline-flex flex-col items-center gap-2 p-4 rounded-2xl"
                  style={{ backgroundColor: form.color + '20' }}
                >
                  <span className="text-4xl">{form.icon}</span>
                  <span className="font-black text-gray-800">{form.name || 'Nama Kategori'}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 rounded-xl transition-colors"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 font-black py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    saving
                      ? 'bg-gray-300 text-gray-500 cursor-wait'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-3 border-white/40 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
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
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-red-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-red-400 to-pink-500 p-6 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-20 -mt-4 -mr-4">⚠️</div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={44} className="text-white" />
                </div>
                <h2 className="text-2xl font-black">Hapus Kategori?</h2>
                <p className="text-white/90 font-bold text-sm mt-1">
                  Materi dengan kategori ini akan menjadi "Tanpa Kategori"
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border-4 border-red-100 rounded-2xl p-4 mb-5">
                <p className="text-xs font-black text-red-500 mb-1">KATEGORI YANG AKAN DIHAPUS:</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: (deleteTarget.color || '#3B82F6') + '30' }}
                  >
                    {deleteTarget.icon || '📚'}
                  </div>
                  <p className="font-black text-gray-800">{deleteTarget.name}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X size={20} />
                  BATAL
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white font-black py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {deleting ? (
                    <>
                      <div className="w-5 h-5 border-4 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 size={20} />
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