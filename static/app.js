const map = L.map('map', { zoomControl: true }).setView([15.1597, 76.9133], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const busIcon = L.divIcon({
  className: '',
  html: '<div style="background:#2864e8;color:#fff;border:3px solid #fff;border-radius:12px;padding:5px 7px;box-shadow:0 2px 10px #7b8da8;font-size:18px">🚌</div>',
  iconSize: [42, 38],
  iconAnchor: [21, 19]
});
let busMarker = null;
let routeLine = null;
let stops = [];
let stopMarkers = [];

function renderStops(data) {
  stops = data;
  const coords = data.map(s => [s.lat, s.lng]);
  routeLine = L.polyline(coords, { color: '#2864e8', weight: 5, opacity: .8 }).addTo(map);
  stopMarkers = data.map((s, i) => {
    const marker = L.circleMarker([s.lat, s.lng], {
      radius: 7, color: '#e3a008', weight: 3, fillColor: '#fff', fillOpacity: 1
    }).addTo(map).bindPopup(`<strong>${s.name}</strong><br>Route stop ${i + 1}`);
    return marker;
  });
  document.getElementById('stopList').innerHTML = data.map((s, i) =>
    `<li id="stop-${i}"><span class="stop-marker"></span><span>${s.name}</span></li>`
  ).join('');
  map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
}

async function updateBus() {
  try {
    const response = await fetch('/api/bus');
    const bus = await response.json();
    const position = [bus.lat, bus.lng];
    if (!busMarker) busMarker = L.marker(position, { icon: busIcon }).addTo(map);
    else busMarker.setLatLng(position);
    busMarker.bindPopup(`<strong>${bus.bus_id}</strong><br>${bus.status}<br>Next stop: ${bus.next_stop}`);
    document.getElementById('busId').textContent = bus.bus_id;
    document.getElementById('eta').textContent = bus.eta_minutes;
    document.getElementById('distance').textContent = bus.distance_km.toFixed(2);
    document.getElementById('nextStop').textContent = bus.next_stop;
    document.getElementById('status').textContent = bus.status;
    document.getElementById('updatedAt').textContent = bus.updated_at;

    const nextIndex = stops.findIndex(s => s.name === bus.next_stop);
    document.querySelectorAll('.stop-list li').forEach((li, i) => li.classList.toggle('active', i === nextIndex));
  } catch (error) {
    document.getElementById('status').textContent = 'Connection issue';
    console.error('Could not load bus data', error);
  }
}

fetch('/api/stops')
  .then(response => response.json())
  .then(data => { renderStops(data); updateBus(); setInterval(updateBus, 2500); })
  .catch(error => console.error('Could not load route stops', error));
