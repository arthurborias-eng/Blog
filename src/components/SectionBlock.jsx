import { useState } from 'react'
import { MapPin } from 'lucide-react'
import PhotoLightbox from './PhotoLightbox'

const TYPE_CONFIG = {
  food:       { label: 'Où manger',    color: 'bg-terra-300/20 text-terra-600 border-terra-300/40' },
  visit:      { label: 'À voir',       color: 'bg-warm-100 text-warm-600 border-warm-200' },
  experience: { label: 'Expérience',   color: 'bg-cream-200 text-warm-600 border-cream-300' },
  story:      { label: 'Récit',        color: 'bg-cream-100 text-warm-500 border-cream-200' },
  tip:        { label: 'Bon à savoir', color: 'bg-cream-200 text-warm-500 border-cream-300' },
}

export default function SectionBlock({ section }) {
  const cfg       = TYPE_CONFIG[section.type] || TYPE_CONFIG.tip
  const blocks    = section.blocks?.length ? section.blocks : []
  const hasBlocks = blocks.length > 0
  const legacyImages = section.images || []
  const legacyDesc   = section.description || ''
  const imageBlocks  = hasBlocks ? blocks.filter(b => b.type === 'image' && b.url) : []
  const lightboxUrls = hasBlocks ? imageBlocks.map(b => b.url) : legacyImages
  const [lightboxIdx, setLightboxIdx] = useState(null)

  return (
    <div className="mb-20">
      <div className="mb-5">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      <h3 className="font-serif text-2xl md:text-3xl font-semibold text-warm-800 mb-2 leading-snug">
        {section.title}
      </h3>

      {section.address && (
        <a href={`https://maps.google.com/?q=${encodeURIComponent(section.address)}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-terra-400 text-sm hover:text-terra-600 transition-colors mb-8 group">
          <MapPin size={12} />
          <span className="underline underline-offset-2 decoration-terra-300/60">{section.address}</span>
        </a>
      )}

      {hasBlocks ? (
        <div className="space-y-6">
          {blocks.map((block, idx) => {
            if (block.type === 'paragraph' && block.text) return (
              <p key={block.id || idx} className="text-warm-500 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {block.text}
              </p>
            )
            if (block.type === 'subtitle' && block.text) return (
              <h4 key={block.id || idx} className="font-serif text-xl md:text-2xl font-semibold text-warm-700 pt-4">
                {block.text}
              </h4>
            )
            if (block.type === 'quote' && block.text) return (
              <blockquote key={block.id || idx}
                className="border-l-2 border-terra-300 pl-5 py-1 italic text-warm-400 text-lg md:text-xl leading-relaxed">
                {block.text}
              </blockquote>
            )
            if (block.type === 'tip' && block.text) return (
              <div key={block.id || idx} className="bg-terra-50/60 border border-terra-200/70 rounded-2xl px-5 py-4 flex gap-3">
                <span className="text-terra-400 flex-shrink-0 text-xs font-bold uppercase tracking-wider mt-0.5">✦</span>
                <p className="text-warm-600 text-sm leading-relaxed">{block.text}</p>
              </div>
            )
            if (block.type === 'image' && block.url) {
              const imgIdx = imageBlocks.findIndex(b => b.id === block.id)
              return (
                <figure key={block.id || idx} className="my-2">
                  <div onClick={() => setLightboxIdx(imgIdx)}
                    className="overflow-hidden rounded-2xl aspect-[16/9] cursor-zoom-in">
                    <img src={block.url} alt={block.caption || ''}
                      className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
                  </div>
                  {block.caption && (
                    <figcaption className="text-center text-sm text-warm-300 italic mt-3">{block.caption}</figcaption>
                  )}
                </figure>
              )
            }
            return null
          })}
        </div>
      ) : (
        <>
          {legacyImages.length > 0 && (
            <div className={`mb-6 gap-2 ${
              legacyImages.length === 1 ? 'block' :
              legacyImages.length === 2 ? 'grid grid-cols-2' :
              legacyImages.length === 3 ? 'grid grid-cols-3' : 'grid grid-cols-2'
            }`}>
              {legacyImages.slice(0, 4).map((url, i) => (
                <div key={i} onClick={() => setLightboxIdx(i)}
                  className={`overflow-hidden rounded-2xl cursor-zoom-in ${legacyImages.length === 1 ? 'aspect-[16/9]' : 'aspect-square'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          )}
          {legacyDesc && (
            <p className="text-warm-500 text-base md:text-lg leading-relaxed whitespace-pre-wrap">{legacyDesc}</p>
          )}
        </>
      )}

      {lightboxIdx !== null && lightboxUrls.length > 0 && (
        <PhotoLightbox
          images={lightboxUrls}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(i => Math.max(0, i - 1))}
          onNext={() => setLightboxIdx(i => Math.min(lightboxUrls.length - 1, i + 1))}
        />
      )}

      <div className="mt-14 h-px bg-cream-200" />
    </div>
  )
}
