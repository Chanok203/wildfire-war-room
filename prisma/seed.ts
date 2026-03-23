import { PrismaClient, AIStatus, PushStatus, HotspotType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const missionId = 'seed-mission-001';
    const lat = 18.684905;
    const lng = 100.213579;

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
            latitude: lat,
            longitude: lng,
            inputData: { info: 'Initial seed for QGIS Server' },
        },
    });

    console.log(`✅ Created/Found Mission: ${initialMission.id}`);

    // 2. ข้อมูล Hotspots ตั้งต้น 3 ระดับ
    const hotspotSeeds = [
        { type: HotspotType.PRED_30, conf: 30, isPoly: false },
        { type: HotspotType.PRED_45, conf: 45, isPoly: false },
        { type: HotspotType.PRED_60, conf: 60, isPoly: false },
        { type: HotspotType.PRED_30, conf: 100, isPoly: true }, // สำหรับ layer hotspots_polygons_spatial
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
                          // สร้าง Polygon เล็กๆ รอบจุดพิกัด (มี 3 แกน [lng, lat, alt])
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
                          coordinates: [lng, lat, 0], // [lng, lat, alt] สำหรับ GeometryZ
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
