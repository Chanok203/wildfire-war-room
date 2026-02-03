import fs from 'fs';
import path from 'path';
import { config } from '../config';


export const removeMissionWorkspace = (missionId: string): void => {
    // อ้างอิง path เดียวกันกับตอนสร้าง
    const folderPath = path.join(config.missionsDir, missionId);

    try {
        if (fs.existsSync(folderPath)) {
            // ใช้ { recursive: true } เพื่อลบโฟลเดอร์ย่อย (input, output) และไฟล์ข้างในทั้งหมด
            // { force: true } เพื่อไม่ให้พ่น Error ถ้าโฟลเดอร์ไม่มีอยู่จริง
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log(`[Workspace] Removed folder for mission: ${missionId}`);
        } else {
            console.warn(`[Workspace] Folder not found: ${folderPath}`);
        }
    } catch (error) {
        console.error(`[Workspace] Error removing folder for mission ${missionId}:`, error);
        throw error; // ส่งต่อ error ให้ Controller จัดการต่อ
    }
};
