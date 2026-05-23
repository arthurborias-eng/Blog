import { useRef } from 'react'
import { X, ImageIcon, Loader } from 'lucide-react'

const BLOCK_TYPES = [
  { type: 'paragraph', icon: '¶', label: 'Paragraphe' },
  { type: 'subtitle',  icon: 'H', label: 'Sous-titre' },
  { type: 'image',     icon: '⬚', label: 'Photo'      },
  { type: 'quote',     icon: '"', label: 'Citation'   },
  { type: 'tip',       icon: '✦', label: 'Astuce'     },
]

function newBlock(type) {
  return {
    id: crypto.randomUUID(), type, text: '',
    ...(type === 'image' ? { url: '', caption: '' } : {}),
  }
}

export default function BlockEditor({ blocks = [], onChange, onImageUpload, uploading = {} }) {
  const add    = (type) => onChange([...blocks, newBlock(type)])
  const update = (id, u) => onChange(blocks.map(b => b.id === id ? { ...b, ...u } : b))
  const remove = (id)    => onChange(blocks.filter(b => b.id !== id))

  return (
    <div>
      <div className="space-y-2.5 mb-3">
        {blocks.map(block => (
          <BlockItem
            key={block.id}
            block={block}
            onUpdate={u => update(block.id, u)}
            onRemove={() => remove(block.id)}
            onImageUpload={file => onImageUpload(block.id, file)}
            uploading={!!uploading[block.id]}
          />
        ))}
        {blocks.length === 0 && (
          <p className="text-xs text-warm-200 italic py-2">Aucun bloc — commence par en ajouter un ci-dessous.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {BLOCK_TYPES.map(({ type, icon, label }) => (
          <button key={type} type="button" onClick={() => add(type)}
            className="flex items-center gap-1.5 text-xs text-warm-300 hover:text-terra-500 border border-dashed border-cream-200 hover:border-terra-300 px-3 py-1.5 rounded-lg transition-colors">
            <span className="font-bold text-[10px]">{icon}</span>{label}
          </button>
        ))}
      </div>
    </div>
  )
}

function RemoveBtn({ onRemove }) {
  return (
    <button type="button" onClick={onRemove}
      className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-400 text-warm-200 transition-all z-10">
      <X size={11} />
    </button>
  )
}

function BlockItem({ block, onUpdate, onRemove, onImageUpload, uploading }) {
  const fileRef = useRef(null)
  const wrap = 'relative group rounded-xl border'
  const ta   = 'w-full bg-transparent text-warm-600 text-sm leading-relaxed focus:outline-none resize-none placeholder-cream-300'

  if (block.type === 'paragraph') return (
    <div className={`${wrap} border-cream-200 border-l-2 border-l-warm-200 bg-cream-50/40 p-4`}>
      <RemoveBtn onRemove={onRemove} />
      <textarea value={block.text} rows={3} onChange={e => onUpdate({ text: e.target.value })}
        placeholder="Écris ton paragraphe…" className={ta} />
    </div>
  )

  if (block.type === 'subtitle') return (
    <div className={`${wrap} border-cream-200 bg-cream-50/40 px-4 py-3`}>
      <RemoveBtn onRemove={onRemove} />
      <input value={block.text} onChange={e => onUpdate({ text: e.target.value })}
        placeholder="Sous-titre de section…"
        className="w-full bg-transparent font-serif text-lg font-semibold text-warm-700 focus:outline-none placeholder-cream-300" />
    </div>
  )

  if (block.type === 'quote') return (
    <div className={`${wrap} border-cream-200 border-l-2 border-l-terra-300 bg-cream-50/40 p-4`}>
      <RemoveBtn onRemove={onRemove} />
      <textarea value={block.text} rows={2} onChange={e => onUpdate({ text: e.target.value })}
        placeholder="Une citation, une anecdote…"
        className={`${ta} italic text-warm-400`} />
    </div>
  )

  if (block.type === 'tip') return (
    <div className={`${wrap} border-terra-200/60 bg-terra-50/30 p-4`}>
      <RemoveBtn onRemove={onRemove} />
      <p className="text-terra-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">✦ Bon à savoir</p>
      <textarea value={block.text} rows={2} onChange={e => onUpdate({ text: e.target.value })}
        placeholder="Un conseil, une info pratique…" className={ta} />
    </div>
  )

  if (block.type === 'image') return (
    <div className={`${wrap} border-cream-200 bg-cream-50/40 p-3`}>
      <RemoveBtn onRemove={onRemove} />
      {block.url ? (
        <>
          <img src={block.url} alt="" className="w-full h-44 object-cover rounded-lg mb-2" />
          <input value={block.caption || ''} onChange={e => onUpdate({ caption: e.target.value })}
            placeholder="Légende (optionnelle)…"
            className="w-full text-xs italic text-warm-300 bg-transparent focus:outline-none placeholder-cream-300" />
        </>
      ) : (
        <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-cream-200 cursor-pointer hover:border-terra-300 hover:bg-cream-50 transition-colors">
          {uploading
            ? <Loader size={16} className="animate-spin text-terra-400" />
            : <><ImageIcon size={16} className="text-warm-200 mb-1.5" /><span className="text-xs text-warm-300">Ajouter une photo</span></>
          }
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { if (e.target.files[0]) onImageUpload(e.target.files[0]) }} />
        </label>
      )}
    </div>
  )

  return null
}
