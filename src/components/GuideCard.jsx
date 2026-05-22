import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function GuideCard({ guide, featured = false }) {
  const date = new Date(guide.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const sectionCount = guide.sections?.length || 0

  if (featured) {
    return (
      <Link to={`/guide/${guide.id}`} className="group block relative overflow-hidden rounded-3xl aspect-[16/9]">
        {guide.cover_url ? (
          <img src={guide.cover_url} alt={guide.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-warm-600 to-warm-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-2 text-white/60 text-xs font-medium tracking-widest uppercase mb-3">
            <MapPin size={11} />
            <span>{guide.city}, {guide.country}</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight mb-3 group-hover:opacity-90 transition-opacity">
            {guide.title}
          </h2>
          {guide.intro && (
            <p className="text-white/65 text-sm leading-relaxed line-clamp-2 max-w-xl">{guide.intro}</p>
          )}
          <div className="mt-5 flex items-center gap-4 text-white/45 text-xs">
            <span>{date}</span>
            {sectionCount > 0 && <span>· {sectionCount} adresse{sectionCount > 1 ? 's' : ''}</span>}
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
          <div className="w-full h-full bg-gradient-to-br from-cream-200 to-cream-300 flex items-center justify-center">
            <span className="text-4xl">🌍</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-terra-400 text-xs font-medium tracking-wide uppercase mb-2">
        <MapPin size={10} />
        <span>{guide.city}, {guide.country}</span>
      </div>
      <h3 className="font-serif text-xl font-semibold text-warm-800 leading-snug mb-2 group-hover:text-terra-500 transition-colors">
        {guide.title}
      </h3>
      {guide.intro && (
        <p className="text-warm-400 text-sm leading-relaxed line-clamp-2">{guide.intro}</p>
      )}
      <div className="mt-3 text-warm-300 text-xs">{date}</div>
    </Link>
  )
}
