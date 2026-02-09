'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getConversations(userId: string) {
    try {
        // Fetch all messages involving the user
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: { id: true, name: true, image: true }
                },
                receiver: {
                    select: { id: true, name: true, image: true }
                }
            }
        });

        // Group into conversations
        const conversationsMap = new Map();

        messages.forEach((msg: any) => {
            const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!conversationsMap.has(partnerId)) {
                conversationsMap.set(partnerId, {
                    partnerId,
                    messages: []
                });
            }
            conversationsMap.get(partnerId).messages.unshift(msg); // Add to end (since we fetched desc and group as asc)
        });

        return Array.from(conversationsMap.values());
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return [];
    }
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
    try {
        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content
            }
        });
        revalidatePath('/messages');
        return message;
    } catch (error) {
        console.error('Failed to send message:', error);
        throw new Error('Failed to send message');
    }
}

export async function markMessagesAsRead(userId: string, partnerId: string) {
    try {
        await prisma.message.updateMany({
            where: {
                senderId: partnerId,
                receiverId: userId,
                read: false
            },
            data: { read: true }
        });
        revalidatePath('/messages');
    } catch (error) {
        console.error('Failed to mark as read:', error);
    }
}
