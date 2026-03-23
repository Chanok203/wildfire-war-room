import { PrismaClient, AIStatus, PushStatus, HotspotType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. นำข้อมูลจากไฟล์ result.json มาใส่ในตัวแปร (ผมย่อพิกัดบางส่วนเพื่อให้โค้ดไม่อ่านยาก)
    const results = [
        {
            filename: 'front_30min.geojson',
            geojson: {
                features: [
                    {
                        geometry: {
                            type: 'MultiPolygon',
                            coordinates: [
                                [
                                    [
                                        [100.2135, 18.68531, 0],
                                        [100.21343, 18.68525, 0],
                                        [100.21334, 18.68518, 0],
                                        [100.21328, 18.68508, 0],
                                        [100.2135, 18.68531, 0],
                                    ],
                                ],
                            ],
                        },
                    },
                ],
            },
        },
        {
            filename: 'front_45min.geojson',
            geojson: {
                features: [
                    {
                        geometry: {
                            type: 'MultiPolygon',
                            coordinates: [
                                [
                                    [
                                        [100.2135, 18.68546, 0],
                                        [100.21342, 18.68542, 0],
                                        [100.21334, 18.68535, 0],
                                        [100.2135, 18.68546, 0],
                                    ],
                                ],
                            ],
                        },
                    },
                ],
            },
        },
        {
            filename: 'front_60min.geojson',
            geojson: {
                features: [
                    {
                        geometry: {
                            type: 'MultiPolygon',
                            coordinates: [
                                [
                                    [
                                        [100.21344, 18.68558, 0],
                                        [100.21333, 18.68555, 0],
                                        [100.21323, 18.68548, 0],
                                        [100.21344, 18.68558, 0],
                                    ],
                                ],
                            ],
                        },
                    },
                ],
            },
        },
    ];

    const missionId = 'mission_be1a78a7-ba45-40e3-ae4d-36eb7d7fac03'; // ID ปัจจุบันของคุณ
    await prisma.mission.upsert({
        where: { id: missionId },
        update: {}, // ไม่ต้องแก้อะไรถ้ามีอยู่แล้ว
        create: {
            id: missionId,
            name: 'Test Mission from Result JSON',
            droneName: 'Drone-001',
            latitude: 18.685, // พิกัดคร่าวๆ ของจังหวัดแพร่
            longitude: 100.213,
            aiStatus: 'COMPLETED',
            pushStatus: 'PENDING',
        },
    });

    // 2. แปลงข้อมูลโดยใช้ Logic จาก saveResultsToDb
    const hotspotsToSave = results.map((item) => {
        let type: HotspotType = HotspotType.PRED_30;
        if (item.filename.includes('45min')) type = HotspotType.PRED_45;
        if (item.filename.includes('60min')) type = HotspotType.PRED_60;

        const feature = item.geojson.features[0];

        // สำหรับ MultiPolygon พิกัดจะอยู่ที่ [0][0] เพื่อเข้าถึง Polygon แรก และ Ring แรก
        const coords = feature.geometry.coordinates[0][0];

        // คำนวณค่าเฉลี่ยพิกัด (Logic ของคุณ)
        const avgLat = coords.reduce((sum: number, p: number[]) => sum + p[1], 0) / coords.length;
        const avgLng = coords.reduce((sum: number, p: number[]) => sum + p[0], 0) / coords.length;

        return {
            missionId: missionId,
            type: type,
            geometry: feature.geometry as any,
            latitude: avgLat,
            longitude: avgLng,
            confidence: 1.0,
        };
    });

    console.log(`🧹 Cleaning hotspots for mission: ${missionId}`);
    await prisma.hotspot.deleteMany({ where: { missionId: missionId } });

    console.log('🚀 Seeding data from real result.json...');
    await prisma.hotspot.createMany({ data: hotspotsToSave });

    console.log('✅ Done! Check your map now.');

    await seedUser();
}

async function seedUser() {
    const username = 'chanok';
    const passwordHash = '$2b$10$fgKEbr.u96aBxiWJBiYemev9PoVCDQuBcahZ8jEiKDhAsdFQgW1wW';
    try {
        const user = await prisma.user.upsert({
            where: { username },
            update: {},
            create: {
                username,
                passwordHash,
            },
        });
        console.log(user);
    } catch (error) {
        console.log(error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
