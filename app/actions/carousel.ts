'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getHeroSlides() {
    try {
        return await prisma.heroSlide.findMany({
            where: { active: true },
            orderBy: { order: 'asc' }
        });
    } catch (error) {
        console.error('Failed to fetch slides:', error);
        return [];
    }
}

export async function addHeroSlide(userId: string, role: string, data: { image: string, title?: string, order?: number }) {
    if (role !== 'ADMIN') throw new Error('Unauthorized');
    try {
        const slide = await prisma.heroSlide.create({ data });
        revalidatePath('/');
        return slide;
    } catch (error) {
        throw new Error('Failed to add slide');
    }
}

export async function deleteHeroSlide(userId: string, role: string, id: string) {
    if (role !== 'ADMIN') throw new Error('Unauthorized');
    try {
        await prisma.heroSlide.delete({ where: { id } });
        revalidatePath('/');
    } catch (error) {
        throw new Error('Failed to delete slide');
    }
}
