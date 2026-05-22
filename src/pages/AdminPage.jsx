import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Trash2, GripVertical, X, Upload, ArrowLeft, Eye, Check } from 'lucide-react'

const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY

const SECTION_TYPES = [
  { value: 'food',       label: '🍽️ Où manger'    },
  { value: 'visit',      label: '🏛️ À voir'        },
  { value: 'experience', label: '✨ Expérience'     },
  { value: 'story',      label: '📖 Récit'          },
  { value: 'tip',        label: '💡 Bon à savoir'   },
]

async function uploadImage(file) {
  const formData = new FormData()
  // Compress
  const img = new Image()
  const url = URL.createObjectURL(file)
  await new Promise(res => { img.onload = res; img.src = url })
  const MAX = 1400
  const scale = Math.min(1, MAX / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width  = img.width  * scale
  canvas.height = img.height * scale
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.82))
  formData.append('image', blob)
  const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: formData })
  const data = await res.json()
  if (!data.success) throw new Error('Upload échoué')
  return data.data.url
}

function newSection() {
  return { id: crypto.randomUUID(), type: 'food', title: '', address: '', description: '', images: [] }
}

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const [title,     setTitle]     = useState('')
  const [city,      setCity]      = useState('')
  const [country,   setCountry]   = useState('')
  const [intro,     setIntro]     = useState('')
  const [coverUrl,  setCoverUrl]  = useState('')
  const [sections,  setSections]  = useState([newSection()])
  const [published, setPublished] = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingSec, setUploadingSec] = useState({})

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  // Load existing guide if editing
  useEffect(() => {
    if (!editId) return
    supabase.from('guides').select('*').eq('id', editId).single().then(({ data }) => {
      if (!data) return
      setTitle(data.title)
      setCity(data.city)
      setCountry(data.country)
      setIntro(data.intro || '')
      setCoverUrl(data.cover_url || '')
      setSections(data.sections?.length ? data.sections : [newSection()])
      setPublished(data.published)
    })
  }, [editId])

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const url = await uploadImage(file)
      setCoverUrl(url)
    } catch (err) { toast.error(err.message) }
    finally { setUploadingCover(false) }
  }

  const handleSectionImage = async (secId, e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploadingSec(prev => ({ ...prev, [secId]: true }))
    try {
      const urls = await Promise.all(files.map(uploadImage))
      setSections(prev => prev.map(s => s.id === secId ? { ...s, images: [...s.images, ...urls] } : s))
    } catch (err) { toast.error(err.message) }
    finally { setUploadingSec(prev => ({ ...prev, [secId]: false })) }
  }

  const updateSection = (id, field, value) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const removeSection = (id) => setSections(prev => prev.filter(s => s.id !== id))
  const removeImage   = (secId, idx) => setSections(prev =>
    prev.map(s => s.id === secId ? { ...s, images: s.images.filter((_, i) => i !== idx) } : s)
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !city.trim() || !country.trim()) { toast.error('Titre, ville et pays obligatoires'); return }
    setSaving(true)
    try {
      const payload = {
        title: title.trim(), city: city.trim(), country: country.trim(),
        intro: intro.trim(), cover_url: coverUrl || null,
        sections, published, author: user.email,
      }
      let error
      if (editId) {
        ({ error } = await supabase.from('guides').update(payload).eq('id', editId))
      } else {
        ({ error } = await supabase.from('guides').insert(payload))
      }
      if (error) throw error
      toast.success(editId ? 'Guide mis à jour !' : 'Guide publié !')
      navigate('/')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-24">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link to="/" className="flex items-center gap-1.5 text-stone-400 text-sm hover:text-stone-600 transition-colors mb-2">
              <ArrowLeft size={13} /> Retour
            </Link>
            <h1 className="font-serif text-3xl font-bold text-stone-900">
              {editId ? 'Modifier le guide' : 'Nouveau guide'}
            </h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            <Check size={15} />
            {saving ? 'Enregistrement…' : editId ? 'Mettre à jour' : 'Publier'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Cover photo */}
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <label className="block cursor-pointer">
              {coverUrl ? (
                <div className="relative">
                  <img src={coverUrl} alt="" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium text-sm">Changer la photo</span>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center gap-3 text-stone-400 hover:bg-stone-50 transition-colors">
                  {uploadingCover
                    ? <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                    : <>
                        <Upload size={24} />
                        <span className="text-sm font-medium">Ajouter une photo de couverture</span>
                      </>
                  }
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          </div>

          {/* Guide info */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Titre *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="3 jours à Lisbonne"
                className="w-full text-2xl font-serif font-semibold text-stone-900 placeholder-stone-300 focus:outline-none border-0 bg-transparent"
              />
            </div>
            <div className="h-px bg-stone-100" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Ville *</label>
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Lisbonne"
                  className="w-full text-stone-900 placeholder-stone-300 focus:outline-none border-0 bg-transparent font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Pays *</label>
                <input
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="Portugal"
                  className="w-full text-stone-900 placeholder-stone-300 focus:outline-none border-0 bg-transparent font-medium"
                />
              </div>
            </div>
            <div className="h-px bg-stone-100" />
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Introduction</label>
              <textarea
                value={intro}
                onChange={e => setIntro(e.target.value)}
                rows={3}
                placeholder="Une phrase pour donner envie de lire…"
                className="w-full text-stone-600 placeholder-stone-300 focus:outline-none border-0 bg-transparent resize-none text-base leading-relaxed"
              />
            </div>
          </div>

          {/* Sections */}
          <div>
            <h2 className="font-serif text-xl font-semibold text-stone-900 mb-4">Sections</h2>
            <div className="space-y-4">
              {sections.map((sec, idx) => (
                <div key={sec.id} className="bg-white rounded-2xl border border-stone-100 p-6">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    {/* Type selector */}
                    <div className="flex flex-wrap gap-2">
                      {SECTION_TYPES.map(t => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => updateSection(sec.id, 'type', t.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            sec.type === t.value
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => removeSection(sec.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input
                      value={sec.title}
                      onChange={e => updateSection(sec.id, 'title', e.target.value)}
                      placeholder="Nom du lieu ou titre de la section"
                      className="w-full font-serif text-xl font-semibold text-stone-900 placeholder-stone-300 focus:outline-none border-0 bg-transparent"
                    />
                    {(sec.type === 'food' || sec.type === 'visit') && (
                      <input
                        value={sec.address}
                        onChange={e => updateSection(sec.id, 'address', e.target.value)}
                        placeholder="Adresse complète"
                        className="w-full text-sm text-stone-500 placeholder-stone-300 focus:outline-none border-0 bg-transparent"
                      />
                    )}
                    <textarea
                      value={sec.description}
                      onChange={e => updateSection(sec.id, 'description', e.target.value)}
                      rows={4}
                      placeholder="Description, anecdotes, conseils…"
                      className="w-full text-stone-600 placeholder-stone-300 focus:outline-none border-0 bg-transparent resize-none text-sm leading-relaxed"
                    />

                    {/* Images */}
                    {sec.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {sec.images.map((url, i) => (
                          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(sec.id, i)}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X size={16} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <label className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-stone-600 cursor-pointer transition-colors">
                      {uploadingSec[sec.id]
                        ? <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
                        : <Upload size={14} />
                      }
                      <span>Ajouter des photos</span>
                      <input type="file" accept="image/*" multiple onChange={e => handleSectionImage(sec.id, e)} className="hidden" />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Add section */}
            <button
              type="button"
              onClick={() => setSections(prev => [...prev, newSection()])}
              className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> Ajouter une section
            </button>
          </div>

          {/* Publish toggle */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-stone-900 text-sm">Publié</p>
              <p className="text-stone-400 text-xs mt-0.5">Visible par tous les visiteurs</p>
            </div>
            <button
              type="button"
              onClick={() => setPublished(v => !v)}
              className={`w-12 h-6 rounded-full transition-colors ${published ? 'bg-stone-900' : 'bg-stone-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${published ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-semibold rounded-2xl transition-colors"
          >
            {saving ? 'Enregistrement…' : editId ? '✓ Mettre à jour le guide' : '✓ Publier le guide'}
          </button>

        </form>
      </div>
    </div>
  )
}
