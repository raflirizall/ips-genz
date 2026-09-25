'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Search, Trophy, Target, BookOpen } from 'lucide-react'

export default function AdminSiswaPage() {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentResults, setStudentResults] = useState([])

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(students)
    } else {
      const q = search.toLowerCase()
      setFiltered(
        students.filter(
          (s) =>
            (s.full_name || '').toLowerCase().includes(q) ||
            (s.class_name || '').toLowerCase().includes(q) ||
            (s.no_absen || '').toLowerCase().includes(q)
        )
      )
    }
  }, [search, students])

  async function fetchStudents() {
    // Ambil semua siswa
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('class_name', { ascending: true })
      .order('no_absen', { ascending: true })

    // Ambil hasil kuis untuk hitung rata-rata
    const { data: results } = await supabase
      .from('quiz_results')
      .select('student_id, score')

    // Hitung statistik per siswa
    const studentsWithStats = (profiles || []).map((s) => {
      const studentScores = (results || []).filter((r) => r.student_id === s.id)
      const avg = studentScores.length > 0
        ? Math.round(studentScores.reduce((sum, r) => sum + r.score, 0) / studentScores.length)
        : 0
      const best = studentScores.length > 0
        ? Math.max(...studentScores.map((r) => r.score))
        : 0
      return {
        ...s,
        quizCount: studentScores.length,
        avgScore: avg,
        bestScore: best,
      }
    })

    setStudents(studentsWithStats)
    setFiltered(studentsWithStats)
    setLoading(false)
  }

  async function handleSelectStudent(student) {
    setSelectedStudent(student)

    const { data: results } = await supabase
      .from('quiz_results')
      .select(`
        *,
        quizzes (title, materials(title, slug, categories(name, icon, color)))
      `)
      .eq('student_id', student.id)
      .order('completed_at', { ascending: false })

    setStudentResults(results || [])
  }

  function getScoreColor(score) {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-blue-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-3 animate-spin">👥</div>
          <p className="text-gray-500 font-bold">Memuat siswa...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-800 mb-1">👥 Daftar Siswa</h1>
        <p className="text-gray-500 font-bold">{students.length} siswa terdaftar</p>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, kelas, atau no absen..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
          />
        </div>
      </div>

      {/* LIST SISWA */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-12 text-center">
          <div className="text-6xl mb-3">📭</div>
          <h3 className="text-xl font-black text-gray-800 mb-2">
            {search ? 'Tidak ditemukan' : 'Belum ada siswa'}
          </h3>
          <p className="text-gray-500 font-bold">
            {search ? 'Coba kata kunci lain' : 'Siswa akan muncul setelah mereka login'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student) => (
            <button
              key={student.id}
              onClick={() => handleSelectStudent(student)}
              className="bg-white rounded-2xl shadow-md border-2 border-blue-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-2xl text-white font-black flex-shrink-0">
                  {(student.full_name || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-800 truncate">
                    {student.full_name || 'Tanpa Nama'}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold">
                    Kelas {student.class_name || '-'} • No {student.no_absen || '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 rounded-xl p-2">
                  <div className="text-xl font-black text-blue-500">{student.quizCount}</div>
                  <div className="text-[10px] font-black text-gray-500">KUIS</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-2">
                  <div className={`text-xl font-black ${getScoreColor(student.avgScore)}`}>
                    {student.avgScore}
                  </div>
                  <div className="text-[10px] font-black text-gray-500">RATA</div>
                </div>
                <div className="bg-green-50 rounded-xl p-2">
                  <div className={`text-xl font-black ${getScoreColor(student.bestScore)}`}>
                    {student.bestScore}
                  </div>
                  <div className="text-[10px] font-black text-gray-500">TERBAIK</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ===== MODAL DETAIL SISWA ===== */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border-4 border-blue-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-20 -mt-4 -mr-4">👤</div>
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-black flex-shrink-0">
                  {(selectedStudent.full_name || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-black truncate">
                    {selectedStudent.full_name || 'Tanpa Nama'}
                  </h2>
                  <p className="text-blue-100 font-bold text-sm">
                    Kelas {selectedStudent.class_name || '-'} • No Absen {selectedStudent.no_absen || '-'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-center">
                  <Target className="mx-auto text-blue-500 mb-1" size={24} />
                  <div className="text-2xl font-black text-blue-500">{selectedStudent.quizCount}</div>
                  <div className="text-xs font-black text-gray-500">KUIS</div>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 text-center">
                  <Trophy className="mx-auto text-yellow-500 mb-1" size={24} />
                  <div className={`text-2xl font-black ${getScoreColor(selectedStudent.avgScore)}`}>
                    {selectedStudent.avgScore}
                  </div>
                  <div className="text-xs font-black text-gray-500">RATA-RATA</div>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                  <BookOpen className="mx-auto text-green-500 mb-1" size={24} />
                  <div className={`text-2xl font-black ${getScoreColor(selectedStudent.bestScore)}`}>
                    {selectedStudent.bestScore}
                  </div>
                  <div className="text-xs font-black text-gray-500">TERBAIK</div>
                </div>
              </div>

              <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500" />
                Riwayat Kuis
              </h3>

              {studentResults.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-gray-500 font-bold text-sm">Belum ada riwayat kuis</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {studentResults.map((result) => {
                    const material = result.quizzes?.materials
                    const category = material?.categories
                    return (
                      <div
                        key={result.id}
                        className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                            style={{ backgroundColor: (category?.color || '#3B82F6') + '20' }}
                          >
                            {category?.icon || '📖'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-gray-800 text-sm truncate">
                              {result.quizzes?.title || 'Kuis'}
                            </p>
                            <p className="text-xs text-gray-500 font-bold">
                              {new Date(result.completed_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className={`text-2xl font-black flex-shrink-0 ${getScoreColor(result.score)}`}>
                          {result.score}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}