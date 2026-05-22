import { useEffect, useRef } from 'react'

const TYPE_CONFIG = {
  food:       { emoji: '🍽️', color: '#b5674d' },
  visit:      { emoji: '🏛️', color: '#8a7560' },
  experience: { emoji: '✨', color: '#9e8c6a' },
  story:      { emoji: '📖', color: '#a08070' },
  tip:        { emoji: '💡', color: '#b09070' },
}

function makeIcon(L, type) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.tip
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/></filter>
      <path d="M20 2C12.27 2 6 8.27 6 16c0 11 14 30 14 30s14-19 14-30C34 8.27 27.73 2 20 2z"
        fill="${cfg.color}" filter="url(#s)"/>
      <circle cx="20" cy="16" r="9" fill="white"/>
      <text x="20" y="21" text-anchor="middle" font-size="11">${cfg.emoji}</text>
    </svg>`
  return L.divIcon({ html: svg, className: '', iconSize: [40, 48], iconAnchor: [20, 48], popupAnchor: [0, -50] })
}

export default function GuideMap({ sections }) {
  const mapRef       = useRef(null)
  const instanceRef  = useRef(null)

  const spots = sections.filter(s => s.address && s.address.trim())

  useEffect(() => {
    if (spots.length === 0 || instanceRef.current) return

    let L
    import('leaflet').then(mod => {
      L = mod.default

      // Fix default icon paths
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' })

      const map = L.map(mapRef.current, { zoomControl: false, scrollWheelZoom: false })
      instanceRef.current = map

      // CartoDB Voyager — warm, editorial style
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      const bounds = []

      // Geocode each address and add marker
      spots.forEach(async (sec) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(sec.address)}&format=json&limit=1`)
          const data = await res.json()
          if (!data[0]) return
          const { lat, lon } = data[0]
          const latlng = [parseFloat(lat), parseFloat(lon)]
          bounds.push(latlng)

          const marker = L.marker(latlng, { icon: makeIcon(L, sec.type) }).addTo(map)
          marker.bindPopup(`
            <div style="font-family:'Inter',sans-serif;min-width:180px">
              <div style="font-size:11px;color:#b5674d;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">
                ${TYPE_CONFIG[sec.type]?.emoji || ''} ${sec.type === 'food' ? 'Où manger' : sec.type === 'visit' ? 'À voir' : 'Expérience'}
              </div>
              <div style="font-size:14px;font-weight:700;color:#2d2018;margin-bottom:4px;font-family:'Playfair Display',serif">${sec.title}</div>
              <div style="font-size:12px;color:#7a6558">${sec.address}</div>
            </div>
          `, { className: 'wanderlust-popup' })

          if (bounds.length === spots.length) {
            if (bounds.length === 1) map.setView(bounds[0], 15)
            else map.fitBounds(bounds, { padding: [40, 40] })
          }
        } catch {}
      })
    })

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [])

  if (spots.length === 0) return null

  return (
    <div className="mb-16">
      <h3 className="font-serif text-2xl font-semibold text-warm-800 mb-2">La carte du guide</h3>
      <p className="text-warm-400 text-sm mb-5">{spots.length} adresse{spots.length > 1 ? 's' : ''} à explorer</p>
      <div
        ref={mapRef}
        className="w-full rounded-3xl overflow-hidden border border-cream-200 shadow-sm"
        style={{ height: '420px' }}
      />
      <style>{`
        .wanderlust-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(45,32,24,0.12);
          border: 1px solid #ede0d4;
          padding: 0;
        }
        .wanderlust-popup .leaflet-popup-content {
          margin: 14px 16px;
        }
        .wanderlust-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          color: #7a6558 !important;
          border-color: #ede0d4 !important;
        }
      `}</style>
    </div>
  )
}
