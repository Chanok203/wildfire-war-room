import { PrismaClient, AIStatus, PushStatus, HotspotType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const missionId = 'seed-mission-001';

    // 1. สร้าง Mission ตั้งต้น (ต้องมีก่อนเพราะ Hotspot มี Relation กับ Mission)
    const initialMission = await prisma.mission.upsert({
        where: { id: missionId },
        update: {},
        create: {
            id: missionId,
            name: 'Initial System Check',
            droneName: 'System-Virtual-Drone',
            aiStatus: AIStatus.COMPLETED,
            pushStatus: PushStatus.PUSHED,
            latitude: 0,
            longitude: 0,
            inputData: { info: 'Initial seed for QGIS Server' },
        },
    });

    console.log(`✅ Created/Found Mission: ${initialMission.id}`);

    // 2. ข้อมูล Hotspots ตั้งต้น 3 ระดับ
    const hotspotSeeds = [
        { type: HotspotType.PRED_30, conf: 30 },
        { type: HotspotType.PRED_45, conf: 45 },
        { type: HotspotType.PRED_60, conf: 60 },
    ];

    for (const seed of hotspotSeeds) {
        // ใช้ upsert หรือล้างข้อมูลเก่าก่อนก็ได้ แต่ในที่นี้ใช้ create
        // เพื่อให้ QGIS Server เห็น Data แน่นอน
        await prisma.hotspot.create({
            data: {
                missionId: missionId,
                type: seed.type,
                latitude: 0,
                longitude: 0,
                confidence: seed.conf,
                // สำคัญมาก: ใส่ GeoJSON ให้ตรงกับที่ View ใน SQL ต้องการ
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0],
                },
            },
        });
    }

    console.log('✅ Seeded 3 Hotspots (30, 45, 60) for QGIS Server successfully!');

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
