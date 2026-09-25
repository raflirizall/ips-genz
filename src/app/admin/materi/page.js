'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Eye, Search, AlertTriangle, X } from 'lucide-react'

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
          <div className="text-6xl mb-3 animate-spin">📚</div>
          <p className="text-gray-500 font-bold">Memuat materi...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-1">
            📚 Kelola Materi
          </h1>
          <p className="text-gray-500 font-bold">
            {materials.length} materi tersedia
          </p>
        </div>
        <Link
          href="/admin/materi/tambah"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          Tambah Materi
        </Link>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari materi atau kategori..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
          />
        </div>
      </div>

      {/* LIST MATERI */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-12 text-center">
          <div className="text-6xl mb-3">📭</div>
          <h3 className="text-xl font-black text-gray-800 mb-2">
            {search ? 'Tidak ditemukan' : 'Belum ada materi'}
          </h3>
          <p className="text-gray-500 font-bold mb-6">
            {search ? 'Coba kata kunci lain' : 'Ayo tambahkan materi pertama!'}
          </p>
          {!search && (
            <Link
              href="/admin/materi/tambah"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              <Plus size={20} />
              Tambah Materi Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ backgroundColor: (mat.categories?.color || '#3B82F6') + '20' }}
                >
                  {mat.categories?.icon || '📖'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: mat.categories?.color || '#3B82F6' }}
                    >
                      {mat.categories?.name || 'Tanpa Kategori'}
                    </span>
                    {mat.is_published ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        ✓ PUBLISHED
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        DRAFT
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-gray-800 truncate mb-1">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold truncate">
                    {mat.excerpt || 'Tanpa deskripsi'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/materi/${mat.slug}`}
                    target="_blank"
                    className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Preview"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    href={`/admin/materi/edit/${mat.id}`}
                    className="p-2.5 rounded-xl bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => openDeleteModal(mat)}
                    className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== MODAL KONFIRMASI HAPUS ===== */}
      {showDeleteModal && deleteTarget && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-red-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-red-400 to-pink-500 p-6 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-20 -mt-4 -mr-4">⚠️</div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={44} className="text-white" />
                </div>
                <h2 className="text-2xl font-black">Hapus Materi?</h2>
                <p className="text-white/90 font-bold text-sm mt-1">
                  Tindakan ini tidak bisa dibatalkan
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-red-50 border-4 border-red-100 rounded-2xl p-4 mb-5">
                <p className="text-xs font-black text-red-500 mb-1">MATERI YANG AKAN DIHAPUS:</p>
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: (deleteTarget.categories?.color || '#3B82F6') + '30' }}
                  >
                    {deleteTarget.categories?.icon || '📖'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-gray-800 leading-tight">
                      {deleteTarget.title}
                    </p>
                    <p className="text-xs text-gray-500 font-bold mt-1">
                      {deleteTarget.categories?.name || 'Tanpa kategori'}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 font-bold mb-5">
                Yakin mau hapus materi ini? 🗑️
              </p>

              {/* Tombol */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting === deleteTarget.id}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X size={20} />
                  BATAL
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting === deleteTarget.id}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white font-black py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {deleting === deleteTarget.id ? (
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