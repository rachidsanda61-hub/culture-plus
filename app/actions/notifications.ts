'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getNotifications(userId: string) {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return notifications;
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
    }
}

export async function markAsRead(notificationId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        return { success: false };
    }
}

export async function markAllAsRead(userId: string) {
    try {
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to mark all as read:', error);
        return { success: false };
    }
}

export async function deleteNotification(notificationId: string) {
    try {
        await prisma.notification.delete({
            where: { id: notificationId }
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to delete notification:', error);
        return { success: false };
    }
}

// Internal helper to create notifications from other actions
export async function createNotification(userId: string, data: {
    type: string;
    title: string;
    message: string;
    link?: string;
    image?: string;
}) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                ...data
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to create notification:', error);
        return { success: false };
    }
}
