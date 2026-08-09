let route_line = null;

export function init_map() {
  // TODO: สร้าง L.map(...), เพิ่ม tile layer
  const map = L.map('map').setView([13.964962, 100.586651], 20);  // พิกัด: RSU
  L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; RSU'
  }).addTo(map);
  return map;
}

export function add_markers(map, lat, lng, node_name = null, center = false) {
  const marker = L.marker([lat, lng]).addTo(map);

  if (node_name !== null) {
    marker.bindPopup(node_name);
  }

  // จัดการการตีความ truthy/falsy
  if (node_name !== null && center !== false) {
    map.flyTo([lat, lng], 19);
  }

  return marker;
}

export function draw_route(map, coords, fit = false) {
  // แปลง node เป็นรูปแบบที่ Leaflet ใช้
  const latlngs = coords.map(node => [
    node.lat,
    node.lng
  ]);

  // ถ้ามีเส้นเก่าอยู่ ลบทิ้งก่อน
  if (route_line) {
    map.removeLayer(route_line);
  }

  // สร้างเส้นใหม่
  route_line = L.polyline(latlngs, {
    color: "red",
    weight: 5,
    opacity: 0.8
  }).addTo(map);

  // ปรับมุมมองให้เห็นเส้นทางทั้งหมด
  if (fit) {
    const center = map.getCenter();
    const zoom = map.getZoom();
    map.fitBounds(route_line.getBounds());
    map.once("moveend", () => {
      setTimeout(() => {
        map.setView(center, zoom);
      }, 1500);
    });
  }

  return route_line;
}