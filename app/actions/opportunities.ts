'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface OpportunityInput {
    title: string;
    description: string;
    category: string;
    deadline: string;
    location?: string | null;
    image?: string | null;
    link?: string | null;
}

export async function getOpportunities() {
    try {
        const opportunities = await prisma.opportunity.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return opportunities;
    } catch (error) {
        console.error('Failed to fetch opportunities:', error);
        return [];
    }
}

export async function createOpportunity(userId: string, data: OpportunityInput) {
    try {
        const opportunity = await prisma.opportunity.create({
            data: {
                ...data,
                authorId: userId
            },
        });
        revalidatePath('/opportunities');
        return opportunity;
    } catch (error) {
        console.error('Failed to create opportunity:', error);
        throw new Error('Failed to create opportunity');
    }
}

export async function updateOpportunity(userId: string, id: string, data: Partial<OpportunityInput>) {
    try {
        // Check ownership
        const existing = await prisma.opportunity.findUnique({ where: { id } });
        if (!existing) throw new Error('Opportunity not found');
        if (existing.authorId !== userId) throw new Error('Unauthorized');

        const opportunity = await prisma.opportunity.update({
            where: { id },
            data,
        });
        revalidatePath('/opportunities');
        return opportunity;
    } catch (error) {
        console.error('Failed to update opportunity:', error);
        throw new Error('Failed to update opportunity');
    }
}

export async function deleteOpportunity(userId: string, userRole: string, id: string) {
    try {
        // Check ownership or admin role
        const existing = await prisma.opportunity.findUnique({ where: { id } });
        if (!existing) throw new Error('Opportunity not found');

        if (existing.authorId !== userId && userRole !== 'ADMIN') {
            throw new Error('Unauthorized');
        }

        await prisma.opportunity.delete({
            where: { id },
        });
        revalidatePath('/opportunities');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete opportunity:', error);
        throw new Error('Failed to delete opportunity');
    }
}

