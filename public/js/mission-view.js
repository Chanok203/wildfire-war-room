const QGIS_SERVER_URL = 'http://localhost:8000/ows';
const pathSegments = window.location.pathname.split('/');
const missionId = pathSegments[pathSegments.indexOf('mission') + 1];

document.addEventListener('DOMContentLoaded', () => {
    if (missionId) {
        loadMissionData();
    }
});

async function loadMissionData() {
    try {
        const res = await fetch(`/mission/${missionId}/data`);
        const jsend = await res.json();

        // 2. ตรวจสอบมาตรฐาน JSend
        if (jsend.status === 'success') {
            const missionData = jsend.data; // แกะข้อมูลจากก้อน data
            renderMap(missionData);
            updateUI(missionData);
        }
        else if (jsend.status === 'fail') {
            throw new Error(`ข้อมูลไม่ถูกต้อง: ${JSON.stringify(jsend.data)}`);
        }
        else {
            throw new Error(`Server Error: ${jsend.message}`);
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        alert('ไม่สามารถโหลดข้อมูลภารกิจได้');
    }
}

function renderMap(data) {
    // ใช้พิกัดจาก JSend data
    const centerPos = [data.latitude || 13.0, data.longitude || 100.0];

    const map = L.map('map').setView(centerPos, 16);

    // แผนที่ฐาน (Online OSM)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // 3. เชื่อมต่อ QGIS Server ผ่านพอร์ต 8000/ows
    const hotspotLayer = L.tileLayer.wms(QGIS_SERVER_URL, {
        layers: 'hotspots_spatial', // ชื่อ layer ใน .qgz
        format: 'image/png',
        transparent: true,
        version: '1.3.0',
        crs: L.CRS.EPSG4326,
        FILTER: `hotspots_spatial:"mission_id" = '${missionId}'`,
        map: '/data/home.qgz' // สำคัญ! ต้องระบุ path ไฟล์โปรเจกต์ใน Docker
    }).addTo(map);

    // เพิ่ม Marker ตำแหน่งโดรน/จุดศูนย์กลาง
    const droneIcon = L.icon({
        iconUrl: '/public/images/drone.svg', // เปลี่ยนเป็น Path รูปของคุณ
        iconSize: [40, 40],        // ขนาดของรูป [กว้าง, สูง]
        iconAnchor: [20, 20],      // จุดที่จะให้ปักลงบนพิกัด (กึ่งกลางรูปคือ [width/2, height/2])
        popupAnchor: [0, -20]      // จุดที่ Popup จะเด้งออกมา (สัมพันธ์กับ iconAnchor)
    });
    if (data.latitude && data.longitude) {

        L.marker([data.latitude, data.longitude], {
            icon: droneIcon
        }).addTo(map)
            .bindPopup(`${data.droneName}`).openPopup();
    }
}

function updateUI(data) {
    // อัปเดตตัวเลขหน้าเว็บ (สมมติว่ามี ID เหล่านี้ใน HTML)
    const countEl = document.getElementById('hotspot-count');
    if (countEl) countEl.innerText = data.hotspotCount || 0;
}