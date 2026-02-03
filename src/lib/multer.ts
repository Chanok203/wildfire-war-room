import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.missionsDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const fileFilter = (req: any, file: any, cb: any) => {
    // ตรวจสอบนามสกุลไฟล์อีกชั้นเพื่อความปลอดภัย
    const isZip = path.extname(file.originalname).toLowerCase() === '.zip';
    if (isZip) {
        cb(null, true);
    } else {
        cb(new Error('Only .zip files are allowed!'), false);
    }
};

export const uploadZip = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 }, // ขยายเป็น 500MB เผื่อโฟลเดอร์ mission ใหญ่
});
