'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Users, Search, Trophy, Target, BookOpen, Sparkles, Crown,
  Compass, Award, TrendingUp, CheckCircle, Clock, Medal, X
} from 'lucide-react'

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
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('class_name', { ascending: true })
      .order('no_absen', { ascending: true })

    const { data: results } = await supabase
      .from('quiz_results')
      .select('student_id, score')

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

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-emerald-400 to-teal-500'
    if (score >= 60) return 'from-blue-400 to-cyan-500'
    if (score >= 40) return 'from-amber-400 to-orange-500'
    return 'from-red-400 to-pink-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-3 animate-bounce">🧭</div>
          <p className="text-violet-600 font-bold">Memuat siswa...</p>
        </div>
      </div>
    )
  }

  return (
    <div>

      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black mb-3 shadow-lg shadow-violet-300/50">
          <Users size={12} />
          DAFTAR SISWA
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-violet-900 mb-1">
          Siswa Terdaftar 👥
        </h1>
        <p className="text-violet-500 font-bold text-sm">
          {students.length} siswa terdaftar
        </p>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-violet-200 p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, kelas, atau no absen..."
            className="w-full pl-11 pr-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal bg-violet-50/30 focus:bg-white transition-colors text-sm"
          />
        </div>
      </div>

      {/* ===== LIST SISWA ===== */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl border-2 border-violet-200 p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-100 to-pink-100 rounded-3xl mb-4">
            <span className="text-5xl">{search ? '🔍' : '👥'}</span>
          </div>
          <h3 className="text-lg font-black text-violet-900 mb-1">
            {search ? 'Tidak ditemukan' : 'Belum ada siswa'}
          </h3>
          <p className="text-violet-500 font-bold text-sm">
            {search ? 'Coba kata kunci lain' : 'Siswa akan muncul setelah mereka login'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((student) => (
            <button
              key={student.id}
              onClick={() => handleSelectStudent(student)}
              className="bg-white rounded-3xl shadow-md border-2 border-violet-100 hover:border-violet-300 hover:shadow-lg hover:-translate-y-1 transition-all p-4 text-left active:scale-[0.98] relative overflow-hidden group"
            >
              {/* Dekorasi */}
              <div className="absolute top-0 right-0 text-7xl opacity-5 -mt-2 -mr-2 group-hover:opacity-10 transition-opacity">
                🎓
              </div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl text-white font-black flex-shrink-0 shadow-lg shadow-violet-300/50">
                    {(student.full_name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-violet-900 truncate text-sm sm:text-base">
                      {student.full_name || 'Tanpa Nama'}
                    </h3>
                    <p className="text-[10px] text-violet-500 font-bold flex items-center gap-1 mt-0.5">
                      <Users size={10} />
                      Kelas {student.class_name || '-'} • No {student.no_absen || '-'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-100 rounded-2xl p-2 text-center">
                    <Target size={14} className="text-violet-500 mx-auto mb-0.5" />
                    <div className="text-lg font-black text-violet-600 leading-none">{student.quizCount}</div>
                    <div className="text-[8px] font-black text-violet-400 uppercase mt-0.5">Kuis</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100 rounded-2xl p-2 text-center">
                    <Medal size={14} className="text-amber-500 mx-auto mb-0.5" />
                    <div className={`text-lg font-black leading-none bg-gradient-to-br ${getScoreGradient(student.avgScore)} bg-clip-text text-transparent`}>
                      {student.avgScore}
                    </div>
                    <div className="text-[8px] font-black text-amber-400 uppercase mt-0.5">Rata</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl p-2 text-center">
                    <Trophy size={14} className="text-emerald-500 mx-auto mb-0.5" />
                    <div className={`text-lg font-black leading-none bg-gradient-to-br ${getScoreGradient(student.bestScore)} bg-clip-text text-transparent`}>
                      {student.bestScore}
                    </div>
                    <div className="text-[8px] font-black text-emerald-400 uppercase mt-0.5">Terbaik</div>
                  </div>
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
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border-2 border-violet-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-15 -mt-3 -mr-3">🎓</div>
              <div className="absolute bottom-0 left-0 text-6xl opacity-15 -mb-2 -ml-2">✨</div>
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-3xl sm:text-4xl font-black flex-shrink-0 shadow-lg">
                  {(selectedStudent.full_name || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-black mb-1.5 border border-white/30">
                    <Crown size={9} className="fill-yellow-300 text-yellow-300" />
                    SISWA
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black truncate">
                    {selectedStudent.full_name || 'Tanpa Nama'}
                  </h2>
                  <p className="text-white/85 font-bold text-xs flex items-center gap-1 mt-1">
                    <Users size={11} />
                    Kelas {selectedStudent.class_name || '-'} • No Absen {selectedStudent.no_absen || '-'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-2xl transition-colors active:scale-95 border border-white/30"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="p-5">
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl p-3 text-center">
                  <Target size={18} className="text-violet-500 mx-auto mb-1" />
                  <div className="text-2xl font-black text-violet-600">{selectedStudent.quizCount}</div>
                  <div className="text-[9px] font-black text-violet-400 uppercase">Kuis</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-3 text-center">
                  <Medal size={18} className="text-amber-500 mx-auto mb-1" />
                  <div className={`text-2xl font-black bg-gradient-to-br ${getScoreGradient(selectedStudent.avgScore)} bg-clip-text text-transparent`}>
                    {selectedStudent.avgScore}
                  </div>
                  <div className="text-[9px] font-black text-amber-400 uppercase">Rata-rata</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-3 text-center">
                  <Trophy size={18} className="text-emerald-500 mx-auto mb-1" />
                  <div className={`text-2xl font-black bg-gradient-to-br ${getScoreGradient(selectedStudent.bestScore)} bg-clip-text text-transparent`}>
                    {selectedStudent.bestScore}
                  </div>
                  <div className="text-[9px] font-black text-emerald-400 uppercase">Terbaik</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-br from-violet-500 to-pink-500 text-white p-1.5 rounded-xl shadow-md shadow-violet-300/50">
                  <Trophy size={14} />
                </div>
                <h3 className="font-black text-violet-900 text-sm">Riwayat Kuis</h3>
                <span className="text-[10px] font-black bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full ml-auto">
                  {studentResults.length}
                </span>
              </div>

              {studentResults.length === 0 ? (
                <div className="text-center py-8 bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl border-2 border-dashed border-violet-200">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-violet-500 font-black text-sm">Belum ada riwayat kuis</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {studentResults.map((result) => {
                    const material = result.quizzes?.materials
                    const category = material?.categories
                    return (
                      <div
                        key={result.id}
                        className="bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl p-3 border-2 border-violet-100 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-md"
                            style={{ 
                              background: `linear-gradient(135deg, ${category?.color || '#8B5CF6'}, ${category?.color || '#8B5CF6'}CC)` 
                            }}
                          >
                            <span className="drop-shadow">{category?.icon || '📖'}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-violet-900 text-xs sm:text-sm truncate">
                              {result.quizzes?.title || 'Kuis'}
                            </p>
                            <p className="text-[10px] text-violet-500 font-bold flex items-center gap-1 mt-0.5">
                              <Clock size={9} />
                              {new Date(result.completed_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className={`bg-gradient-to-br ${getScoreGradient(result.score)} text-white rounded-2xl px-3 py-1.5 shadow-md flex-shrink-0 min-w-[50px] text-center`}>
                          <div className="text-xl font-black leading-none">{result.score}</div>
                          <div className="text-[7px] font-black opacity-90 mt-0.5">NILAI</div>
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