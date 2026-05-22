import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import SectionBlock from '../components/SectionBlock'
import GuideMap from '../components/GuideMap'
import ReadingProgress from '../components/ReadingProgress'
import { MapPin, ArrowLeft, Pencil, Share2, Check, Clock } from 'lucide-react'

function readingTime(sections) {
  const words = sections.reduce((acc, s) => acc + (s.description || '').split(' ').length, 0)
  return Math.max(2, Math.round(words / 200))
}

export default function GuidePage() {
  const { id }   = useParams()
  const { user } = useAuth()
  const [guide,   setGuide]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    supabase.from('guides').select('*').eq('id', id).single()
      .then(({ data }) => { setGuide(data); setLoading(false) })
  }, [id])

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: guide.title, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div className="w-8 h-8 border-2 border-cream-300 border-t-terra-400 rounded-full animate-spin" />
    </div>
  )

  if (!guide) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream-50">
      <p className="font-serif text-2xl text-warm-300">Guide introuvable</p>
      <Link to="/" className="text-sm text-terra-400 underline">Retour à l'accueil</Link>
    </div>
  )

  const date     = new Date(guide.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const sections = guide.sections || []
  const mins     = readingTime(sections)

  const typeLabels = { food: '🍽️ Où manger', visit: '🏛️ À voir', experience: '✨ Expériences', story: '📖 Récits', tip: '💡 Conseils' }
  const typeCounts = sections.reduce((acc, s) => { acc[s.type] = (acc[s.type] || 0) + 1; return acc }, {})

  const hasMap = sections.some(s => s.address?.trim())

  return (
    <div className="min-h-screen bg-cream-50">
      <ReadingProgress />

      {/* Hero */}
      <div className="relative h-[75vh] md:h-[85vh] flex items-end">
        {guide.cover_url ? (
          <img src={guide.cover_url} alt={guide.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-warm-600 to-warm-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-14 w-full">
          <Link to="/" className="inline-flex items-center gap-2 text-white/45 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={13} /> Tous les guides
          </Link>
          <p className="text-white/45 text-xs font-medium tracking-[0.2em] uppercase mb-3 flex items-center gap-1.5">
            <MapPin size={10} /> {guide.city}, {guide.country}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-5 max-w-2xl">
            {guide.title}
          </h1>
          <div className="flex items-center flex-wrap gap-4 text-white/40 text-xs">
            <span>{date}</span>
            {guide.author && <span>· Par {guide.author}</span>}
            <span className="flex items-center gap-1"><Clock size={10} /> {mins} min de lecture</span>
            {sections.length > 0 && <span>· {sections.length} section{sections.length > 1 ? 's' : ''}</span>}
          </div>
        </div>

        {/* Action buttons on hero */}
        <div className="absolute top-20 right-6 flex gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors border border-white/20"
          >
            {copied ? <><Check size={12} /> Copié !</> : <><Share2 size={12} /> Partager</>}
          </button>
          {user && (
            <Link
              to={`/admin?edit=${guide.id}`}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors border border-white/20"
            >
              <Pencil size={12} /> Modifier
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-16">

          {/* Main */}
          <div>
            {/* Intro quote */}
            {guide.intro && (
              <p className="font-serif text-xl md:text-2xl text-warm-600 leading-relaxed mb-16 italic border-l-2 border-terra-300 pl-6">
                {guide.intro}
              </p>
            )}

            {/* Map */}
            {hasMap && <GuideMap sections={sections} />}

            {/* Sections */}
            {sections.length === 0 ? (
              <p className="text-warm-300 text-center py-16">Aucune section dans ce guide.</p>
            ) : (
              sections.map(s => <SectionBlock key={s.id} section={s} />)
            )}

            {/* End of guide */}
            {sections.length > 0 && (
              <div className="text-center py-12">
                <div className="w-8 h-px bg-terra-300 mx-auto mb-6" />
                <p className="font-serif text-warm-400 italic text-lg">Bon voyage ✦</p>
                <Link to="/" className="inline-flex items-center gap-2 mt-6 text-sm text-terra-400 hover:text-terra-600 transition-colors font-medium">
                  <ArrowLeft size={13} /> Voir tous les guides
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {sections.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">

                {/* Summary */}
                <div className="bg-white border border-cream-200 rounded-2xl p-6">
                  <p className="font-serif text-base font-semibold text-warm-700 mb-4">Dans ce guide</p>
                  <ul className="space-y-2.5">
                    {Object.entries(typeCounts).map(([type, count]) => (
                      <li key={type} className="flex items-center justify-between text-sm text-warm-500">
                        <span>{typeLabels[type] || type}</span>
                        <span className="bg-cream-100 border border-cream-200 rounded-full px-2 py-0.5 text-xs font-semibold text-warm-400">{count}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 pt-5 border-t border-cream-100 space-y-1.5">
                    <p className="text-xs text-warm-300 flex items-center gap-1.5">
                      <MapPin size={10} /> {guide.city}, {guide.country}
                    </p>
                    <p className="text-xs text-warm-300 flex items-center gap-1.5">
                      <Clock size={10} /> {mins} min de lecture
                    </p>
                  </div>
                </div>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-cream-200 bg-white text-warm-500 hover:border-terra-300 hover:text-terra-500 text-sm font-medium transition-colors"
                >
                  {copied ? <><Check size={13} /> Lien copié !</> : <><Share2 size={13} /> Partager ce guide</>}
                </button>

              </div>
            </aside>
          )}
        </div>
      </div>

      <footer className="border-t border-cream-200 py-10 bg-cream-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="font-serif text-warm-700 font-semibold">Wanderlust</Link>
          <Link to="/" className="flex items-center gap-1.5 text-warm-300 hover:text-warm-600 text-sm transition-colors">
            <ArrowLeft size={12} /> Tous les guides
          </Link>
        </div>
      </footer>
    </div>
  )
}
