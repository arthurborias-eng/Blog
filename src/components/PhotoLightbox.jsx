import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function PhotoLightbox({ images, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && index > 0) onPrev()
      if (e.key === 'ArrowRight' && index < images.length - 1) onNext()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index])

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
        <X size={20} />
      </button>

      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <ChevronLeft size={22} />
        </button>
      )}

      <img
        src={images[index]}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      />

      {index < images.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onNext() }}
          className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <ChevronRight size={22} />
        </button>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>
    </div>
  )
}
