import { useState } from 'react'
import { MapPin } from 'lucide-react'
import PhotoLightbox from './PhotoLightbox'

const TYPE_CONFIG = {
  food:       { label: 'Où manger',    emoji: '🍽️', color: 'bg-terra-300/20 text-terra-600 border-terra-300/40' },
  visit:      { label: 'À voir',       emoji: '🏛️', color: 'bg-warm-100 text-warm-600 border-warm-200' },
  experience: { label: 'Expérience',   emoji: '✨', color: 'bg-cream-200 text-warm-600 border-cream-300' },
  story:      { label: 'Récit',        emoji: '📖', color: 'bg-cream-100 text-warm-500 border-cream-200' },
  tip:        { label: 'Bon à savoir', emoji: '💡', color: 'bg-cream-200 text-warm-500 border-cream-300' },
}

export default function SectionBlock({ section }) {
  const cfg    = TYPE_CONFIG[section.type] || TYPE_CONFIG.tip
  const images = section.images || []
  const [lightboxIdx, setLightboxIdx] = useState(null)

  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      <h3 className="font-serif text-2xl md:text-3xl font-semibold text-warm-800 mb-2 leading-snug">
        {section.title}
      </h3>

      {section.address && (
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(section.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-terra-400 text-sm hover:text-terra-600 transition-colors mb-5 group"
        >
          <MapPin size={12} />
          <span className="underline underline-offset-2 decoration-terra-300/60">{section.address}</span>
        </a>
      )}

      {images.length > 0 && (
        <>
          <div className={`mb-6 gap-2 ${
            images.length === 1 ? 'block' :
            images.length === 2 ? 'grid grid-cols-2' :
            images.length === 3 ? 'grid grid-cols-3' :
            'grid grid-cols-2'
          }`}>
            {images.slice(0, 4).map((url, i) => (
              <div
                key={i}
                onClick={() => setLightboxIdx(i)}
                className={`overflow-hidden rounded-2xl cursor-zoom-in ${
                  images.length === 1 ? 'aspect-[16/9]' : 'aspect-square'
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
          {lightboxIdx !== null && (
            <PhotoLightbox
              images={images}
              index={lightboxIdx}
              onClose={() => setLightboxIdx(null)}
              onPrev={() => setLightboxIdx(i => Math.max(0, i - 1))}
              onNext={() => setLightboxIdx(i => Math.min(images.length - 1, i + 1))}
            />
          )}
        </>
      )}

      {section.description && (
        <p className="text-warm-500 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
          {section.description}
        </p>
      )}

      <div className="mt-12 h-px bg-cream-200" />
    </div>
  )
}
