import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prismaClientSingleton = () => {
    const url = (process.env.DATABASE_URL || '').trim();

    if (url.startsWith('prisma://') || url.startsWith('prisma+postgres://')) {
        // @ts-ignore
        return new PrismaClient({ datasources: { db: { url } } }).$extends(withAccelerate());
    }

    return new PrismaClient();
};

const globalForPrisma = global as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
