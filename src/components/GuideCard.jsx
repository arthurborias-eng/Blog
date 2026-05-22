import { Link } from 'react-router-dom'
import { MapPin, Calendar } from 'lucide-react'

const TYPE_ICONS = { food: '🍽️', visit: '🏛️', experience: '✨', story: '📖', tip: '💡' }

export default function GuideCard({ guide, featured = false }) {
  const date = new Date(guide.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const sectionCount = guide.sections?.length || 0

  if (featured) {
    return (
      <Link to={`/guide/${guide.id}`} className="group block relative overflow-hidden rounded-3xl aspect-[16/9]">
        {guide.cover_url ? (
          <img src={guide.cover_url} alt={guide.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-700 to-stone-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <MapPin size={13} />
            <span>{guide.city}, {guide.country}</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight mb-3 group-hover:opacity-90 transition-opacity">
            {guide.title}
          </h2>
          {guide.intro && (
            <p className="text-white/75 text-sm leading-relaxed line-clamp-2 max-w-xl">{guide.intro}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-white/60 text-xs">
            <span>{date}</span>
            {sectionCount > 0 && <span>{sectionCount} adresse{sectionCount > 1 ? 's' : ''}</span>}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/guide/${guide.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-4">
        {guide.cover_url ? (
          <img src={guide.cover_url} alt={guide.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
            <span className="text-4xl">🌍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
      </div>
      <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium mb-2">
        <MapPin size={11} />
        <span>{guide.city}, {guide.country}</span>
      </div>
      <h3 className="font-serif text-xl font-semibold text-stone-900 leading-snug mb-2 group-hover:text-stone-600 transition-colors">
        {guide.title}
      </h3>
      {guide.intro && (
        <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">{guide.intro}</p>
      )}
      <div className="mt-3 flex items-center gap-3 text-stone-400 text-xs">
        <span>{date}</span>
        {sectionCount > 0 && <span>· {sectionCount} adresse{sectionCount > 1 ? 's' : ''}</span>}
      </div>
    </Link>
  )
}
