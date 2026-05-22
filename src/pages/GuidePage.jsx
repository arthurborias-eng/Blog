import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import SectionBlock from '../components/SectionBlock'
import { MapPin, Calendar, ArrowLeft, Pencil } from 'lucide-react'

export default function GuidePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('guides').select('*').eq('id', id).single()
      .then(({ data }) => { setGuide(data); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
    </div>
  )

  if (!guide) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-serif text-2xl text-stone-400">Guide introuvable</p>
      <Link to="/" className="text-sm text-stone-500 underline">Retour à l'accueil</Link>
    </div>
  )

  const date = new Date(guide.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const sections = guide.sections || []

  // Group sections by type for the sidebar summary
  const typeLabels = { food: '🍽️ Où manger', visit: '🏛️ À voir', experience: '✨ Expériences', story: '📖 Récits', tip: '💡 Conseils' }
  const typeCounts = sections.reduce((acc, s) => { acc[s.type] = (acc[s.type] || 0) + 1; return acc }, {})

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="relative h-[70vh] md:h-[80vh] flex items-end">
        {guide.cover_url ? (
          <img src={guide.cover_url} alt={guide.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-14 w-full">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={14} /> Tous les guides
          </Link>
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <MapPin size={13} />
            <span>{guide.city}, {guide.country}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
            {guide.title}
          </h1>
          <div className="flex items-center gap-4 text-white/50 text-sm">
            <span>{date}</span>
            {guide.author && <span>· Par {guide.author}</span>}
            {sections.length > 0 && <span>· {sections.length} section{sections.length > 1 ? 's' : ''}</span>}
          </div>
        </div>

        {user && (
          <Link
            to={`/admin?edit=${guide.id}`}
            className="absolute top-20 right-6 flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <Pencil size={13} /> Modifier
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-16">

          {/* Main */}
          <div>
            {/* Intro */}
            {guide.intro && (
              <p className="font-serif text-xl md:text-2xl text-stone-700 leading-relaxed mb-16 italic">
                "{guide.intro}"
              </p>
            )}

            {/* Sections */}
            {sections.length === 0 ? (
              <p className="text-stone-400 text-center py-16">Aucune section dans ce guide.</p>
            ) : (
              sections.map((section) => <SectionBlock key={section.id} section={section} />)
            )}
          </div>

          {/* Sidebar — sticky summary */}
          {sections.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 bg-stone-50 rounded-2xl p-6">
                <p className="font-serif text-lg font-semibold text-stone-900 mb-4">Dans ce guide</p>
                <ul className="space-y-2">
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <li key={type} className="flex items-center justify-between text-sm text-stone-600">
                      <span>{typeLabels[type] || type}</span>
                      <span className="bg-white border border-stone-200 rounded-full px-2 py-0.5 text-xs font-semibold text-stone-500">{count}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <p className="text-xs text-stone-400 flex items-center gap-1.5">
                    <MapPin size={11} /> {guide.city}, {guide.country}
                  </p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-stone-400 text-sm">
          <Link to="/" className="font-serif text-stone-600 font-semibold">Wanderlust</Link>
          <Link to="/" className="flex items-center gap-1.5 hover:text-stone-600 transition-colors">
            <ArrowLeft size={13} /> Tous les guides
          </Link>
        </div>
      </footer>
    </div>
  )
}
