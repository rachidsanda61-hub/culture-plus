'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Type definition matches the Prisma model but useful for frontend type safety
export interface OpportunityInput {
    title: string;
    type: string;
    deadline: string;
    amount: string;
    organization: string;
    link?: string | null;
    description?: string | null;
}

export async function getOpportunities() {
    try {
        const opportunities = await prisma.opportunity.findMany({
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

export async function createOpportunity(data: OpportunityInput) {
    try {
        const opportunity = await prisma.opportunity.create({
            data: {
                ...data,
            },
        });
        revalidatePath('/opportunities');
        return opportunity;
    } catch (error) {
        console.error('Failed to create opportunity:', error);
        throw new Error('Failed to create opportunity');
    }
}

export async function deleteOpportunity(id: string) {
    try {
        await prisma.opportunity.delete({
            where: {
                id,
            },
        });
        revalidatePath('/opportunities');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete opportunity:', error);
        throw new Error('Failed to delete opportunity');
    }
}
