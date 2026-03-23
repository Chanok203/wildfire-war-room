import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import unzipper from 'unzipper';

import prisma from '../lib/prisma';
import { removeMissionWorkspace } from '../utils/file.util';
import { config } from '../config';
import { HotspotType } from '@prisma/client';

export const listMission_GET = async (req: Request, res: Response) => {
    return res.render('mission/mission-list.html');
};

export const listMission_API_GET = async (req: Request, res: Response) => {
    try {
        const missions = await prisma.mission.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { hotspots: true } },
            },
        });
        return res.json({
            status: 'success',
            data: missions,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'ดึงข้อมูลล้มเหลว',
        });
    }
};

export const deleteMission_POST = async (req: Request, res: Response) => {
    const missionId = req.params.missionId as string;

    try {
        await prisma.hotspot.deleteMany({
            where: { missionId: missionId },
        });
        await prisma.mission.delete({
            where: { id: missionId },
        });
        removeMissionWorkspace(missionId);
        return res.redirect('/mission');
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                status: 'fail',
                data: { missionId: 'ไม่พบภารกิจที่ต้องการลบในระบบ' },
            });
        }

        console.error('Delete Mission Error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'เกิดข้อผิดพลาดในการลบข้อมูล',
        });
    }
};

export const deleteMission_API_DELETE = async (req: Request, res: Response) => {
    const missionId = req.params.missionId as string;

    try {
        await prisma.hotspot.deleteMany({
            where: { missionId: missionId },
        });
        await prisma.mission.delete({
            where: { id: missionId },
        });
        removeMissionWorkspace(missionId);
        return res.json({
            status: 'success',
            data: null,
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                status: 'fail',
                data: { missionId: 'ไม่พบภารกิจที่ต้องการลบในระบบ' },
            });
        }

        console.error('Delete Mission Error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'เกิดข้อผิดพลาดในการลบข้อมูล',
        });
    }
};

export const viewMission_GET = async (req: Request, res: Response) => {
    const missionId = req.params.missionId as string;

    try {
        const mission = await prisma.mission.findUnique({
            where: { id: missionId },
            include: {
                _count: { select: { hotspots: true } },
            },
        });
        if (!mission) {
            return res.status(404).json({
                status: 'fail',
                data: {
                    missionId: 'invalid missionId',
                },
            });
        }
        return res.render('mission/mission-view.html', { mission: mission, qgisUrl: config.qgisUrl, numHotspots: mission._count.hotspots });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'เกิดข้อผิดพลาด',
        });
    }
};

export const data_GET = async (req: Request, res: Response) => {
    const missionId = req.params.missionId as string;

    try {
        const mission = await prisma.mission.findUnique({
            where: { id: missionId },
            include: {
                hotspots: true,
            },
        });

        if (!mission) {
            return res.status(404).json({
                status: 'fail',
                data: {
                    missionId: 'Mission with this ID does not exist',
                },
            });
        }

        // ส่งข้อมูลกลับไปให้ Frontend
        return res.json({
            status: 'success',
            data: mission,
        });
    } catch (error) {
        console.error('Get Status Error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
};

export const uploadMission_API_POST = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }
    const zipFilePath = req.file.path; // path ที่เก็บไฟล์ .zip ชั่วคราว
    const missionUuid = path.parse(req.file.originalname).name; // ดึง UUID จากชื่อไฟล์
    const extractPath = path.join(config.missionsDir, missionUuid);

    try {
        if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true });
        }

        await fs
            .createReadStream(zipFilePath)
            .pipe(unzipper.Extract({ path: extractPath }))
            .promise();

        const inputDataPath = path.join(extractPath, 'input', 'config.json');

        let inputData: any = {};
        if (fs.existsSync(inputDataPath)) {
            const configData = JSON.parse(fs.readFileSync(inputDataPath, 'utf8'));
            const { meta_data } = configData;
            const { videoPath, ...userInput } = meta_data;
            inputData = userInput;
        }

        let hotspotsToSave: any[] = [];
        const resultPath = path.join(extractPath, 'output', 'result.json'); // หรือชื่อไฟล์ที่คุณตกลงกับ Edge ไว้
        if (fs.existsSync(resultPath)) {
            const results = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
            hotspotsToSave = results.map((item) => {
                let type: HotspotType = HotspotType.PRED_30;
                if (item.filename.includes('45min')) type = HotspotType.PRED_45;
                if (item.filename.includes('60min')) type = HotspotType.PRED_60;

                const feature = item.geojson.features[0];
                const coords = feature.geometry.coordinates[0][0];

                const avgLat = coords.reduce((sum: number, p: number[]) => sum + p[1], 0) / coords.length;
                const avgLng = coords.reduce((sum: number, p: number[]) => sum + p[0], 0) / coords.length;
                return {
                    missionId: missionUuid,
                    type: type,
                    geometry: feature.geometry,
                    latitude: avgLat,
                    longitude: avgLng,
                    confidence: 1.0,
                };
            });
        }

        const mission = await prisma.$transaction(async (tx) => {
            const mission = await tx.mission.upsert({
                where: { id: missionUuid },
                update: {
                    aiStatus: 'COMPLETED',
                    updatedAt: new Date(),
                },
                create: {
                    id: missionUuid,
                    name: inputData.missionName,
                    droneName: inputData.droneName,
                    latitude: parseFloat(inputData.latitude),
                    longitude: parseFloat(inputData.longitude),
                    aiStatus: 'COMPLETED',
                    inputData: inputData,
                },
            });
            await tx.hotspot.deleteMany({ where: { missionId: missionUuid } });
            await tx.hotspot.createMany({ data: hotspotsToSave });
            return mission;
        });

        if (fs.existsSync(zipFilePath)) fs.unlinkSync(zipFilePath);

        return res.status(201).json({
            status: 'success',
            data: { mission: mission },
        });
    } catch (error) {
        console.error('Processing Error:', error);

        if (fs.existsSync(zipFilePath)) fs.unlinkSync(zipFilePath);
        if (fs.existsSync(extractPath)) fs.rmSync(extractPath, { recursive: true, force: true });

        return res.status(500).json({ status: 'error', message: 'Extraction failed' });
    }
};
