'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  Plus, Edit, Trash2, Eye, Search, AlertTriangle, X, BookOpen, 
  Sparkles, Rocket, Compass, FolderOpen, CheckCircle 
} from 'lucide-react'

export default function AdminMateriPage() {
  const [materials, setMaterials] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchMaterials()
  }, [])

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(materials)
    } else {
      const q = search.toLowerCase()
      setFiltered(
        materials.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.categories?.name.toLowerCase().includes(q)
        )
      )
    }
  }, [search, materials])

  async function fetchMaterials() {
    const { data } = await supabase
      .from('materials')
      .select('*, categories(name, icon, color)')
      .order('created_at', { ascending: false })

    setMaterials(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  function openDeleteModal(material) {
    setDeleteTarget(material)
    setShowDeleteModal(true)
  }

  function closeDeleteModal() {
    setShowDeleteModal(false)
    setDeleteTarget(null)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(deleteTarget.id)

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', deleteTarget.id)

    if (error) {
      alert('Gagal hapus: ' + error.message)
    } else {
      await fetchMaterials()
    }
    setDeleting(null)
    closeDeleteModal()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-3 animate-bounce">📚</div>
          <p className="text-violet-600 font-bold">Memuat materi...</p>
        </div>
      </div>
    )
  }

  return (
    <div>

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black mb-3 shadow-lg shadow-violet-300/50">
            <BookOpen size={12} />
            KELOLA MATERI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-violet-900 mb-1">
            Daftar Materi 📚
          </h1>
          <p className="text-violet-500 font-bold text-sm">
            {materials.length} materi tersedia
          </p>
        </div>
        <Link
          href="/admin/materi/tambah"
          className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white font-black px-5 py-3 rounded-2xl shadow-lg shadow-violet-300/50 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 justify-center"
        >
          <Plus size={18} />
          Tambah Materi
        </Link>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-violet-200 p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari materi atau kategori..."
            className="w-full pl-11 pr-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal bg-violet-50/30 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* ===== LIST MATERI ===== */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl border-2 border-violet-200 p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-100 to-pink-100 rounded-3xl mb-4">
            <span className="text-5xl">{search ? '🔍' : '📭'}</span>
          </div>
          <h3 className="text-lg font-black text-violet-900 mb-1">
            {search ? 'Tidak ditemukan' : 'Belum ada materi'}
          </h3>
          <p className="text-violet-500 font-bold text-sm mb-5">
            {search ? 'Coba kata kunci lain' : 'Ayo tambahkan materi pertama!'}
          </p>
          {!search && (
            <Link
              href="/admin/materi/tambah"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-black px-5 py-3 rounded-2xl shadow-lg shadow-violet-300/50 active:scale-95 hover:scale-105 transition-transform"
            >
              <Rocket size={18} />
              Tambah Materi Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-2xl shadow-md border-2 border-violet-100 hover:border-violet-300 hover:shadow-lg transition-all p-4"
            >
              <div className="flex items-center gap-3">

                {/* Icon Kategori */}
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${mat.categories?.color || '#8B5CF6'}, ${mat.categories?.color || '#8B5CF6'}CC)` 
                  }}
                >
                  <span className="drop-shadow">{mat.categories?.icon || '📖'}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full text-white shadow-md"
                      style={{ 
                        backgroundColor: mat.categories?.color || '#8B5CF6',
                        boxShadow: `0 4px 12px -2px ${mat.categories?.color || '#8B5CF6'}80`
                      }}
                    >
                      {mat.categories?.name || 'Tanpa Kategori'}
                    </span>
                    {mat.is_published ? (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md flex items-center gap-0.5">
                        <CheckCircle size={9} />
                        PUBLISHED
                      </span>
                    ) : (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md">
                        DRAFT
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-violet-900 truncate mb-0.5 text-sm sm:text-base">
                    {mat.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-violet-500 font-bold truncate">
                    {mat.excerpt || 'Tanpa deskripsi'}
                  </p>
                </div>

                {/* Aksi */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link
                    href={`/materi/${mat.slug}`}
                    target="_blank"
                    className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 hover:from-violet-200 hover:to-purple-200 transition-all active:scale-95"
                    title="Preview"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    href={`/admin/materi/edit/${mat.id}`}
                    className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 hover:from-amber-200 hover:to-orange-200 transition-all active:scale-95"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => openDeleteModal(mat)}
                    className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 hover:from-pink-200 hover:to-rose-200 transition-all active:scale-95"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== MODAL HAPUS ===== */}
      {showDeleteModal && deleteTarget && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-violet-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 p-6 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-20 -mt-3 -mr-3">⚠️</div>
              <div className="absolute bottom-0 left-0 text-6xl opacity-15 -mb-2 -ml-2">✨</div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-3 border-2 border-white/30 shadow-lg">
                  <AlertTriangle size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-black">Hapus Materi?</h2>
                <p className="text-white/90 font-bold text-xs mt-1">
                  Tindakan ini tidak bisa dibatalkan
                </p>
              </div>
            </div>

            {/* Body Modal */}
            <div className="p-5">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl p-4 mb-5">
                <p className="text-[10px] font-black text-pink-600 mb-2 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle size={10} />
                  Materi yang akan dihapus:
                </p>
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${deleteTarget.categories?.color || '#8B5CF6'}, ${deleteTarget.categories?.color || '#8B5CF6'}CC)` 
                    }}
                  >
                    <span className="drop-shadow">{deleteTarget.categories?.icon || '📖'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-violet-900 text-sm leading-tight">
                      {deleteTarget.title}
                    </p>
                    <p className="text-[10px] text-violet-500 font-bold mt-1">
                      {deleteTarget.categories?.name || 'Tanpa kategori'}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-violet-500 font-bold mb-4">
                Yakin mau hapus materi ini? 🗑️
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting === deleteTarget.id}
                  className="flex-1 bg-violet-100 hover:bg-violet-200 text-violet-700 font-black py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  <X size={18} />
                  BATAL
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting === deleteTarget.id}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-pink-300/50 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {deleting === deleteTarget.id ? (
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