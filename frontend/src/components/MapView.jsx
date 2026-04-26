import React, { useEffect, useRef, useCallback } from 'react'
import { reverseGeocode } from '../utils/api.js'
import { nextId } from '../utils/geo.js'

// We load Leaflet directly (not react-leaflet) for full control
let L = null

function getL() {
  if (L) return L
  if (typeof window !== 'undefined' && window.L) {
    L = window.L
    return L
  }
  return null
}

// Custom marker SVGs
function blueMarkerSVG(id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <ellipse cx="14" cy="33" rx="6" ry="3" fill="rgba(0,0,0,0.3)"/>
    <path d="M14 0C7.4 0 2 5.4 2 12c0 9 12 24 12 24s12-15 12-24C26 5.4 20.6 0 14 0z" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
    <text x="14" y="15" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="monospace">${id}</text>
  </svg>`
}
function redMarkerSVG(id, weight) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <ellipse cx="16" cy="37" rx="7" ry="3" fill="rgba(0,0,0,0.3)"/>
    <path d="M16 0C8.3 0 2 6.3 2 14c0 10.5 14 26 14 26s14-15.5 14-26C30 6.3 23.7 0 16 0z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
    <text x="16" y="13" text-anchor="middle" fill="white" font-size="9" font-weight="bold" font-family="monospace">${id}</text>
    <text x="16" y="23" text-anchor="middle" fill="#fde68a" font-size="8" font-family="monospace">W:${weight}</text>
  </svg>`
}
function greenMarkerSVG(id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <ellipse cx="18" cy="41" rx="8" ry="3" fill="rgba(0,0,0,0.35)"/>
    <path d="M18 0C9.2 0 2 7.2 2 16c0 12 16 28 16 28s16-16 16-28C34 7.2 26.8 0 18 0z" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
    <text x="18" y="14" text-anchor="middle" fill="white" font-size="9" font-weight="bold" font-family="monospace">${id}</text>
    <text x="18" y="24" text-anchor="middle" fill="white" font-size="11">⚡</text>
  </svg>`
}

function makeIcon(svgStr, size) {
  const Leaf = getL()
  if (!Leaf) return null
  return Leaf.divIcon({
    html: svgStr,
    className: '',
    iconSize: size,
    iconAnchor: [size[0]/2, size[1]],
    popupAnchor: [0, -size[1]],
  })
}

export default function MapView({ nodes, edges, result, mode, pendingEdge, onMapClick, onNodeClick }) {
  const mapRef      = useRef(null)
  const leafletMap  = useRef(null)
  const layersRef   = useRef({ nodes: {}, edges: [], resultEdges: [] })
  const geocodingRef = useRef(false)

  // Initialize map
  useEffect(() => {
    if (leafletMap.current) return
    const Leaf = getL()
    if (!Leaf || !mapRef.current) return

    const map = Leaf.map(mapRef.current, {
      center: [30.3165, 78.0322], // Dehradun
      zoom: 13,
      zoomControl: true,
    })

    Leaf.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '© OpenStreetMap © CartoDB', maxZoom: 19 }
    ).addTo(map)

    map.on('click', async (e) => {
      if (mode === 'edge') return // handled by marker click
      if (geocodingRef.current) return
      geocodingRef.current = true
      const { lat, lng } = e.latlng
      const address = await reverseGeocode(lat, lng)
      const node = { id: nextId(), lat, lng, address, isDemand: false, weight: 0 }
      onMapClick(node)
      geocodingRef.current = false
    })

    leafletMap.current = map
  }, [])

  // Keep mode accessible in map click via ref
  const modeRef = useRef(mode)
  useEffect(() => { modeRef.current = mode }, [mode])
  const onMapClickRef = useRef(onMapClick)
  useEffect(() => { onMapClickRef.current = onMapClick }, [onMapClick])
  const onNodeClickRef = useRef(onNodeClick)
  useEffect(() => { onNodeClickRef.current = onNodeClick }, [onNodeClick])

  // Re-bind map click
  useEffect(() => {
    const map = leafletMap.current
    const Leaf = getL()
    if (!map || !Leaf) return
    map.off('click')
    map.on('click', async (e) => {
      if (modeRef.current === 'edge') return
      if (geocodingRef.current) return
      geocodingRef.current = true
      const { lat, lng } = e.latlng
      const address = await reverseGeocode(lat, lng)
      const node = { id: nextId(), lat, lng, address, isDemand: false, weight: 0 }
      onMapClickRef.current(node)
      geocodingRef.current = false
    })
  }, [])

  // Render nodes
  useEffect(() => {
    const map = leafletMap.current
    const Leaf = getL()
    if (!map || !Leaf) return

    const stationIds = new Set(result?.stations?.map(s => s.id) || [])

    // Remove old node markers
    Object.values(layersRef.current.nodes).forEach(m => m.remove())
    layersRef.current.nodes = {}

    nodes.forEach(n => {
      const isStation = stationIds.has(n.id)
      let icon
      if (isStation) {
        icon = makeIcon(greenMarkerSVG(n.id), [36, 44])
      } else if (n.isDemand) {
        icon = makeIcon(redMarkerSVG(n.id, n.weight), [32, 40])
      } else {
        icon = makeIcon(blueMarkerSVG(n.id), [28, 36])
      }

      const marker = Leaf.marker([n.lat, n.lng], { icon })
      marker.bindPopup(`
        <div style="min-width:180px">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px">
            ${isStation ? '⚡ Charging Station' : n.isDemand ? '🔴 Demand Node' : '🔵 Node'} #${n.id}
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">${n.address}</div>
          <div style="font-size:11px;font-family:monospace;color:#00d4aa">
            ${n.lat.toFixed(6)}, ${n.lng.toFixed(6)}
          </div>
          ${n.isDemand ? `<div style="font-size:11px;margin-top:4px">Weight: <b>${n.weight}</b></div>` : ''}
        </div>
      `)
      marker.on('click', (e) => {
        e.originalEvent.stopPropagation()
        onNodeClickRef.current(n.id)
      })
      marker.addTo(map)
      layersRef.current.nodes[n.id] = marker
    })
  }, [nodes, result])

  // Render edges
  useEffect(() => {
    const map = leafletMap.current
    const Leaf = getL()
    if (!map || !Leaf) return

    layersRef.current.edges.forEach(l => l.remove())
    layersRef.current.edges = []

    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

    edges.forEach(e => {
      const a = nodeMap[e.from], b = nodeMap[e.to]
      if (!a || !b) return
      const line = Leaf.polyline([[a.lat, a.lng],[b.lat, b.lng]], {
        color: '#334155', weight: 2, opacity: 0.7, dashArray: '5,4'
      }).addTo(map)
      layersRef.current.edges.push(line)
    })
  }, [nodes, edges])

  // Render result assignment lines
  useEffect(() => {
    const map = leafletMap.current
    const Leaf = getL()
    if (!map || !Leaf) return

    layersRef.current.resultEdges.forEach(l => l.remove())
    layersRef.current.resultEdges = []

    if (!result?.assignments) return

    result.assignments.forEach(a => {
      if (!a.demandLat || !a.stationLat) return
      const line = Leaf.polyline(
        [[a.demandLat, a.demandLng],[a.stationLat, a.stationLng]],
        { color: '#10b981', weight: 2.5, opacity: 0.85, dashArray: '8,5' }
      ).addTo(map)
      layersRef.current.resultEdges.push(line)
    })
  }, [result])

  const cursorStyle = mode === 'node' ? 'crosshair' : mode === 'edge' ? 'pointer' : 'default'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', cursor: cursorStyle }} />

      {/* Mode badge overlay */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 1000,
        background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(8px)',
        border: '1px solid var(--border)', borderRadius: 8,
        padding: '8px 14px', fontSize: 12, color: 'var(--muted)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ width:8, height:8, borderRadius:'50%',
          background: mode==='node' ? 'var(--accent2)' : mode==='edge' ? 'var(--accent)' : 'var(--node-red)',
          display:'inline-block' }} />
        {mode === 'node' && 'Click map to place node'}
        {mode === 'edge' && (pendingEdge ? `Connecting from #${pendingEdge}…` : 'Click two nodes to connect')}
        {mode === 'demand' && 'Click a node to set demand weight'}
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 32, right: 12, zIndex: 1000,
        background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(8px)',
        border: '1px solid var(--border)', borderRadius: 8,
        padding: '10px 14px', fontSize: 11,
      }}>
        {[
          ['var(--node-blue)', 'Node'],
          ['var(--node-red)',  'Demand Node'],
          ['var(--node-green)','Charging Station'],
        ].map(([color, label]) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:color }} />
            <span style={{ color:'var(--muted)' }}>{label}</span>
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:20, height:2, background:'#334155', borderRadius:1 }} />
          <span style={{ color:'var(--muted)' }}>Road Edge</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:20, height:2, background:'#10b981', borderRadius:1 }} />
          <span style={{ color:'var(--muted)' }}>Assignment</span>
        </div>
      </div>
    </div>
  )
}
