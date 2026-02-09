import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../lib/prisma';

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: { email: true, name: true, appRole: true }
        });
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    }
}

listUsers();
