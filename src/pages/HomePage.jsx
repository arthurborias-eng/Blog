import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import GuideCard from '../components/GuideCard'
import { MapPin, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCountry, setActiveCountry] = useState('all')

  useEffect(() => {
    supabase
      .from('guides')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setGuides(data || []); setLoading(false) })
  }, [])

  // Group by country
  const countries = ['all', ...new Set(guides.map(g => g.country))]
  const filtered = activeCountry === 'all' ? guides : guides.filter(g => g.country === activeCountry)

  // Group filtered guides by country then city
  const grouped = filtered.reduce((acc, g) => {
    const key = `${g.country}__${g.city}`
    if (!acc[key]) acc[key] = { country: g.country, city: g.city, guides: [] }
    acc[key].guides.push(g)
    return acc
  }, {})

  const featured = guides[0]

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="relative h-screen flex items-end">
        {featured?.cover_url ? (
          <img src={featured.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20 w-full">
          <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-4">Guides de voyage</p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight mb-6 max-w-3xl">
            Des adresses,<br />des histoires.
          </h1>
          <p className="text-white/70 text-lg max-w-xl leading-relaxed mb-8">
            Guides de voyage authentiques écrits avec passion — restaurants, lieux à voir, expériences inoubliables.
          </p>
          {featured && (
            <Link
              to={`/guide/${featured.id}`}
              className="inline-flex items-center gap-2 bg-white text-stone-900 font-semibold text-sm px-6 py-3.5 rounded-full hover:bg-stone-100 transition-colors"
            >
              Lire le dernier guide <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <div className="w-px h-12 bg-white/30 animate-pulse" />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-20">

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-serif text-3xl text-stone-300 mb-4">Aucun guide encore</p>
            <p className="text-stone-400">Les aventures arrivent bientôt…</p>
          </div>
        ) : (
          <>
            {/* Country filter */}
            {countries.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-14">
                {countries.map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveCountry(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCountry === c
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {c === 'all' ? '🌍 Tous les pays' : `📍 ${c}`}
                  </button>
                ))}
              </div>
            )}

            {/* Guides grouped by country/city */}
            {Object.values(grouped).map(({ country, city, guides: cityGuides }) => (
              <div key={`${country}__${city}`} className="mb-20">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-stone-100">
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">{country}</p>
                    <h2 className="font-serif text-3xl font-semibold text-stone-900">{city}</h2>
                  </div>
                </div>

                {cityGuides.length === 1 ? (
                  <GuideCard guide={cityGuides[0]} featured />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cityGuides.map(g => <GuideCard key={g.id} guide={g} />)}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-stone-400 text-sm">
          <span className="font-serif text-stone-600 font-semibold">Wanderlust</span>
          <span>Fait avec ❤️</span>
        </div>
      </footer>
    </div>
  )
}
