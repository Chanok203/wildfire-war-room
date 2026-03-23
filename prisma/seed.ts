import { PrismaClient, AIStatus, PushStatus, HotspotType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const missionId = 'seed-mission-001';
    const lat = 18.684905;
    const lng = 100.213579;

    // 1. ล้างข้อมูลเก่า (ลำดับสำคัญ: ลบ Hotspot ก่อน Mission)
    console.log('🧹 Cleaning up old data...');
    await prisma.hotspot.deleteMany({});
    await prisma.mission.deleteMany({});
    // await prisma.user.deleteMany({}); // เปิดใช้ถ้าต้องการล้าง User ด้วย

    // 2. สร้าง Mission ตั้งต้นในพิกัดจังหวัดแพร่
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

    // 3. ข้อมูล Hotspots (ผสมทั้ง Point และ MultiPolygon)
    const hotspotSeeds = [
        { type: HotspotType.PRED_30, conf: 30, isMultiPoly: false },
        { type: HotspotType.PRED_45, conf: 45, isMultiPoly: false },
        { type: HotspotType.PRED_60, conf: 60, isMultiPoly: false },
        // ตัวนี้เป็น MultiPolygon เพื่อทดสอบว่า Migration ใหม่เรารับมือไหวไหม
        { type: HotspotType.PRED_60, conf: 95, isMultiPoly: true },
    ];

    for (const seed of hotspotSeeds) {
        await prisma.hotspot.create({
            data: {
                missionId: missionId,
                type: seed.type,
                latitude: lat,
                longitude: lng,
                confidence: seed.conf,
                geometry: seed.isMultiPoly
                    ? {
                          type: 'MultiPolygon',
                          // MultiPolygon ต้องมี Array ซ้อนกัน 4 ชั้น [ [ [ [lng, lat, alt], ... ] ] ]
                          coordinates: [
                              [
                                  [
                                      [lng, lat, 0],
                                      [lng + 0.001, lat, 0],
                                      [lng + 0.001, lat + 0.001, 0],
                                      [lng, lat + 0.001, 0],
                                      [lng, lat, 0],
                                  ],
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

    console.log('🚀 Seed process completed at Phrae coordinates!');
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
