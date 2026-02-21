'use server';

import { prisma } from '@/lib/prisma';

export async function pingPresence(userId: string) {
    if (!userId) return;
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isOnline: true,
                lastSeen: new Date()
            }
        });
    } catch (e) {
        console.error("Failed to ping presence", e);
    }
}

export async function setOffline(userId: string) {
    if (!userId) return;
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isOnline: false,
                lastSeen: new Date()
            }
        });
    } catch (e) {
        console.error("Failed to set offline", e);
    }
}
