import { MapPin } from 'lucide-react'

const TYPE_CONFIG = {
  food:       { label: 'Où manger',    emoji: '🍽️', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  visit:      { label: 'À voir',       emoji: '🏛️', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  experience: { label: 'Expérience',   emoji: '✨', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  story:      { label: 'Récit',        emoji: '📖', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  tip:        { label: 'Bon à savoir', emoji: '💡', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

export default function SectionBlock({ section }) {
  const cfg = TYPE_CONFIG[section.type] || TYPE_CONFIG.tip
  const images = section.images || []

  return (
    <div className="mb-16">
      {/* Type badge */}
      <div className="flex items-center gap-3 mb-5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-serif text-2xl md:text-3xl font-semibold text-stone-900 mb-2 leading-snug">
        {section.title}
      </h3>

      {/* Address */}
      {section.address && (
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(section.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-stone-400 text-sm hover:text-stone-700 transition-colors mb-5 group"
        >
          <MapPin size={13} className="group-hover:text-stone-700 transition-colors" />
          <span className="underline underline-offset-2 decoration-stone-300">{section.address}</span>
        </a>
      )}

      {/* Photos */}
      {images.length > 0 && (
        <div className={`mb-6 gap-3 ${
          images.length === 1 ? 'block' :
          images.length === 2 ? 'grid grid-cols-2' :
          images.length === 3 ? 'grid grid-cols-3' :
          'grid grid-cols-2 md:grid-cols-2'
        }`}>
          {images.slice(0, 4).map((url, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-2xl ${
                images.length === 1 ? 'aspect-[16/9]' :
                images.length === 3 && i === 0 ? 'row-span-2 aspect-square' :
                'aspect-square'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {section.description && (
        <p className="text-stone-600 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
          {section.description}
        </p>
      )}

      {/* Divider */}
      <div className="mt-12 h-px bg-stone-100" />
    </div>
  )
}
