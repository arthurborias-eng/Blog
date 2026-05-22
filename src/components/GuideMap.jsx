import { useEffect, useRef } from 'react'

const TYPE_LABELS = {
  food: 'Où manger', visit: 'À voir', experience: 'Expérience', story: 'Récit', tip: 'Conseil',
}
const TYPE_COLOR = {
  food: '#b5674d', visit: '#8a7560', experience: '#9e8c6a', story: '#a08070', tip: '#b09070',
}

function makeIcon(L, type) {
  const color = TYPE_COLOR[type] || '#b5674d'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/></filter>
      <path d="M14 1C8.48 1 4 5.48 4 11c0 8.5 10 24 10 24s10-15.5 10-24C24 5.48 19.52 1 14 1z"
        fill="${color}" filter="url(#s)"/>
      <circle cx="14" cy="11" r="5" fill="white" opacity="0.9"/>
    </svg>`
  return L.divIcon({ html: svg, className: '', iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -38] })
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
              <div style="font-size:10px;color:#b5674d;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:5px">
                ${TYPE_LABELS[sec.type] || sec.type}
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
