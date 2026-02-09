'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function checkAdmin(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { appRole: true }
    });
    if ((user as any)?.appRole !== 'ADMIN') {
        throw new Error('Non autorisé : accès administrateur requis');
    }
}

export async function adminDeletePost(adminId: string, postId: string) {
    await checkAdmin(adminId);
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath('/network');
}

export async function adminDeleteComment(adminId: string, commentId: string) {
    await checkAdmin(adminId);
    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath('/network');
}

export async function adminDeleteReview(adminId: string, reviewId: string) {
    await checkAdmin(adminId);
    await prisma.review.delete({ where: { id: reviewId } });
    revalidatePath('/network');
}

export async function adminDeleteEvent(adminId: string, eventId: string) {
    await checkAdmin(adminId);
    await prisma.event.delete({ where: { id: eventId } });
    revalidatePath('/events');
}

export async function adminDeleteOpportunity(adminId: string, oppId: string) {
    await checkAdmin(adminId);
    await prisma.opportunity.delete({ where: { id: oppId } });
    revalidatePath('/opportunities');
}

export async function adminDeleteUser(adminId: string, userId: string) {
    await checkAdmin(adminId);
    if (adminId === userId) throw new Error('Vous ne pouvez pas vous supprimer vous-même');
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/network');
}

export async function getAllUsers(adminId: string) {
    await checkAdmin(adminId);
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: {
                    posts: true,
                    events: true,
                    opportunities: true
                }
            }
        }
    });
}
