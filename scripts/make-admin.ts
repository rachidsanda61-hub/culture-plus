import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

async function makeAdmin(email: string) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { appRole: 'ADMIN' },
        });
        console.log(`✅ User ${user.email} is now an ADMIN.`);
    } catch (error) {
        console.error(`❌ Error promoting user ${email}:`, error);
    } finally {
        // Note: if using pooling or singleton, be careful with $disconnect
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: npx tsx scripts/make-admin.ts <email>');
} else {
    makeAdmin(email);
}
