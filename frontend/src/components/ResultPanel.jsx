import React, { useState } from 'react'

export default function ResultPanel({ result, nodes }) {
  const [open, setOpen] = useState(true)
  if (!result) return null

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 999,
      background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border)',
      maxHeight: open ? 280 : 48,
      transition: 'max-height 0.3s ease',
      overflow: 'hidden',
    }}>
      {/* Toggle bar */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 20px', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        <span style={{ fontSize: 14 }}>⚡</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)' }}>
          Optimization Results
        </span>
        <span style={{
          background: 'rgba(0,212,170,0.15)', color: 'var(--accent)',
          fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
        }}>
          Total Cost: {result.totalCost?.toFixed(4)} km·w
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ color: 'var(--muted)', fontSize: 16 }}>{open ? '▼' : '▲'}</span>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', gap: 0, overflowY: 'auto', maxHeight: 220 }}>
        {/* Stations */}
        <div style={{ flex: 1, padding: '12px 20px', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--muted)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>
            Charging Stations ({result.stations?.length})
          </div>
          {result.stations?.map(st => (
            <div key={st.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 10px', borderRadius: 6, marginBottom: 4,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--node-green)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--node-green)' }}>
                  Station #{st.id}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                  {st.address?.split(',')[0] || `${st.lat?.toFixed(4)}, ${st.lng?.toFixed(4)}`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Assignments */}
        <div style={{ flex: 2, padding: '12px 20px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--muted)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>
            Node → Station Assignments
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
            {result.assignments?.map(a => {
              const dNode = nodeMap[a.demandNodeId]
              return (
                <div key={a.demandNodeId} style={{
                  padding: '8px 10px', borderRadius: 6,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  fontSize: 11,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ color: 'var(--node-red)', fontWeight: 700 }}>Node #{a.demandNodeId}</span>
                    <span style={{ color: 'var(--muted)' }}>→</span>
                    <span style={{ color: 'var(--node-green)', fontWeight: 700 }}>Station #{a.stationNodeId}</span>
                  </div>
                  <div style={{ color: 'var(--muted)', display: 'flex', gap: 8 }}>
                    <span>dist: <b style={{ color: 'var(--accent2)', fontFamily: 'var(--font-mono)' }}>{a.distance?.toFixed(3)} km</b></span>
                    {dNode?.weight && <span>w: <b>{dNode.weight}</b></span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
