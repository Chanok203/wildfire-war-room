import { PrismaClient } from '@prisma/client';
import { config } from '../config';

// 1. สร้างฟังก์ชัน Singleton เพื่อคืนค่า PrismaClient
const prismaClientSingleton = () => {
    return new PrismaClient({
        // คุณสามารถเปิด log ตรงนี้เพื่อดู SQL query ที่เกิดขึ้นใน Terminal ได้
        // log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};

// 2. กำหนด Type สำหรับ Global object เพื่อให้ TypeScript ไม่บ่นเรื่อง 'never' หรือ 'any'
declare global {
    var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// 3. เลือกใช้ Instance ที่มีอยู่แล้วใน Global หรือสร้างใหม่ถ้ายังไม่มี
export const prisma = global.prisma ?? prismaClientSingleton();

// 4. ในโหมด Development ให้เก็บ Instance ไว้ใน Global เพื่อไม่ให้สร้างใหม่ทุกครั้งที่เซฟโค้ด (Hot Reload)
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
