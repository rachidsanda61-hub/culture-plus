'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// PARTNERS
export async function getPartners() {
    return await prisma.partner.findMany({ orderBy: { order: 'asc' } });
}

export async function addPartner(role: string, data: { name: string, logo: string, link?: string, order?: number }) {
    if (role !== 'ADMIN') throw new Error('Unauthorized');
    const partner = await prisma.partner.create({ data });
    revalidatePath('/');
    return partner;
}

export async function deletePartner(role: string, id: string) {
    if (role !== 'ADMIN') throw new Error('Unauthorized');
    await prisma.partner.delete({ where: { id } });
    revalidatePath('/');
}

// ADS
export async function getAds() {
    return await prisma.ad.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
    });
}

export async function addAd(role: string, data: { image: string, link?: string, title?: string, order?: number }) {
    if (role !== 'ADMIN') throw new Error('Unauthorized');
    const ad = await prisma.ad.create({ data });
    revalidatePath('/');
    return ad;
}

export async function deleteAd(role: string, id: string) {
    if (role !== 'ADMIN') throw new Error('Unauthorized');
    await prisma.ad.delete({ where: { id } });
    revalidatePath('/');
}
