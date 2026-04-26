import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: API_BASE, timeout: 120000 })

export async function reverseGeocode(lat, lng) {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon: lng, format: 'json' },
      headers: { 'Accept-Language': 'en' },
      timeout: 8000,
    })
    return res.data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

export async function runOptimize(payload) {
  const res = await api.post('/optimize', payload)
  return res.data
}

export async function getResults(limit = 10) {
  const res = await api.get('/results', { params: { limit } })
  return res.data
}

export async function getHealth() {
  const res = await api.get('/health')
  return res.data
}

export default api
