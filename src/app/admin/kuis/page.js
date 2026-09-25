'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Target, ChevronDown, ChevronUp, HelpCircle, AlertTriangle, X } from 'lucide-react'

export default function AdminKuisPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [materialsWithoutQuiz, setMaterialsWithoutQuiz] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [creating, setCreating] = useState(false)

  // Delete modal state
  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false)
  const [deleteQuizTarget, setDeleteQuizTarget] = useState(null)
  const [deletingQuiz, setDeletingQuiz] = useState(false)

  const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState(false)
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null)
  const [deletingQuestion, setDeletingQuestion] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    const { data: quizData } = await supabase
      .from('quizzes')
      .select(`
        *,
        materials (id, title, slug, categories(name, icon, color)),
        questions (
          id,
          question_text,
          question_type,
          points,
          order_index,
          answer_options (*)
        )
      `)
      .order('created_at', { ascending: false })

    const sorted = (quizData || []).map((q) => ({
      ...q,
      questions: (q.questions || []).sort((a, b) => a.order_index - b.order_index),
    }))

    setQuizzes(sorted)

    const { data: allMaterials } = await supabase
      .from('materials')
      .select('id, title, categories(name, icon)')
      .eq('is_published', true)
      .order('title')

    const quizMaterialIds = (quizData || []).map((q) => q.material_id)
    const withoutQuiz = (allMaterials || []).filter(
      (m) => !quizMaterialIds.includes(m.id)
    )
    setMaterialsWithoutQuiz(withoutQuiz)
    setLoading(false)
  }

  async function handleCreateQuiz() {
    if (!selectedMaterial) return
    setCreating(true)

    const material = materialsWithoutQuiz.find((m) => m.id === selectedMaterial)

    const { error } = await supabase.from('quizzes').insert({
      material_id: selectedMaterial,
      title: `Kuis: ${material?.title || 'Materi'}`,
      description: `Uji pemahamanmu tentang ${material?.title || 'materi'}`,
      passing_score: 70,
    })

    if (error) {
      alert('Gagal membuat kuis: ' + error.message)
    } else {
      setShowCreateModal(false)
      setSelectedMaterial('')
      await fetchData()
    }
    setCreating(false)
  }

  function openDeleteQuizModal(quiz) {
    setDeleteQuizTarget(quiz)
    setShowDeleteQuizModal(true)
  }

  function closeDeleteQuizModal() {
    setShowDeleteQuizModal(false)
    setDeleteQuizTarget(null)
  }

  async function handleConfirmDeleteQuiz() {
    if (!deleteQuizTarget) return
    setDeletingQuiz(true)

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', deleteQuizTarget.id)

    if (error) {
      alert('Gagal hapus: ' + error.message)
    } else {
      await fetchData()
    }
    setDeletingQuiz(false)
    closeDeleteQuizModal()
  }

  function openDeleteQuestionModal(question) {
    setDeleteQuestionTarget(question)
    setShowDeleteQuestionModal(true)
  }

  function closeDeleteQuestionModal() {
    setShowDeleteQuestionModal(false)
    setDeleteQuestionTarget(null)
  }

  async function handleConfirmDeleteQuestion() {
    if (!deleteQuestionTarget) return
    setDeletingQuestion(true)

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', deleteQuestionTarget.id)

    if (error) {
      alert('Gagal hapus soal: ' + error.message)
    } else {
      await fetchData()
    }
    setDeletingQuestion(false)
    closeDeleteQuestionModal()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-3 animate-spin">🎯</div>
          <p className="text-gray-500 font-bold">Memuat kuis...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-1">
            🎯 Kelola Kuis & Soal
          </h1>
          <p className="text-gray-500 font-bold">
            {quizzes.length} kuis tersedia
          </p>
        </div>
        {materialsWithoutQuiz.length > 0 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black px-5 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            Buat Kuis Baru
          </button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-12 text-center">
          <div className="text-6xl mb-3">📭</div>
          <h3 className="text-xl font-black text-gray-800 mb-2">Belum ada kuis</h3>
          <p className="text-gray-500 font-bold mb-6">
            Buat kuis untuk materi yang sudah ada
          </p>
          {materialsWithoutQuiz.length > 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              <Plus size={20} />
              Buat Kuis Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const isExpanded = expandedId === quiz.id
            const category = quiz.materials?.categories

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl shadow-md border-2 border-purple-100 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ backgroundColor: (category?.color || '#8B5CF6') + '20' }}
                    >
                      {category?.icon || '🎯'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: category?.color || '#8B5CF6' }}
                        >
                          {category?.name || 'Umum'}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          {quiz.questions?.length || 0} SOAL
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          LULUS: {quiz.passing_score}
                        </span>
                      </div>
                      <h3 className="font-black text-gray-800 truncate mb-1">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-bold truncate">
                        📚 {quiz.materials?.title || 'Materi'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : quiz.id)}
                        className="p-2.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                        title={isExpanded ? 'Tutup' : 'Lihat Soal'}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      <button
                        onClick={() => openDeleteQuizModal(quiz)}
                        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Hapus Kuis"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t-2 border-purple-100 bg-purple-50/50 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <HelpCircle size={20} className="text-purple-600" />
                        <h4 className="font-black text-gray-800">Daftar Soal</h4>
                      </div>
                      <Link
                        href={`/admin/kuis/${quiz.id}/soal/tambah`}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black px-4 py-2 rounded-xl text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-1.5"
                      >
                        <Plus size={16} />
                        Tambah Soal
                      </Link>
                    </div>

                    {quiz.questions?.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-purple-200">
                        <div className="text-4xl mb-2">📝</div>
                        <p className="text-gray-500 font-bold text-sm">
                          Belum ada soal. Tambah soal pertama!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {quiz.questions.map((q, idx) => (
                          <div
                            key={q.id}
                            className="bg-white rounded-xl p-4 border-2 border-purple-100"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 bg-gradient-to-br from-pink-400 to-purple-500 text-white font-black w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 text-sm mb-2">
                                  {q.question_text}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {q.answer_options?.map((opt) => (
                                    <span
                                      key={opt.id}
                                      className={`text-[10px] font-black px-2 py-1 rounded-full ${
                                        opt.is_correct
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-gray-100 text-gray-500'
                                      }`}
                                    >
                                      {opt.is_correct && '✓ '}
                                      {opt.option_text.length > 25
                                        ? opt.option_text.substring(0, 25) + '...'
                                        : opt.option_text}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Link
                                  href={`/admin/kuis/${quiz.id}/soal/edit/${q.id}`}
                                  className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </Link>
                                <button
                                  onClick={() => openDeleteQuestionModal(q)}
                                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ===== MODAL BUAT KUIS ===== */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-purple-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-6 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-20 -mt-4 -mr-4">🎯</div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Target size={32} />
                </div>
                <h2 className="text-2xl font-black">Buat Kuis Baru</h2>
                <p className="text-white/90 font-bold text-sm mt-1">
                  Pilih materi untuk dibuatkan kuis
                </p>
              </div>
            </div>

            <div className="p-6">
              <label className="block text-sm font-black text-gray-700 mb-2">
                Pilih Materi
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none font-bold text-gray-800 bg-white mb-5"
              >
                <option value="">-- Pilih materi --</option>
                {materialsWithoutQuiz.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.categories?.icon} {m.title}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 rounded-xl transition-colors"
                >
                  BATAL
                </button>
                <button
                  onClick={handleCreateQuiz}
                  disabled={!selectedMaterial || creating}
                  className={`flex-1 font-black py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    !selectedMaterial || creating
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105'
                  }`}
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-3 border-white/40 border-t-white rounded-full animate-spin" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Buat Kuis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL KONFIRMASI HAPUS KUIS ===== */}
      {showDeleteQuizModal && deleteQuizTarget && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeDeleteQuizModal}
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
                <h2 className="text-2xl font-black">Hapus Kuis?</h2>
                <p className="text-white/90 font-bold text-sm mt-1">
                  Semua soal di dalamnya juga akan terhapus
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border-4 border-red-100 rounded-2xl p-4 mb-5">
                <p className="text-xs font-black text-red-500 mb-1">KUIS YANG AKAN DIHAPUS:</p>
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: (deleteQuizTarget.materials?.categories?.color || '#8B5CF6') + '30' }}
                  >
                    {deleteQuizTarget.materials?.categories?.icon || '🎯'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-gray-800 leading-tight">
                      {deleteQuizTarget.title}
                    </p>
                    <p className="text-xs text-gray-500 font-bold mt-1">
                      {deleteQuizTarget.questions?.length || 0} soal akan terhapus
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 font-bold mb-5">
                Yakin mau hapus kuis ini? 🗑️
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeDeleteQuizModal}
                  disabled={deletingQuiz}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X size={20} />
                  BATAL
                </button>
                <button
                  onClick={handleConfirmDeleteQuiz}
                  disabled={deletingQuiz}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white font-black py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {deletingQuiz ? (
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

      {/* ===== MODAL KONFIRMASI HAPUS SOAL ===== */}
      {showDeleteQuestionModal && deleteQuestionTarget && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeDeleteQuestionModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-red-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-20 -mt-4 -mr-4">⚠️</div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={44} className="text-white" />
                </div>
                <h2 className="text-2xl font-black">Hapus Soal?</h2>
                <p className="text-white/90 font-bold text-sm mt-1">
                  Tindakan ini tidak bisa dibatalkan
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border-4 border-red-100 rounded-2xl p-4 mb-5">
                <p className="text-xs font-black text-red-500 mb-1">SOAL YANG AKAN DIHAPUS:</p>
                <p className="font-black text-gray-800 leading-tight">
                  {deleteQuestionTarget.question_text}
                </p>
              </div>

              <p className="text-center text-sm text-gray-500 font-bold mb-5">
                Yakin mau hapus soal ini? 🗑️
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeDeleteQuestionModal}
                  disabled={deletingQuestion}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X size={20} />
                  BATAL
                </button>
                <button
                  onClick={handleConfirmDeleteQuestion}
                  disabled={deletingQuestion}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {deletingQuestion ? (
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