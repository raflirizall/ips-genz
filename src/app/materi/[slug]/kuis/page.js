'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { 
  ArrowLeft, Check, X, RotateCcw, Trophy, Star, Target, Home,
  Sparkles, Rocket, Gem, Crown, Zap, CheckCircle, BookOpen, Award
} from 'lucide-react'

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
      await saveResult(newAnswers)
      setShowResult(true)
    }
  }

  const saveResult = async (finalAnswers) => {
    if (!user || !quiz) {
      console.log('User belum login, skor tidak disimpan')
      return
    }

    const correctCount = finalAnswers.filter((a) => a.isCorrect).length
    const wrongCount = finalAnswers.length - correctCount
    const percentage = Math.round((correctCount / finalAnswers.length) * 100)

    try {
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
    if (percentage >= 90) return { emoji: '🏆', text: 'Luar biasa! Kamu juara!', color: 'from-amber-400 to-orange-500' }
    if (percentage >= 75) return { emoji: '🎉', text: 'Hebat! Pertahankan ya!', color: 'from-violet-500 to-pink-500' }
    if (percentage >= 60) return { emoji: '👍', text: 'Bagus! Sedikit lagi sempurna!', color: 'from-blue-500 to-cyan-500' }
    if (percentage >= 40) return { emoji: '💪', text: 'Ayo semangat! Coba lagi ya!', color: 'from-pink-500 to-rose-500' }
    return { emoji: '📚', text: 'Jangan menyerah! Baca materi lagi yuk!', color: 'from-red-500 to-pink-500' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce">🎯</div>
          <p className="text-violet-600 font-bold">Menyiapkan kuis...</p>
        </div>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50 p-6">
        <div className="text-7xl mb-4">🚧</div>
        <h1 className="text-2xl font-black text-violet-900 mb-2">Kuis Belum Tersedia</h1>
        <p className="text-violet-500 mb-6 text-center max-w-md font-medium">
          Kuis untuk materi ini belum dibuat. Coba materi lain dulu ya!
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => router.push(`/materi/${params.slug}`)}
            className="bg-white border-2 border-violet-200 text-violet-700 font-black px-5 py-3 rounded-2xl hover:bg-violet-50 transition-colors flex items-center gap-2 active:scale-95"
          >
            <ArrowLeft size={18} />
            Kembali ke Materi
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white font-black px-5 py-3 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center gap-2"
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
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-amber-50 py-6 px-3">
        <div className="max-w-2xl mx-auto">

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-violet-200">
            {/* Header hasil */}
            <div className={`bg-gradient-to-br ${fb.color} p-6 sm:p-8 text-center text-white relative overflow-hidden`}>
              <div className="absolute top-0 left-0 text-8xl opacity-20 -mt-4 -ml-4">🎉</div>
              <div className="absolute bottom-0 right-0 text-8xl opacity-20 -mb-4 -mr-4">⭐</div>
              <div className="text-6xl sm:text-7xl mb-4 relative">{fb.emoji}</div>
              <h1 className="text-2xl sm:text-4xl font-black mb-2 relative">SELESAI!</h1>
              <p className="text-white/95 font-bold text-base sm:text-lg relative">{fb.text}</p>
            </div>

            {/* Nilai */}
            <div className="p-6 sm:p-8 text-center">
              <p className="text-violet-500 font-black text-xs uppercase tracking-wider mb-2">Nilai Kamu</p>
              <div className="text-7xl sm:text-8xl font-black bg-gradient-to-br from-violet-600 to-pink-500 bg-clip-text text-transparent mb-3">
                {percentage}
              </div>
              <div className="flex items-center justify-center gap-2 text-amber-500 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={26}
                    className={i < Math.round(percentage / 20) ? 'fill-amber-400' : 'text-gray-200'}
                  />
                ))}
              </div>

              {/* Statistik */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4">
                  <div className="text-3xl mb-1">✅</div>
                  <div className="text-2xl font-black text-emerald-600">{correctCount}</div>
                  <div className="text-[10px] font-black text-emerald-500 uppercase">Benar</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-4">
                  <div className="text-3xl mb-1">❌</div>
                  <div className="text-2xl font-black text-red-500">{wrongCount}</div>
                  <div className="text-[10px] font-black text-red-400 uppercase">Salah</div>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-pink-50 border-2 border-violet-200 rounded-2xl p-4">
                  <div className="text-3xl mb-1">💎</div>
                  <div className="text-2xl font-black text-violet-600">+{correctCount * 100}</div>
                  <div className="text-[10px] font-black text-violet-500 uppercase">XP</div>
                </div>
              </div>

              {/* Info simpan */}
              {user ? (
                savedToDB ? (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-3 mb-6 text-sm font-black text-emerald-700 flex items-center justify-center gap-2">
                    <CheckCircle size={16} className="fill-emerald-500 text-white" />
                    Nilai kamu tersimpan! Cek di Progress.
                  </div>
                ) : (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 mb-6 text-sm font-black text-amber-700 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-3 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
                    Menyimpan nilai...
                  </div>
                )
              ) : (
                <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-3 mb-6 text-sm font-black text-violet-700">
                  💡 <button onClick={() => router.push('/login')} className="underline">Login</button> untuk menyimpan nilai
                </div>
              )}

              {/* Tombol */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-amber-300/50 active:scale-95 hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  COBA LAGI
                </button>
                <button
                  onClick={() => router.push('/progress')}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-violet-300/50 active:scale-95 hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <Trophy size={18} />
                  LIHAT PROGRESS
                </button>
              </div>
            </div>
          </div>

          {/* Pembahasan */}
          <div className="mt-5 bg-white rounded-3xl p-4 sm:p-6 shadow-xl border-2 border-violet-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-violet-500 to-pink-500 text-white p-2 rounded-xl shadow-md">
                <BookOpen size={16} />
              </div>
              <h2 className="text-lg font-black text-violet-900">Pembahasan</h2>
            </div>
            <div className="space-y-3">
              {questions.map((q, i) => {
                const ans = answers[i]
                const correctOption = q.answer_options.find((o) => o.is_correct)
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border-2 ${
                      ans?.isCorrect
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
                        : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white font-black ${
                          ans?.isCorrect
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-300/50'
                            : 'bg-gradient-to-br from-red-400 to-pink-500 shadow-md shadow-red-300/50'
                        }`}
                      >
                        {ans?.isCorrect ? <Check size={16} /> : <X size={16} />}
                      </div>
                      <p className="font-black text-violet-900 text-sm">
                        {i + 1}. {q.question_text}
                      </p>
                    </div>
                    <div className="ml-11 space-y-1 text-xs">
                      <p className="text-violet-600">
                        <span className="font-black">Jawaban benar:</span>{' '}
                        <span className="text-emerald-700 font-black">{correctOption?.option_text}</span>
                      </p>
                      {!ans?.isCorrect && ans && (
                        <p className="text-violet-600">
                          <span className="font-black">Jawabanmu:</span>{' '}
                          <span className="text-red-600 font-black">
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
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-amber-50">

      {/* ===== HEADER ===== */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-violet-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.push(`/materi/${params.slug}`)}
              className="bg-violet-100 hover:bg-violet-200 text-violet-700 p-2.5 rounded-2xl transition-colors active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-violet-500 font-black uppercase tracking-wide flex items-center gap-1">
                <Target size={10} />
                KUIS
              </p>
              <p className="font-black text-violet-900 text-sm truncate">{material?.title}</p>
            </div>
            <div className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-3 py-1.5 rounded-2xl font-black text-sm shadow-md shadow-violet-300/50">
              {currentIndex + 1} / {totalQuestions}
            </div>
          </div>
          <div className="w-full bg-violet-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400 transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(progress, 3)}%` }}
            ></div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4">

        {/* ===== SOAL ===== */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-violet-200 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-7xl opacity-5 -mt-2 -mr-2">❓</div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-br from-violet-500 to-pink-500 text-white font-black w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-300/50 text-base">
                {currentIndex + 1}
              </div>
              <p className="text-[10px] text-violet-500 font-black uppercase tracking-wider">
                {currentQuestion.question_type === 'true_false' ? 'Benar / Salah' : 'Pilihan Ganda'}
              </p>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-violet-900 leading-relaxed mb-3">
              {currentQuestion.question_text}
            </h2>

            {currentQuestion.question_image && (
              <img
                src={currentQuestion.question_image}
                alt="Soal"
                className="rounded-2xl w-full mb-3 border-2 border-violet-100"
              />
            )}
          </div>
        </div>

        {/* ===== PILIHAN JAWABAN ===== */}
        <div className="space-y-2.5 mb-4">
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
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 font-black transition-all flex items-center gap-3 active:scale-[0.98] ${
                  showCorrect
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 scale-[1.02] shadow-lg shadow-emerald-200/50'
                    : showWrong
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400'
                    : isSelected
                    ? 'bg-gradient-to-r from-violet-50 to-pink-50 border-violet-400 scale-[1.02] shadow-lg shadow-violet-200/50'
                    : 'bg-white border-violet-100 hover:border-violet-300 hover:bg-violet-50'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base transition-all ${
                    showCorrect
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md'
                      : showWrong
                      ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white shadow-md'
                      : isSelected
                      ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-md scale-110'
                      : 'bg-violet-100 text-violet-600'
                  }`}
                >
                  {showCorrect ? <Check size={22} /> : showWrong ? <X size={22} /> : String.fromCharCode(65 + idx)}
                </div>
                <span className="text-violet-900 flex-1 text-sm sm:text-base">{opt.option_text}</span>
              </button>
            )
          })}
        </div>

        {/* ===== FEEDBACK ===== */}
        {showFeedback && (
          <div
            className={`p-4 rounded-2xl border-2 mb-4 flex items-center gap-3 ${
              selectedAnswer === correctOption?.id
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300'
            }`}
          >
            <div className="text-4xl">
              {selectedAnswer === correctOption?.id ? '🎉' : '😅'}
            </div>
            <div>
              <p className="font-black text-violet-900 text-base">
                {selectedAnswer === correctOption?.id ? 'Benar!' : 'Belum tepat'}
              </p>
              {selectedAnswer !== correctOption?.id && (
                <p className="text-xs text-violet-600 font-bold">
                  Jawaban: <span className="text-emerald-700 font-black">{correctOption?.option_text}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===== TOMBOL AKSI ===== */}
        <div className="flex gap-2.5">
          {!showFeedback ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all text-base flex items-center justify-center gap-2 active:scale-95 ${
                selectedAnswer === null
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:scale-105 shadow-violet-300/50'
              }`}
            >
              <Target size={20} />
              JAWAB
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-300/50 hover:scale-105 active:scale-95 transition-all text-base flex items-center justify-center gap-2"
            >
              {currentIndex + 1 < totalQuestions ? (
                <>
                  SOAL BERIKUTNYA
                  <ArrowLeft size={20} className="rotate-180" />
                </>
              ) : (
                <>
                  <Trophy size={20} />
                  LIHAT HASIL
                </>
              )}
            </button>
          )}
        </div>

      </main>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}