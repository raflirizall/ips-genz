'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginStudent, loginAdmin } from '@/lib/auth'
import { 
  ArrowLeft, User, Hash, School, Lock, Mail, LogIn, Sparkles,
  Rocket, Compass, GraduationCap, Shield
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState('siswa')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [nama, setNama] = useState('')
  const [noAbsen, setNoAbsen] = useState('')
  const [kelas, setKelas] = useState('VII A')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleStudentLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await loginStudent({ nama, noAbsen, kelas })

    if (result.success) {
      router.push('/')
      router.refresh()
    } else {
      setError(result.error || 'Gagal masuk. Coba lagi.')
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await loginAdmin(email, password)

    if (result.success) {
      router.push('/admin')
      router.refresh()
    } else {
      setError(result.error || 'Gagal masuk.')
      setLoading(false)
    }
  }

  const kelasOptions = [
    'VII A', 'VII B', 'VII C',
    'VIII A', 'VIII B', 'VIII C',
    'IX A', 'IX B', 'IX C',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* Tombol Kembali */}
        <button
          onClick={() => router.push('/')}
          className="mb-4 flex items-center gap-2 text-violet-600 hover:text-violet-800 font-black transition-colors active:scale-95"
        >
          <ArrowLeft size={18} />
          Kembali ke Home
        </button>

        {/* Card Login */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-violet-200 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 p-6 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-8xl opacity-15 -mt-2 -mr-2">✨</div>
            <div className="absolute bottom-0 left-0 text-8xl opacity-15 -mb-2 -ml-2">🧭</div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-3 shadow-lg border-2 border-white/30">
                <span className="text-4xl">🧭</span>
              </div>
              <h1 className="text-2xl font-black mb-0.5">IPS GenZ</h1>
              <p className="text-white/90 font-bold text-xs flex items-center justify-center gap-1">
                <Sparkles size={12} className="fill-yellow-300 text-yellow-300" />
                Petualangan Belajar Seru!
              </p>
            </div>
          </div>

          {/* Tab Switch */}
          <div className="flex border-b-2 border-violet-100 bg-violet-50/50">
            <button
              onClick={() => { setMode('siswa'); setError('') }}
              className={`flex-1 py-4 font-black transition-all flex items-center justify-center gap-2 text-sm relative ${
                mode === 'siswa'
                  ? 'text-violet-700 bg-white'
                  : 'text-violet-400 hover:text-violet-600'
              }`}
            >
              <User size={16} />
              Siswa
              {mode === 'siswa' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500"></div>
              )}
            </button>
            <button
              onClick={() => { setMode('admin'); setError('') }}
              className={`flex-1 py-4 font-black transition-all flex items-center justify-center gap-2 text-sm relative ${
                mode === 'admin'
                  ? 'text-pink-700 bg-white'
                  : 'text-pink-400 hover:text-pink-600'
              }`}
            >
              <Shield size={16} />
              Admin
              {mode === 'admin' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>
              )}
            </button>
          </div>

          {/* Form */}
          <div className="p-6">

            {/* Sapaan */}
            <div className="text-center mb-5">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black mb-2 border-2 ${
                mode === 'siswa'
                  ? 'bg-violet-50 text-violet-700 border-violet-200'
                  : 'bg-pink-50 text-pink-700 border-pink-200'
              }`}>
                <Sparkles size={12} />
                {mode === 'siswa' ? 'Halo Sahabat!' : 'Login Admin'}
              </div>
              <p className="text-violet-500 text-xs font-bold">
                {mode === 'siswa'
                  ? 'Isi data kamu untuk mulai belajar'
                  : 'Masuk dengan akun admin'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 font-bold p-3.5 rounded-2xl mb-4 text-xs flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* FORM SISWA */}
            {mode === 'siswa' && (
              <form onSubmit={handleStudentLogin} className="space-y-3.5">

                <div>
                  <label className="block text-xs font-black text-violet-700 mb-1.5 flex items-center gap-1.5">
                    <User size={13} className="text-violet-500" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    required
                    className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal text-sm bg-violet-50/30 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-violet-700 mb-1.5 flex items-center gap-1.5">
                    <Hash size={13} className="text-violet-500" />
                    No Absen
                  </label>
                  <input
                    type="number"
                    value={noAbsen}
                    onChange={(e) => setNoAbsen(e.target.value)}
                    placeholder="Contoh: 12"
                    required
                    min="1"
                    max="50"
                    className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 placeholder:text-violet-300 placeholder:font-normal text-sm bg-violet-50/30 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-violet-700 mb-1.5 flex items-center gap-1.5">
                    <School size={13} className="text-violet-500" />
                    Kelas
                  </label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl focus:border-violet-400 focus:outline-none font-bold text-violet-900 bg-violet-50/30 focus:bg-white text-sm transition-colors"
                  >
                    {kelasOptions.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                {/* Info */}
                <div className="bg-gradient-to-r from-violet-50 to-pink-50 border-2 border-violet-100 rounded-2xl p-3 text-[11px] text-violet-700 font-bold text-center">
                  💡 Pertama kali? Akun kamu otomatis dibuat. Berikutnya cukup isi data yang sama.
                </div>

                {/* Tombol MASUK */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all text-base flex items-center justify-center gap-2 active:scale-95 ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-wait'
                      : 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white hover:scale-105 shadow-violet-300/50'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Memuat...
                    </>
                  ) : (
                    <>
                      <Rocket size={20} />
                      MULAI PETUALANGAN
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORM ADMIN */}
            {mode === 'admin' && (
              <form onSubmit={handleAdminLogin} className="space-y-3.5">

                <div>
                  <label className="block text-xs font-black text-pink-700 mb-1.5 flex items-center gap-1.5">
                    <Mail size={13} className="text-pink-500" />
                    Email Admin
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ips-smp.com"
                    required
                    className="w-full px-4 py-3 border-2 border-pink-100 rounded-2xl focus:border-pink-400 focus:outline-none font-bold text-violet-900 placeholder:text-pink-300 placeholder:font-normal text-sm bg-pink-50/30 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-pink-700 mb-1.5 flex items-center gap-1.5">
                    <Lock size={13} className="text-pink-500" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 border-2 border-pink-100 rounded-2xl focus:border-pink-400 focus:outline-none font-bold text-violet-900 placeholder:text-pink-300 placeholder:font-normal text-sm bg-pink-50/30 focus:bg-white transition-colors"
                  />
                </div>

                {/* Tombol MASUK ADMIN */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all text-base flex items-center justify-center gap-2 active:scale-95 ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-wait'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:scale-105 shadow-pink-300/50'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Memuat...
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      MASUK ADMIN
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-violet-50 via-pink-50 to-amber-50 p-3 text-center border-t-2 border-violet-100">
            <p className="text-[10px] text-violet-600 font-black flex items-center justify-center gap-1">
              🧭 IPS GenZ • Petualangan Belajar Seru!
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}