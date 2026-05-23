import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import GuideCard from '../components/GuideCard'
import { ChevronRight, MapPin, BookOpen, Globe, Search, X } from 'lucide-react'

export default function HomePage() {
  const [guides, setGuides]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeCountry, setActiveCountry] = useState('all')
  const [query, setQuery]             = useState('')

  useEffect(() => {
    supabase
      .from('guides')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setGuides(data || []); setLoading(false) })
  }, [])

  const countries = ['all', ...new Set(guides.map(g => g.country))]

  const filtered = guides.filter(g => {
    const q = query.toLowerCase()
    const matchesSearch = !q ||
      g.title?.toLowerCase().includes(q) ||
      g.city?.toLowerCase().includes(q) ||
      g.country?.toLowerCase().includes(q)
    const matchesCountry = activeCountry === 'all' || g.country === activeCountry
    return matchesSearch && matchesCountry
  })

  const grouped = filtered.reduce((acc, g) => {
    const key = `${g.country}__${g.city}`
    if (!acc[key]) acc[key] = { country: g.country, city: g.city, guides: [] }
    acc[key].guides.push(g)
    return acc
  }, {})

  const featured = guides[0]

  return (
    <div className="min-h-screen bg-cream-50">

      {/* Hero */}
      <div className="relative h-screen flex items-end">
        {featured?.cover_url ? (
          <img src={featured.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-warm-700 to-warm-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20 w-full">
          <p className="text-white/50 text-xs font-medium tracking-[0.25em] uppercase mb-5">Guides de voyage</p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight mb-6 max-w-3xl">
            Des adresses,<br />des histoires.
          </h1>
          <p className="text-white/60 text-lg max-w-md leading-relaxed mb-10">
            Guides authentiques écrits avec passion — restaurants, lieux, expériences inoubliables.
          </p>
          {featured && (
            <Link to={`/guide/${featured.id}`}
              className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-medium text-sm px-6 py-3.5 rounded-full transition-colors">
              Lire le dernier guide <ChevronRight size={15} />
            </Link>
          )}
        </div>

        {guides.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-8">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <BookOpen size={14} className="text-terra-300" />
                <span><strong className="text-white">{guides.length}</strong> guide{guides.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Globe size={14} className="text-terra-300" />
                <span><strong className="text-white">{new Set(guides.map(g => g.country)).size}</strong> pays</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin size={14} className="text-terra-300" />
                <span><strong className="text-white">{guides.reduce((acc, g) => acc + (g.sections?.length || 0), 0)}</strong> adresses</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-24">

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-cream-300 border-t-terra-400 rounded-full animate-spin" />
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-serif text-3xl text-warm-200 mb-3">Aucun guide encore</p>
            <p className="text-warm-300 text-sm">Les aventures arrivent bientôt…</p>
          </div>
        ) : (
          <>
            {/* Search bar */}
            <div className="relative mb-8 max-w-md">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-300 pointer-events-none" />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveCountry('all') }}
                placeholder="Rechercher une ville, un pays…"
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-cream-200 bg-white text-warm-700 text-sm placeholder-warm-200 focus:outline-none focus:border-terra-300 focus:ring-2 focus:ring-terra-100 transition-all"
              />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-cream-100 text-warm-300 transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Country filter */}
            {!query && countries.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-16">
                {countries.map(c => (
                  <button key={c} onClick={() => setActiveCountry(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCountry === c
                        ? 'bg-warm-800 text-cream-50'
                        : 'bg-cream-100 text-warm-500 hover:bg-cream-200 border border-cream-200'
                    }`}>
                    {c === 'all' ? '🌍 Tous les pays' : c}
                  </button>
                ))}
              </div>
            )}

            {/* Search result info */}
            {query && (
              <p className="text-warm-300 text-sm mb-10">
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''} pour «&nbsp;{query}&nbsp;»
              </p>
            )}

            {/* Guide groups */}
            {Object.values(grouped).length === 0 ? (
              <div className="text-center py-24">
                <p className="font-serif text-2xl text-warm-200 mb-2">Aucun résultat</p>
                <p className="text-warm-300 text-sm">Essaie un autre mot-clé.</p>
              </div>
            ) : (
              Object.values(grouped).map(({ country, city, guides: cityGuides }) => (
                <div key={`${country}__${city}`} className="mb-24">
                  <div className="mb-10 pb-5 border-b border-cream-200">
                    <p className="text-terra-400 text-xs font-semibold tracking-[0.2em] uppercase mb-1">{country}</p>
                    <h2 className="font-serif text-3xl font-semibold text-warm-800">{city}</h2>
                  </div>
                  {cityGuides.length === 1 ? (
                    <GuideCard guide={cityGuides[0]} featured />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      {cityGuides.map(g => <GuideCard key={g.id} guide={g} />)}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>

      <footer className="border-t border-cream-200 py-10 bg-cream-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="font-serif text-warm-700 font-semibold text-lg">Wanderlust</span>
          <span className="text-warm-300 text-sm">Fait avec ❤️</span>
        </div>
      </footer>
    </div>
  )
}
