const { qgisUrl: QGIS_SERVER_URL } = window.APP_CONFIG || {};

// ดึง Mission ID จาก URL Path
const pathSegments = window.location.pathname.split('/');
const missionId = pathSegments[pathSegments.indexOf('mission') + 1];

let map;

// 1. ฟังก์ชันสร้าง WMS URL ตามสถานะการเลือกใน Dropdown
function getQgisWmsUrl(id) {
    // ดึงค่าที่ถูกเลือกจาก Bootstrap Select
    const hotspotsSelected = $('#type-select').val() || [];
    const routesSelected = $('#patrol-select').val() || [];

    /**
     * กำหนดลำดับ Layer: 
     * ใน WMS ของ QGIS ตัวที่เขียนก่อนจะอยู่ "ล่างสุด" 
     * เราจึงเอา p60 (วงใหญ่สุด) ไว้ก่อน เพื่อให้ p30 (วงเล็กสุด/วิกฤต) ทับอยู่บนสุด
     */
    const hotspotsMapping = {
        'PRED_60': 'warroom_p60',
        'PRED_45': 'warroom_p45',
        'PRED_30': 'warroom_p30'
    };

    const routesMapping = {
        "patrol_walking_67_68": "patrol_walking_67_68",
        "patrol_motorcycle_67_68": "patrol_motorcycle_67_68",
        "patrol_car_67_68": "patrol_car_67_68",
    }

    // กรองเฉพาะ Layer ที่ User ติ๊กเลือก
    const hotspotsActiveLayers = ['PRED_60', 'PRED_45', 'PRED_30']
        .filter(key => hotspotsSelected.includes(key))
        .map(key => hotspotsMapping[key]);

    const routesActiveLayers = [
        "patrol_walking_67_68",
        "patrol_motorcycle_67_68",
        "patrol_car_67_68",
    ]
        .filter(key => routesSelected.includes(key))
        .map(key => routesMapping[key])


    // รวม Layer พื้นฐาน (แผนที่ฐาน) กับ Layer พยากรณ์
    const layers = ['map_offline_v2', ...hotspotsActiveLayers, ...routesActiveLayers].join(',');

    // สร้าง Filter แยกตามชื่อ Layer (รูปแบบ layer:filter;layer:filter)
    // ท่านี้ปลอดภัย ไม่ติด 403 Forbidden และประมวลผลเร็ว
    const filters = hotspotsActiveLayers
        .map(ln => `${ln}:"mission_id" = '${id}'`)
        .join(';');

    const url = `${QGIS_SERVER_URL}/ows?MAP=/data/mymap.qgs` +
        `&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap` +
        `&LAYERS=${layers}` +
        (filters ? `&FILTER=${filters}` : '') +
        `&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=TRUE`;

    return url;
}

// 2. จัดการ Event เมื่อหน้าจอโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    initMapShell();

    if (missionId) {
        loadMissionData();
    }

    // ดักฟังการเปลี่ยนค่าใน Dropdown
    $('#type-select').on('changed.bs.select', function () {
        if (!map) return;
        const source = map.getSource('qgis-source');

        if (source) {
            console.log("Updating Map Layers...");
            const newUrl = getQgisWmsUrl(missionId);
            // เติม Timestamp (&t=...) เพื่อป้องกันการติด Cache ของ Browser
            source.setTiles([newUrl + `&t=${Date.now()}`]);
        }
    });

    $('#patrol-select').on('changed.bs.select', function () {
        if (!map) return;
        const source = map.getSource('qgis-source');

        if (source) {
            console.log("Updating Map Layers...");
            const newUrl = getQgisWmsUrl(missionId);
            // เติม Timestamp (&t=...) เพื่อป้องกันการติด Cache ของ Browser
            source.setTiles([newUrl + `&t=${Date.now()}`]);
        }
    });
});

// 3. โหลดข้อมูล Metadata ของภารกิจจาก Backend
async function loadMissionData() {
    try {
        const res = await fetch(`/mission/${missionId}/data`);
        const jsend = await res.json();

        if (jsend.status === 'success') {
            const missionData = jsend.data;
            updateMapWithData(missionData);
        } else {
            throw new Error(jsend.message || 'โหลดข้อมูลล้มเหลว');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('ไม่สามารถโหลดข้อมูลภารกิจได้');
    }
}

// 4. ตั้งค่าเริ่มต้นของแผนที่ (Shell)
function initMapShell() {
    map = new maplibregl.Map({
        container: 'map',
        style: {
            'version': 8,
            'sources': {},
            'layers': [],
        },
        center: [100.213, 18.684],
        zoom: 14
    });
}

// 5. อัปเดตแผนที่เมื่อได้รับข้อมูลจริง
function updateMapWithData(data) {
    if (!map) return;

    // วาร์ปแผนที่ไปพิกัดโดรน
    map.jumpTo({
        center: [data.longitude, data.latitude],
        zoom: 15
    });

    const addQgisLayers = () => {
        if (map.getSource('qgis-source')) return;

        try {
            const wmsUrl = getQgisWmsUrl(data.id);

            map.addSource('qgis-source', {
                'type': 'raster',
                'tiles': [wmsUrl],
                'tileSize': 256
            });

            map.addLayer({
                'id': 'qgis-layer',
                'type': 'raster',
                'source': 'qgis-source',
                'paint': {
                    'raster-opacity': 0.8 // ปรับความจางเพื่อให้เห็นพื้นหลัง
                }
            });

            // ปักหมุดโดรนที่ตำแหน่งปัจจุบัน
            new maplibregl.Marker({
                element: getDrone(),
                rotationAlignment: 'map',
            })
                .setLngLat([data.longitude, data.latitude])
                .setPopup(new maplibregl.Popup({ offset: 25 })
                    .setHTML(`<b>${data.droneName}</b><br>Lat: ${data.latitude}<br>Lng: ${data.longitude}`))
                .addTo(map);

            console.log("QGIS Multi-layers added successfully!");
        } catch (e) {
            console.error("Error adding layers:", e);
        }
    };

    // ตรวจสอบว่าสไตล์โหลดเสร็จหรือยังก่อนแอด Source
    if (map.isStyleLoaded()) {
        addQgisLayers();
    } else {
        map.once('styledata', addQgisLayers);
    }
}

// 6. สร้าง Element สำหรับโดรน
function getDrone() {
    const droneEl = document.createElement('div');
    droneEl.className = 'drone-marker';
    droneEl.style.width = '50px';
    droneEl.style.height = '50px';
    droneEl.style.backgroundImage = 'url("/public/images/drone.svg")';
    droneEl.style.backgroundSize = 'contain';
    droneEl.style.backgroundRepeat = 'no-repeat';
    droneEl.style.backgroundPosition = 'center';
    droneEl.style.cursor = 'pointer';

    return droneEl;
}