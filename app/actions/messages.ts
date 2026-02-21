'use server';

import { prisma } from '@/lib/prisma';

export async function getConversations(userId: string) {
    try {
        const participations = await prisma.conversationParticipant.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        participants: {
                            where: { userId: { not: userId } },
                            include: { user: { select: { id: true, name: true, image: true, isOnline: true, lastSeen: true } } }
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        }
                    }
                }
            }
        });

        const conversations = await Promise.all(participations.map(async (p: any) => {
            const partnerParam = p.conversation.participants[0];
            const partnerInfo = partnerParam?.user;
            const lastMessage = p.conversation.messages[0] || null;

            const unreadCount = partnerParam ? await prisma.message.count({
                where: {
                    conversationId: p.conversation.id,
                    senderId: partnerParam.userId,
                    isSeen: false
                }
            }) : 0;

            // Real-time presence heuristic: if lastSeen was updated < 90 seconds ago, consider online
            const isReallyOnline = partnerInfo?.isOnline && partnerInfo?.lastSeen &&
                (new Date().getTime() - new Date(partnerInfo.lastSeen).getTime()) < 90000;

            return {
                id: p.conversation.id,
                partnerId: partnerInfo?.id || '',
                partnerName: partnerInfo?.name || 'Utilisateur',
                partnerImage: partnerInfo?.image || null,
                partnerLastTypedAt: partnerParam?.lastTypedAt || null,
                isPartnerOnline: !!isReallyOnline,
                partnerLastSeen: partnerInfo?.lastSeen || null,
                updatedAt: p.conversation.updatedAt,
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    senderId: lastMessage.senderId,
                    isSeen: lastMessage.isSeen
                } : null,
                unreadCount
            };
        }));

        return conversations.sort((a, b) => {
            const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.updatedAt).getTime();
            const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.updatedAt).getTime();
            return dateB - dateA;
        });

    } catch (error) {
        console.error('Failed to get conversations', error);
        return [];
    }
}

export async function getConversationMessages(conversationId: string, userId: string) {
    try {
        const isParticipant = await prisma.conversationParticipant.findFirst({
            where: { conversationId, userId }
        });

        if (!isParticipant) throw new Error("Unauthorized");

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });

        return messages;
    } catch (err) {
        console.error('Failed to get messages', err);
        return [];
    }
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
    try {
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                content,
                isSeen: false
            }
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        return message;
    } catch (err) {
        console.error("Failed to send message", err);
        throw err;
    }
}

export async function getOrCreateConversation(userId: string, partnerId: string) {
    if (userId === partnerId) throw new Error("Cannot message yourself");

    const existingParticipationUser = await prisma.conversationParticipant.findMany({
        where: { userId }
    });

    const existingParticipationPartner = await prisma.conversationParticipant.findMany({
        where: { userId: partnerId }
    });

    const userConvIds = new Set(existingParticipationUser.map((p: any) => p.conversationId));
    const commonConvId = existingParticipationPartner.find((p: any) => userConvIds.has(p.conversationId))?.conversationId;

    if (commonConvId) {
        return commonConvId;
    }

    const newConv = await prisma.conversation.create({
        data: {
            participants: {
                create: [
                    { userId },
                    { userId: partnerId }
                ]
            }
        }
    });

    return newConv.id;
}

export async function markAsSeen(conversationId: string, userId: string) {
    try {
        const partner = await prisma.conversationParticipant.findFirst({
            where: { conversationId, userId: { not: userId } }
        });

        if (!partner) return;

        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: partner.userId,
                isSeen: false
            },
            data: { isSeen: true }
        });
    } catch (e) {
        console.error("markAsSeen error", e);
    }
}

export async function setTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
    try {
        await prisma.conversationParticipant.update({
            where: { conversationId_userId: { conversationId, userId } },
            data: { lastTypedAt: isTyping ? new Date() : null }
        });
    } catch (e) {
        console.error("set typing error", e);
    }
}
