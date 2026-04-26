import L from 'leaflet';

// Fix default marker icon path issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function svgIcon(svgContent, size = 28) {
  return L.divIcon({
    html: svgContent,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    className: '',
  });
}

export function nodeIcon() {
  return svgIcon(`
    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="9" fill="#4d8af0" stroke="#0a2a6e" stroke-width="2.5"/>
      <circle cx="14" cy="14" r="4" fill="#c8d8ff"/>
    </svg>`, 28);
}

export function demandIcon(weight = 5) {
  const r = Math.max(10, Math.min(20, 8 + weight * 1.2));
  const size = r * 2 + 4;
  return svgIcon(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="#ff3d57" stroke="#7a0000" stroke-width="2"/>
      <text x="${size/2}" y="${size/2+4}" text-anchor="middle" fill="white"
            font-size="9" font-family="Space Mono,monospace" font-weight="700">${weight}</text>
    </svg>`, size);
}

export function stationIcon() {
  return svgIcon(`
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="14" fill="#00e676" stroke="#004d2a" stroke-width="2.5"/>
      <text x="18" y="23" text-anchor="middle" fill="#003d1f"
            font-size="16" font-family="Arial" font-weight="900">⚡</text>
    </svg>`, 36);
}
