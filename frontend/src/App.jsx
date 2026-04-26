import React, { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import MapView from './components/MapView.jsx'
import ResultPanel from './components/ResultPanel.jsx'
import { runOptimize } from './utils/api.js'

export default function App() {
  const [nodes, setNodes]           = useState([])
  const [edges, setEdges]           = useState([])
  const [k, setK]                   = useState(2)
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [pendingEdge, setPendingEdge] = useState(null) // first node selected for edge
  const [mode, setMode]             = useState('node') // 'node' | 'edge' | 'demand'
  const [selectedNode, setSelectedNode] = useState(null)
  const [demandWeight, setDemandWeight] = useState(5)

  // Add node from map click (already geocoded)
  const addNode = useCallback((node) => {
    setNodes(prev => [...prev, node])
  }, [])

  // Toggle demand on a node
  const setDemand = useCallback((nodeId, weight) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, isDemand: true, weight } : n
    ))
  }, [])

  const removeDemand = useCallback((nodeId) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, isDemand: false, weight: 0 } : n
    ))
  }, [])

  // Add edge between two nodes
  const addEdge = useCallback((from, to) => {
    const exists = edges.some(
      e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    )
    if (!exists && from !== to) {
      setEdges(prev => [...prev, { from, to }])
    }
  }, [edges])

  const removeNode = useCallback((nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId))
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId))
  }, [])

  const removeEdge = useCallback((from, to) => {
    setEdges(prev => prev.filter(e => !(e.from === from && e.to === to)))
  }, [])

  const handleMapClick = useCallback((node) => {
    if (mode === 'node') {
      addNode(node)
    } else if (mode === 'edge') {
      if (!pendingEdge) {
        setPendingEdge(node.id)
      } else {
        addEdge(pendingEdge, node.id)
        setPendingEdge(null)
      }
    }
  }, [mode, pendingEdge, addNode, addEdge])

  const handleNodeClick = useCallback((nodeId) => {
    if (mode === 'edge') {
      if (!pendingEdge) {
        setPendingEdge(nodeId)
      } else {
        addEdge(pendingEdge, nodeId)
        setPendingEdge(null)
      }
    } else if (mode === 'demand') {
      setSelectedNode(nodeId)
    }
  }, [mode, pendingEdge, addEdge])

  const optimize = async () => {
    if (nodes.length < 2) { setError('Add at least 2 nodes'); return }
    const demands = nodes.filter(n => n.isDemand)
    if (demands.length === 0) { setError('Mark at least one demand node'); return }
    if (k < 1) { setError('k must be ≥ 1'); return }

    setError(null)
    setLoading(true)
    setResult(null)
    try {
      const payload = {
        nodes: nodes.map(n => ({
          id: n.id, lat: n.lat, lng: n.lng,
          address: n.address, isDemand: n.isDemand, weight: n.weight
        })),
        edges: edges.map(e => ({ from: e.from, to: e.to })),
        k
      }
      const res = await runOptimize(payload)
      setResult(res)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Optimization failed')
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setNodes([]); setEdges([]); setResult(null)
    setError(null); setPendingEdge(null); setSelectedNode(null)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar
        nodes={nodes}
        edges={edges}
        k={k} setK={setK}
        mode={mode} setMode={setMode}
        pendingEdge={pendingEdge} setPendingEdge={setPendingEdge}
        selectedNode={selectedNode} setSelectedNode={setSelectedNode}
        demandWeight={demandWeight} setDemandWeight={setDemandWeight}
        onSetDemand={setDemand}
        onRemoveDemand={removeDemand}
        onRemoveNode={removeNode}
        onRemoveEdge={removeEdge}
        onOptimize={optimize}
        onClear={clearAll}
        loading={loading}
        error={error}
        result={result}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView
          nodes={nodes}
          edges={edges}
          result={result}
          mode={mode}
          pendingEdge={pendingEdge}
          onMapClick={handleMapClick}
          onNodeClick={handleNodeClick}
        />
        {result && <ResultPanel result={result} nodes={nodes} />}
      </div>
    </div>
  )
}
