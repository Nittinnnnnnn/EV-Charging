// Sample graph data for Dehradun city
export const SAMPLE_DATA = {
  nodes: [
    { id: 1, lat: 30.3165, lng: 78.0322, address: 'Paltan Bazaar, Dehradun', isDemand: false, weight: 0 },
    { id: 2, lat: 30.3255, lng: 78.0437, address: 'ISBT Dehradun, Haridwar Road', isDemand: true,  weight: 8 },
    { id: 3, lat: 30.3089, lng: 78.0534, address: 'Rispana Bridge, Dehradun',   isDemand: false, weight: 0 },
    { id: 4, lat: 30.3398, lng: 78.0643, address: 'Rajpur Road, Dehradun',      isDemand: true,  weight: 5 },
    { id: 5, lat: 30.3278, lng: 78.0167, address: 'Prem Nagar, Dehradun',       isDemand: true,  weight: 6 },
    { id: 6, lat: 30.3013, lng: 78.0651, address: 'IIT Entrance Road, Dehradun',isDemand: false, weight: 0 },
    { id: 7, lat: 30.3567, lng: 78.0498, address: 'Forest Research Institute',  isDemand: true,  weight: 9 },
  ],
  edges: [
    { from: 1, to: 2, weight: null },
    { from: 1, to: 5, weight: null },
    { from: 2, to: 3, weight: null },
    { from: 2, to: 4, weight: null },
    { from: 3, to: 6, weight: null },
    { from: 4, to: 7, weight: null },
    { from: 5, to: 1, weight: null },
    { from: 6, to: 7, weight: null },
  ],
  k: 2,
};
