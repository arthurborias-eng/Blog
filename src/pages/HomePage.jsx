import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import GuideCard from '../components/GuideCard'
import { ChevronRight } from 'lucide-react'

export default function HomePage() {
  const [guides, setGuides]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [activeCountry, setActiveCountry] = useState('all')

  useEffect(() => {
    supabase
      .from('guides')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setGuides(data || []); setLoading(false) })
  }, [])

  const countries = ['all', ...new Set(guides.map(g => g.country))]
  const filtered  = activeCountry === 'all' ? guides : guides.filter(g => g.country === activeCountry)

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
            <Link
              to={`/guide/${featured.id}`}
              className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-medium text-sm px-6 py-3.5 rounded-full transition-colors"
            >
              Lire le dernier guide <ChevronRight size={15} />
            </Link>
          )}
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-px h-14 bg-white/25" />
        </div>
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
            {/* Country filter */}
            {countries.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-16">
                {countries.map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveCountry(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCountry === c
                        ? 'bg-warm-800 text-cream-50'
                        : 'bg-cream-100 text-warm-500 hover:bg-cream-200 border border-cream-200'
                    }`}
                  >
                    {c === 'all' ? '🌍 Tous les pays' : c}
                  </button>
                ))}
              </div>
            )}

            {Object.values(grouped).map(({ country, city, guides: cityGuides }) => (
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
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-cream-200 py-10 bg-cream-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="font-serif text-warm-700 font-semibold text-lg">Wanderlust</span>
          <span className="text-warm-300 text-sm">Fait avec ❤️</span>
        </div>
      </footer>
    </div>
  )
}
