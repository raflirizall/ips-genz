'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginStudent, loginAdmin } from '@/lib/auth'
import { ArrowLeft, User, Hash, School, Lock, Mail, LogIn, Sparkles } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        <button
          onClick={() => router.push('/')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-orange-500 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          Kembali ke Home
        </button>

        <div className="bg-white rounded-3xl shadow-2xl border-4 border-yellow-200 overflow-hidden">

          <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 p-6 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-8xl opacity-20 -mt-4 -mr-4">🦎</div>
            <div className="absolute bottom-0 left-0 text-8xl opacity-20 -mb-4 -ml-4">✨</div>
            <div className="relative">
              <div className="text-6xl mb-2 animate-wiggle inline-block">🦎</div>
              <h1 className="text-2xl font-black">IPS GenZ</h1>
              <p className="text-white/90 font-bold text-sm">Petualangan Belajar Seru!</p>
            </div>
          </div>

          <div className="flex border-b-4 border-yellow-100">
            <button
              onClick={() => { setMode('siswa'); setError('') }}
              className={`flex-1 py-4 font-black transition-colors flex items-center justify-center gap-2 ${
                mode === 'siswa'
                  ? 'bg-orange-50 text-orange-600 border-b-4 border-orange-400 -mb-1'
                  : 'text-gray-400 hover:text-orange-400'
              }`}
            >
              <User size={18} />
              Siswa
            </button>
            <button
              onClick={() => { setMode('admin'); setError('') }}
              className={`flex-1 py-4 font-black transition-colors flex items-center justify-center gap-2 ${
                mode === 'admin'
                  ? 'bg-blue-50 text-blue-600 border-b-4 border-blue-400 -mb-1'
                  : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              <Lock size={18} />
              Admin
            </button>
          </div>

          <div className="p-6">

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-xs font-black mb-2">
                <Sparkles size={14} />
                {mode === 'siswa' ? 'Halo Sahabat!' : 'Login Admin'}
              </div>
              <p className="text-gray-500 text-sm font-bold">
                {mode === 'siswa'
                  ? 'Isi data kamu untuk mulai belajar'
                  : 'Masuk dengan akun admin'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-4 border-red-200 text-red-600 font-bold p-4 rounded-2xl mb-4 text-sm">
                ⚠️ {error}
              </div>
            )}

            {mode === 'siswa' && (
              <form onSubmit={handleStudentLogin} className="space-y-4">

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 flex items-center gap-1.5">
                    <User size={16} className="text-orange-500" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    required
                    className="w-full px-4 py-3 border-4 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-300 placeholder:font-normal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 flex items-center gap-1.5">
                    <Hash size={16} className="text-orange-500" />
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
                    className="w-full px-4 py-3 border-4 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-300 placeholder:font-normal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 flex items-center gap-1.5">
                    <School size={16} className="text-orange-500" />
                    Kelas
                  </label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-4 py-3 border-4 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none font-bold text-gray-800 bg-white"
                  >
                    {kelasOptions.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 text-xs text-blue-700 font-bold text-center">
                  💡 Pertama kali? Akun kamu otomatis dibuat. Berikutnya cukup isi data yang sama.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all text-lg flex items-center justify-center gap-2 ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-wait'
                      : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-4 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Memuat...
                    </>
                  ) : (
                    <>
                      <LogIn size={22} />
                      MASUK
                    </>
                  )}
                </button>
              </form>
            )}

            {mode === 'admin' && (
              <form onSubmit={handleAdminLogin} className="space-y-4">

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 flex items-center gap-1.5">
                    <Mail size={16} className="text-blue-500" />
                    Email Admin
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ips-smp.com"
                    required
                    className="w-full px-4 py-3 border-4 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-300 placeholder:font-normal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 flex items-center gap-1.5">
                    <Lock size={16} className="text-blue-500" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 border-4 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none font-bold text-gray-800 placeholder:text-gray-300 placeholder:font-normal"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all text-lg flex items-center justify-center gap-2 ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-wait'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-4 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Memuat...
                    </>
                  ) : (
                    <>
                      <LogIn size={22} />
                      MASUK ADMIN
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 text-center">
            <p className="text-xs text-gray-600 font-bold">
              🦎 IPS GenZ • Petualangan Belajar Seru
            </p>
          </div>

        </div>

      </div>

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