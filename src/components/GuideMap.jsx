import { useEffect, useRef } from 'react'
import L from 'leaflet'

const TYPE_LABELS = {
  food: 'Où manger', visit: 'À voir', experience: 'Expérience', story: 'Récit', tip: 'Conseil',
}
const TYPE_COLOR = {
  food: '#b5674d', visit: '#8a7560', experience: '#9e8c6a', story: '#a08070', tip: '#b09070',
}

function makeIcon(type) {
  const color = TYPE_COLOR[type] || '#b5674d'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="rgba(0,0,0,0.2)"/></filter>
    <path d="M14 1C8.48 1 4 5.48 4 11c0 8.5 10 24 10 24s10-15.5 10-24C24 5.48 19.52 1 14 1z"
      fill="${color}" filter="url(#sh)"/>
    <circle cx="14" cy="11" r="5" fill="white" opacity="0.9"/>
  </svg>`
  return L.divIcon({ html: svg, className: '', iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -38] })
}

export default function GuideMap({ sections }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)

  const spots = sections.filter(s => s.address?.trim())

  useEffect(() => {
    if (!spots.length || !containerRef.current || mapRef.current) return

    // Fix missing icon issue
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({ iconUrl: '', iconRetinaUrl: '', shadowUrl: '' })

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
    })
    mapRef.current = map

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // CartoDB Voyager — warm editorial style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // Default center while geocoding
    map.setView([48.85, 2.35], 12)

    const allLatLngs = []

    spots.forEach(async (sec) => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(sec.address)}`,
          { headers: { 'Accept-Language': 'fr' } }
        )
        const data = await res.json()
        if (!data[0]) return

        const ll = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
        allLatLngs.push(ll)

        L.marker(ll, { icon: makeIcon(sec.type) })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:Inter,sans-serif;min-width:160px;padding:2px 0">
              <div style="font-size:10px;color:#b5674d;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px">${TYPE_LABELS[sec.type] || sec.type}</div>
              <div style="font-size:14px;font-weight:700;color:#2d2018;margin-bottom:3px">${sec.title}</div>
              <div style="font-size:11px;color:#7a6558">${sec.address}</div>
            </div>`,
            { className: 'wl-popup' }
          )

        if (allLatLngs.length === 1) map.setView(ll, 15)
        else map.fitBounds(allLatLngs, { padding: [50, 50] })
      } catch (e) {
        console.warn('Geocode error', e)
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  if (!spots.length) return null

  return (
    <div className="mb-16">
      <h3 className="font-serif text-2xl font-semibold text-warm-800 mb-1">La carte du guide</h3>
      <p className="text-warm-400 text-sm mb-5">{spots.length} adresse{spots.length > 1 ? 's' : ''} à explorer</p>

      <div
        ref={containerRef}
        className="w-full rounded-3xl overflow-hidden border border-cream-200 shadow-sm"
        style={{ height: 420 }}
      />

      <style>{`
        .wl-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(45,32,24,.10);
          border: 1px solid #ede0d4;
          padding: 0;
        }
        .wl-popup .leaflet-popup-content { margin: 12px 14px; }
        .wl-popup .leaflet-popup-tip { background: white; }
        .leaflet-control-zoom { border: 1px solid #ede0d4 !important; border-radius: 10px !important; overflow: hidden; }
        .leaflet-control-zoom a { color: #7a6558 !important; border-color: #ede0d4 !important; }
        .leaflet-control-attribution { font-size: 10px !important; background: rgba(250,247,244,.8) !important; }
      `}</style>
    </div>
  )
}
