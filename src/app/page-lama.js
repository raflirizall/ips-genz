'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BookOpen, GraduationCap } from 'lucide-react'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('order_index')

      const { data: mats } = await supabase
        .from('materials')
        .select('*, categories(name, icon, color)')
        .eq('is_published', true)
        .order('order_index')

      setCategories(cats || [])
      setMaterials(mats || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={28} />
            <h1 className="font-bold text-lg text-gray-800">IPS GenZ</h1>
          </div>
          <button className="text-sm text-gray-600 hover:text-blue-600">
            Masuk
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Belajar IPS Jadi Menyenangkan 📚
          </h2>
          <p className="text-blue-100 text-lg">
            Materi interaktif, kuis seru, dan progress belajar untuk siswa SMP.
          </p>
        </div>
      </section>

      {/* Kategori */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h3 className="font-bold text-xl text-gray-800 mb-4">Kategori</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium text-gray-700">{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Materi */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h3 className="font-bold text-xl text-gray-800 mb-4">Materi Terbaru</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100"
            >
              <div
                className="h-32 flex items-center justify-center text-white text-4xl"
                style={{ backgroundColor: mat.categories?.color || '#3B82F6' }}
              >
                {mat.categories?.icon || <BookOpen />}
              </div>
              <div className="p-4">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {mat.categories?.name}
                </div>
                <h4 className="font-bold text-gray-800 mb-2 line-clamp-2">
                  {mat.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2">{mat.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}