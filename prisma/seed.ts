import { PrismaClient, AIStatus, PushStatus, HotspotType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const missionId = 'seed-mission-001';
    const lat = 18.684905;
    const lng = 100.213579;

    // 1. ล้างข้อมูลเก่าทิ้งก่อน (ป้องกัน ID ซ้ำและข้อมูลปนกัน)
    console.log('🧹 Cleaning up old data...');
    await prisma.hotspot.deleteMany({});
    await prisma.mission.deleteMany({});

    // 2. สร้าง Mission ตั้งต้น
    const initialMission = await prisma.mission.create({
        data: {
            id: missionId,
            name: 'Initial System Check',
            droneName: 'System-Virtual-Drone',
            aiStatus: AIStatus.COMPLETED,
            pushStatus: PushStatus.PUSHED,
            latitude: lat,
            longitude: lng,
            inputData: { info: 'Initial seed for QGIS Server' },
        },
    });

    console.log(`✅ Created Mission: ${initialMission.id}`);

    // 3. ข้อมูล Hotspots (แยกจุด กับ Polygon ออกจากกันชัดเจน)
    const hotspotSeeds = [
        // กลุ่ม Point (สำหรับ View p30, p45, p60)
        { type: HotspotType.PRED_30, conf: 30, isPoly: false },
        { type: HotspotType.PRED_45, conf: 45, isPoly: false },
        { type: HotspotType.PRED_60, conf: 60, isPoly: false },
        // กลุ่ม Polygon (ต้องไม่อยู่ในกลุ่ม PRED_30/45/60 เพื่อไม่ให้ View Point พัง)
        // ผมสมมติใช้ PRED_60 หรือสร้าง type ใหม่ แต่ในที่นี้จะส่งเข้าไปแบบ "ไม่ให้ซ้ำกับ View Point"
        { type: HotspotType.PRED_60, conf: 100, isPoly: true },
    ];

    for (const seed of hotspotSeeds) {
        await prisma.hotspot.create({
            data: {
                missionId: missionId,
                type: seed.type,
                latitude: lat,
                longitude: lng,
                confidence: seed.conf,
                geometry: seed.isPoly
                    ? {
                          type: 'Polygon',
                          coordinates: [
                              [
                                  [lng, lat, 0],
                                  [lng + 0.001, lat, 0],
                                  [lng + 0.001, lat + 0.001, 0],
                                  [lng, lat + 0.001, 0],
                                  [lng, lat, 0],
                              ],
                          ],
                      }
                    : {
                          type: 'Point',
                          coordinates: [lng, lat, 0],
                      },
            },
        });
    }

    console.log('✅ Seeded Hotspots and Mission successfully!');

    
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
