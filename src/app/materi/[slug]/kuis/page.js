'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { ArrowLeft, Check, X, RotateCcw, Trophy, Star, Target, Home } from 'lucide-react'

export default function KuisPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [material, setMaterial] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [savedToDB, setSavedToDB] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function fetchQuiz() {
      const current = await getCurrentUser()
      if (current) {
        setUser(current.user)
      }

      const { data: mat } = await supabase
        .from('materials')
        .select('*, categories(name, icon, color)')
        .eq('slug', params.slug)
        .single()

      if (!mat) {
        setLoading(false)
        return
      }
      setMaterial(mat)

      const { data: qz } = await supabase
        .from('quizzes')
        .select('*')
        .eq('material_id', mat.id)
        .single()

      if (!qz) {
        setLoading(false)
        return
      }
      setQuiz(qz)

      const { data: qs } = await supabase
        .from('questions')
        .select('*, answer_options(*)')
        .eq('quiz_id', qz.id)
        .order('order_index')

      const sortedQuestions = (qs || []).map((q) => ({
        ...q,
        answer_options: (q.answer_options || []).sort((a, b) => a.order_index - b.order_index),
      }))

      setQuestions(sortedQuestions)
      setLoading(false)
    }
    fetchQuiz()
  }, [params.slug])

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const progress = totalQuestions > 0 ? ((currentIndex) / totalQuestions) * 100 : 0

  const handleSelectAnswer = (optionId) => {
    if (showFeedback) return
    setSelectedAnswer(optionId)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return
    setShowFeedback(true)
  }

  const handleNext = async () => {
    const option = currentQuestion.answer_options.find((o) => o.id === selectedAnswer)
    const isCorrect = option?.is_correct || false

    const newAnswers = [
      ...answers,
      {
        questionId: currentQuestion.id,
        selectedOptionId: selectedAnswer,
        isCorrect,
      },
    ]
    setAnswers(newAnswers)

    setSelectedAnswer(null)
    setShowFeedback(false)

    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // === KUIS SELESAI — HITUNG & SIMPAN SKOR ===
      await saveResult(newAnswers)
      setShowResult(true)
    }
  }

  // === SIMPAN SKOR KE DATABASE ===
  const saveResult = async (finalAnswers) => {
    if (!user || !quiz) {
      console.log('User belum login, skor tidak disimpan')
      return
    }

    const correctCount = finalAnswers.filter((a) => a.isCorrect).length
    const wrongCount = finalAnswers.length - correctCount
    const percentage = Math.round((correctCount / finalAnswers.length) * 100)

    try {
      // 1. Simpan hasil kuis
      const { error: resultError } = await supabase
        .from('quiz_results')
        .insert({
          student_id: user.id,
          quiz_id: quiz.id,
          score: percentage,
          correct_count: correctCount,
          wrong_count: wrongCount,
          answers: finalAnswers,
        })

      if (resultError) {
        console.error('Error simpan hasil:', resultError)
        return
      }

      // 2. Tandai materi sebagai selesai
      const { error: progressError } = await supabase
        .from('student_progress')
        .upsert({
          student_id: user.id,
          material_id: material.id,
          is_completed: true,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id,material_id',
        })

      if (progressError) {
        console.error('Error simpan progress:', progressError)
        return
      }

      setSavedToDB(true)
    } catch (err) {
      console.error('Exception:', err)
    }
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAnswers([])
    setShowResult(false)
    setShowFeedback(false)
    setSavedToDB(false)
  }

  const correctCount = answers.filter((a) => a.isCorrect).length
  const wrongCount = answers.length - correctCount
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  const getFeedbackMessage = () => {
    if (percentage >= 90) return { emoji: '🏆', text: 'Luar biasa! Kamu juara!' }
    if (percentage >= 75) return { emoji: '🎉', text: 'Hebat! Pertahankan ya!' }
    if (percentage >= 60) return { emoji: '👍', text: 'Bagus! Sedikit lagi sempurna!' }
    if (percentage >= 40) return { emoji: '💪', text: 'Ayo semangat! Coba lagi ya!' }
    return { emoji: '📚', text: 'Jangan menyerah! Baca materi lagi yuk!' }
  }

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-wiggle">🦎</div>
          <p className="text-gray-600 font-bold">Menyiapkan kuis...</p>
        </div>
      </div>
    )
  }

  // ===== KUIS TIDAK ADA =====
  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-6">
        <div className="text-7xl mb-4">🚧</div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">Kuis Belum Tersedia</h1>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          Kuis untuk materi ini belum dibuat. Coba materi lain dulu ya!
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/materi/${params.slug}`)}
            className="bg-gray-200 text-gray-700 font-black px-6 py-3 rounded-2xl hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Kembali ke Materi
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Home size={18} />
            Ke Home
          </button>
        </div>
      </div>
    )
  }

  // ===== HASIL AKHIR =====
  if (showResult) {
    const fb = getFeedbackMessage()
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-200">
            <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 p-8 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 text-8xl opacity-20 -mt-4 -ml-4">🎉</div>
              <div className="absolute bottom-0 right-0 text-8xl opacity-20 -mb-4 -mr-4">⭐</div>
              <div className="text-7xl mb-4 relative">{fb.emoji}</div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 relative">SELESAI!</h1>
              <p className="text-white/90 font-bold text-lg relative">{fb.text}</p>
            </div>

            <div className="p-8 text-center">
              <p className="text-gray-500 font-black text-sm mb-2">NILAI KAMU</p>
              <div className="text-8xl font-black bg-gradient-to-br from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                {percentage}
              </div>
              <div className="flex items-center justify-center gap-2 text-yellow-500 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={i < Math.round(percentage / 20) ? 'fill-yellow-400' : 'text-gray-200'}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-50 border-4 border-green-200 rounded-2xl p-4">
                  <div className="text-3xl mb-1">✅</div>
                  <div className="text-2xl font-black text-green-600">{correctCount}</div>
                  <div className="text-xs font-black text-gray-500">BENAR</div>
                </div>
                <div className="bg-red-50 border-4 border-red-200 rounded-2xl p-4">
                  <div className="text-3xl mb-1">❌</div>
                  <div className="text-2xl font-black text-red-500">{wrongCount}</div>
                  <div className="text-xs font-black text-gray-500">SALAH</div>
                </div>
                <div className="bg-blue-50 border-4 border-blue-200 rounded-2xl p-4">
                  <div className="text-3xl mb-1">📊</div>
                  <div className="text-2xl font-black text-blue-500">{percentage}%</div>
                  <div className="text-xs font-black text-gray-500">NILAI</div>
                </div>
              </div>

              {/* INFO SIMPAN */}
              {user ? (
                savedToDB ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-3 mb-6 text-sm font-bold text-green-700">
                    ✅ Nilai kamu tersimpan! Cek di halaman Progress.
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-3 mb-6 text-sm font-bold text-yellow-700">
                    ⏳ Menyimpan nilai...
                  </div>
                )
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 mb-6 text-sm font-bold text-blue-700">
                  💡 Login dulu untuk menyimpan nilai. <button onClick={() => router.push('/login')} className="underline font-black">Masuk di sini</button>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  COBA LAGI
                </button>
                <button
                  onClick={() => router.push('/progress')}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <Trophy size={20} />
                  LIHAT PROGRESS
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-3xl p-6 shadow-xl border-4 border-purple-100">
            <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📖</span> Pembahasan
            </h2>
            <div className="space-y-4">
              {questions.map((q, i) => {
                const ans = answers[i]
                const correctOption = q.answer_options.find((o) => o.is_correct)
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border-4 ${
                      ans?.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-black ${
                          ans?.isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      >
                        {ans?.isCorrect ? <Check size={18} /> : <X size={18} />}
                      </div>
                      <p className="font-bold text-gray-800">
                        {i + 1}. {q.question_text}
                      </p>
                    </div>
                    <div className="ml-11 space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-black">Jawaban benar:</span>{' '}
                        <span className="text-green-700 font-bold">{correctOption?.option_text}</span>
                      </p>
                      {!ans?.isCorrect && ans && (
                        <p className="text-gray-600">
                          <span className="font-black">Jawabanmu:</span>{' '}
                          <span className="text-red-600 font-bold">
                            {q.answer_options.find((o) => o.id === ans.selectedOptionId)?.option_text}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== SOAL AKTIF =====
  const correctOption = currentQuestion?.answer_options.find((o) => o.is_correct)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">

      <header className="bg-white/90 backdrop-blur-md border-b-4 border-yellow-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.push(`/materi/${params.slug}`)}
              className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-2xl transition-colors text-gray-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-black">KUIS</p>
              <p className="font-black text-gray-800 text-sm truncate">{material?.title}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1.5 rounded-full font-black text-sm">
              {currentIndex + 1} / {totalQuestions}
            </div>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-yellow-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">
              {currentIndex + 1}
            </div>
            <p className="text-xs text-gray-500 font-black">
              {currentQuestion.question_type === 'true_false' ? 'BENAR / SALAH' : 'PILIHAN GANDA'}
            </p>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-gray-800 leading-relaxed mb-4">
            {currentQuestion.question_text}
          </h2>

          {currentQuestion.question_image && (
            <img
              src={currentQuestion.question_image}
              alt="Soal"
              className="rounded-2xl w-full mb-4 border-4 border-yellow-100"
            />
          )}
        </div>

        <div className="space-y-3 mb-6">
          {currentQuestion.answer_options.map((opt, idx) => {
            const isSelected = selectedAnswer === opt.id
            const isCorrect = opt.is_correct
            const showCorrect = showFeedback && isCorrect
            const showWrong = showFeedback && isSelected && !isCorrect

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectAnswer(opt.id)}
                disabled={showFeedback}
                className={`w-full text-left p-5 rounded-2xl border-4 font-bold transition-all flex items-center gap-4 ${
                  showCorrect
                    ? 'bg-green-50 border-green-400 scale-[1.02]'
                    : showWrong
                    ? 'bg-red-50 border-red-400'
                    : isSelected
                    ? 'bg-yellow-50 border-yellow-400 scale-[1.02]'
                    : 'bg-white border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${
                    showCorrect
                      ? 'bg-green-500 text-white'
                      : showWrong
                      ? 'bg-red-500 text-white'
                      : isSelected
                      ? 'bg-yellow-400 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {showCorrect ? <Check size={24} /> : showWrong ? <X size={24} /> : String.fromCharCode(65 + idx)}
                </div>
                <span className="text-gray-800 flex-1">{opt.option_text}</span>
              </button>
            )
          })}
        </div>

        {showFeedback && (
          <div
            className={`p-5 rounded-3xl border-4 mb-6 ${
              selectedAnswer === correctOption?.id
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">
                {selectedAnswer === correctOption?.id ? '🎉' : '😅'}
              </div>
              <div>
                <p className="font-black text-lg text-gray-800">
                  {selectedAnswer === correctOption?.id ? 'Benar!' : 'Belum tepat'}
                </p>
                {selectedAnswer !== correctOption?.id && (
                  <p className="text-sm text-gray-600 font-bold">
                    Jawaban benar: <span className="text-green-700">{correctOption?.option_text}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!showFeedback ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`w-full font-black py-5 rounded-2xl shadow-xl transition-all text-lg flex items-center justify-center gap-2 ${
                selectedAnswer === null
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:scale-105'
              }`}
            >
              <Target size={22} />
              JAWAB
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:scale-105 transition-all text-lg flex items-center justify-center gap-2"
            >
              {currentIndex + 1 < totalQuestions ? (
                <>
                  SOAL BERIKUTNYA
                  <ArrowLeft size={22} className="rotate-180" />
                </>
              ) : (
                <>
                  <Trophy size={22} />
                  LIHAT HASIL
                </>
              )}
            </button>
          )}
        </div>

      </main>

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}