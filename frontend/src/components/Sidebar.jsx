import React from 'react'

const s = {
  sidebar: {
    width: '340px', minWidth: '340px', height: '100vh',
    background: 'var(--surface)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', overflowY: 'auto',
    zIndex: 1000,
  },
  header: {
    padding: '20px 20px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'linear-gradient(135deg, #0a0e1a 0%, #111827 100%)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
  },
  logoIcon: {
    width: 36, height: 36,
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, flexShrink: 0,
  },
  title: { fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' },
  subtitle: { fontSize: 11, color: 'var(--muted)', marginTop: 2 },
  section: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border)',
  },
  sectionTitle: {
    fontSize: 10, fontWeight: 700, letterSpacing: '1.2px',
    textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10,
  },
  modeBtn: (active) => ({
    flex: 1, padding: '8px 6px', borderRadius: 6,
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'rgba(0,212,170,0.12)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--muted)',
    cursor: 'pointer', fontSize: 11, fontWeight: 600,
    transition: 'all 0.15s', letterSpacing: '0.3px',
  }),
  row: { display: 'flex', gap: 6 },
  label: { fontSize: 11, color: 'var(--muted)', marginBottom: 4, display: 'block' },
  input: {
    width: '100%', padding: '8px 10px', background: 'var(--surface2)',
    border: '1px solid var(--border)', borderRadius: 6,
    color: 'var(--text)', fontSize: 13, outline: 'none',
    fontFamily: 'var(--font-sans)',
  },
  nodeItem: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px',
    borderRadius: 6, marginBottom: 4, background: 'var(--surface2)',
    border: '1px solid var(--border)',
  },
  dot: (color) => ({
    width: 10, height: 10, borderRadius: '50%',
    background: color, flexShrink: 0,
  }),
  nodeName: { flex: 1, fontSize: 11, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge: (color) => ({
    fontSize: 9, padding: '2px 6px', borderRadius: 10,
    background: `${color}22`, color, fontWeight: 700, letterSpacing: '0.5px',
  }),
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--muted)', fontSize: 14, padding: '2px 4px',
    borderRadius: 4, transition: 'color 0.15s',
  },
  optimizeBtn: (loading) => ({
    width: '100%', padding: '12px', borderRadius: 8,
    background: loading
      ? 'var(--surface2)'
      : 'linear-gradient(135deg, var(--accent), var(--accent2))',
    border: 'none', color: loading ? 'var(--muted)' : '#0a0e1a',
    fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s', letterSpacing: '0.3px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }),
  clearBtn: {
    width: '100%', padding: '8px', borderRadius: 8,
    background: 'transparent', border: '1px solid var(--border)',
    color: 'var(--muted)', fontWeight: 600, fontSize: 12, cursor: 'pointer',
    marginTop: 8, transition: 'all 0.15s',
  },
  error: {
    margin: '0 16px 12px', padding: '10px 12px', borderRadius: 6,
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5', fontSize: 12,
  },
  hint: {
    padding: '10px 12px', borderRadius: 6,
    background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)',
    color: 'var(--accent)', fontSize: 12, margin: '0 0 8px',
  },
  stat: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '5px 0', borderBottom: '1px solid var(--border)',
  },
  statLabel: { fontSize: 11, color: 'var(--muted)' },
  statValue: { fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' },
}

export default function Sidebar({
  nodes, edges, k, setK, mode, setMode,
  pendingEdge, setPendingEdge,
  selectedNode, setSelectedNode,
  demandWeight, setDemandWeight,
  onSetDemand, onRemoveDemand, onRemoveNode, onRemoveEdge,
  onOptimize, onClear, loading, error, result
}) {
  const demandNodes = nodes.filter(n => n.isDemand)

  function getNodeColor(n) {
    if (result?.stations?.some(s => s.id === n.id)) return 'var(--node-green)'
    if (n.isDemand) return 'var(--node-red)'
    return 'var(--node-blue)'
  }

  const modeHints = {
    node:   '🖱️ Click map to add a node (auto-geocoded)',
    edge:   pendingEdge
              ? `🔗 Now click 2nd node to connect (from node ${pendingEdge})`
              : '🔗 Click 1st node on map or list',
    demand: selectedNode
              ? `⚡ Set weight for node ${selectedNode} below`
              : '⚡ Click a node marker on the map',
  }

  return (
    <div style={s.sidebar}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>⚡</div>
          <div>
            <div style={s.title}>EV Charging Optimizer</div>
            <div style={s.subtitle}>Graph-based station placement</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:16, marginTop:12 }}>
          {[['Nodes', nodes.length, 'var(--accent2)'],
            ['Edges', edges.length, 'var(--accent)'],
            ['Demand', demandNodes.length, 'var(--node-red)']].map(([label, val, color]) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:800, color, fontFamily:'var(--font-mono)' }}>{val}</div>
              <div style={{ fontSize:10, color:'var(--muted)', letterSpacing:'0.5px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mode selector */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Interaction Mode</div>
        <div style={s.row}>
          {[['node','➕ Node'],['edge','🔗 Edge'],['demand','⚡ Demand']].map(([m, label]) => (
            <button key={m} style={s.modeBtn(mode===m)}
              onClick={() => { setMode(m); setPendingEdge(null); setSelectedNode(null) }}>
              {label}
            </button>
          ))}
        </div>
        {modeHints[mode] && (
          <div style={{ ...s.hint, marginTop: 8 }}>{modeHints[mode]}</div>
        )}
        {mode === 'demand' && selectedNode && (
          <div style={{ marginTop:8 }}>
            <label style={s.label}>Weight for node {selectedNode}</label>
            <div style={s.row}>
              <input type="number" min="1" max="100" value={demandWeight}
                onChange={e => setDemandWeight(Number(e.target.value))}
                style={{ ...s.input, width:80 }} />
              <button style={{ ...s.modeBtn(true), flex:1 }}
                onClick={() => { onSetDemand(selectedNode, demandWeight); setSelectedNode(null) }}>
                Set ⚡
              </button>
              <button style={{ ...s.modeBtn(false), flex:1 }}
                onClick={() => { onRemoveDemand(selectedNode); setSelectedNode(null) }}>
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Station count k */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Optimization Config</div>
        <label style={s.label}>k — Number of Charging Stations</label>
        <input type="number" min="1" max={Math.max(1,nodes.length)}
          value={k} onChange={e => setK(Number(e.target.value))}
          style={s.input} />
      </div>

      {/* Nodes list */}
      <div style={{ ...s.section, flex:1, minHeight:0, overflowY:'auto' }}>
        <div style={s.sectionTitle}>Nodes ({nodes.length})</div>
        {nodes.length === 0 && (
          <div style={{ color:'var(--muted)', fontSize:12, textAlign:'center', padding:'16px 0' }}>
            Switch to Node mode, then click the map
          </div>
        )}
        {nodes.map(n => (
          <div key={n.id} style={{ ...s.nodeItem, border: selectedNode===n.id||pendingEdge===n.id
            ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
            <div style={s.dot(getNodeColor(n))} />
            <div style={s.nodeName} title={n.address}>
              <span style={{ color:'var(--muted)', marginRight:4, fontFamily:'var(--font-mono)' }}>#{n.id}</span>
              {n.address?.split(',')[0] || `${n.lat.toFixed(4)},${n.lng.toFixed(4)}`}
            </div>
            {n.isDemand && <span style={s.badge('var(--node-red)')}>W:{n.weight}</span>}
            {result?.stations?.some(st=>st.id===n.id) && <span style={s.badge('var(--node-green)')}>STN</span>}
            <button style={s.iconBtn} title="Remove node"
              onClick={() => onRemoveNode(n.id)}>✕</button>
          </div>
        ))}

        {/* Edges list */}
        {edges.length > 0 && (
          <>
            <div style={{ ...s.sectionTitle, marginTop:12 }}>Edges ({edges.length})</div>
            {edges.map((e,i) => (
              <div key={i} style={s.nodeItem}>
                <span style={{ color:'var(--muted)', fontSize:11 }}>
                  <span style={{ fontFamily:'var(--font-mono)' }}>#{e.from}</span>
                  {' ↔ '}
                  <span style={{ fontFamily:'var(--font-mono)' }}>#{e.to}</span>
                </span>
                <div style={{ flex:1 }} />
                <button style={s.iconBtn} onClick={() => onRemoveEdge(e.from, e.to)}>✕</button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Error */}
      {error && <div style={s.error}>⚠️ {error}</div>}

      {/* Actions */}
      <div style={{ padding:'14px 16px' }}>
        <button style={s.optimizeBtn(loading)} onClick={onOptimize} disabled={loading}>
          {loading
            ? <><span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</span> Optimizing…</>
            : '⚡ Run Optimization'}
        </button>
        <button style={s.clearBtn}
          onMouseEnter={e => { e.target.style.color='var(--danger)'; e.target.style.borderColor='var(--danger)' }}
          onMouseLeave={e => { e.target.style.color='var(--muted)'; e.target.style.borderColor='var(--border)' }}
          onClick={onClear}>
          🗑 Clear All
        </button>
      </div>
    </div>
  )
}
