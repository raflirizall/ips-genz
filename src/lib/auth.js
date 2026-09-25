import { supabase } from './supabase'

// Password default untuk semua siswa
const STUDENT_PASSWORD = 'ipsgenz2026'
// Domain email palsu untuk siswa
const STUDENT_DOMAIN = 'ipsgenz.local'

/**
 * Generate email dari nama + no absen + kelas
 * Contoh: "Budi Santoso", "12", "VII A"
 * Hasil: "budi-santoso.12.viia@ipsgenz.local"
 */
export function generateStudentEmail(nama, noAbsen, kelas) {
  const namaSlug = nama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // hapus karakter aneh
    .replace(/\s+/g, '-') // spasi jadi dash

  const kelasSlug = kelas
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') // "VII A" → "viia"

  const noAbsenClean = String(noAbsen).trim().replace(/[^0-9]/g, '')

  return `${namaSlug}.${noAbsenClean}.${kelasSlug}@${STUDENT_DOMAIN}`
}

/**
 * Login siswa: coba login, kalau belum ada akun → otomatis daftar
 */
export async function loginStudent({ nama, noAbsen, kelas }) {
  const email = generateStudentEmail(nama, noAbsen, kelas)

  // Coba login dulu
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password: STUDENT_PASSWORD,
  })

  if (!loginError && loginData.user) {
    return { success: true, user: loginData.user, isNew: false }
  }

  // Kalau login gagal, coba daftar
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: STUDENT_PASSWORD,
    options: {
      data: {
        full_name: nama,
        no_absen: noAbsen,
        class_name: kelas,
        role: 'student',
      },
    },
  })

  if (signUpError) {
    return { success: false, error: signUpError.message }
  }

  // Update profile dengan no_absen
  if (signUpData.user) {
    await supabase
      .from('profiles')
      .update({
        full_name: nama,
        class_name: kelas,
        role: 'student',
      })
      .eq('id', signUpData.user.id)

    return { success: true, user: signUpData.user, isNew: true }
  }

  return { success: false, error: 'Gagal membuat akun' }
}

/**
 * Login admin (email + password)
 */
export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Cek role admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single()

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut()
    return { success: false, error: 'Akun ini bukan admin' }
  }

  return { success: true, user: data.user, profile }
}

/**
 * Logout
 */
export async function logout() {
  await supabase.auth.signOut()
}

/**
 * Ambil user yang sedang login + profile-nya
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}