import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const prismaClientSingleton = () => {
    const url = (process.env.DATABASE_URL || '').trim();

    if (url.startsWith('prisma://') || url.startsWith('prisma+postgres://')) {
        // @ts-ignore - Prisma 7 specific constructor
        return new PrismaClient({ accelerateUrl: url }).$extends(withAccelerate());
    }

    const pool = new pg.Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};

const globalForPrisma = global as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
