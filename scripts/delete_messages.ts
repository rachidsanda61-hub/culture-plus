import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// @ts-ignore
const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL }).$extends(withAccelerate());

async function main() {
    await prisma.message.deleteMany({});
    console.log("Deleted all messages");
}

main().catch(console.error).finally(() => prisma.$disconnect());
