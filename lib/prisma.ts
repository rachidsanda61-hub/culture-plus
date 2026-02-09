import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const prismaClientSingleton = () => {
    const url = (process.env.DATABASE_URL || '').trim();

    // 1. Check for Accelerate
    const isAccelerate = url.startsWith('prisma://') || url.startsWith('prisma+postgres://');

    if (isAccelerate) {
        console.log('[PRISMA] Strategy: Accelerate');
        return new PrismaClient({
            // @ts-ignore
            accelerateUrl: url,
            log: ['error', 'warn'],
        } as any).$extends(withAccelerate());
    }

    // 2. Check for Standard Connection (Postgres)
    if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
        console.log('[PRISMA] Strategy: PG Adapter (Direct)');
        const pool = new Pool({ connectionString: url });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({
            // @ts-ignore
            adapter,
            log: ['error', 'warn'],
        } as any);
    }

    // 3. Fallback to standard initialization (reads from env if available)
    console.log('[PRISMA] Strategy: Default Fallback');
    return new PrismaClient({
        log: ['error', 'warn']
    });
};

const globalForPrisma = global as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
