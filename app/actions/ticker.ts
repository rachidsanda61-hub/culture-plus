'use server';

import { prisma } from '@/lib/prisma';

export interface TickerItem {
    id: string;
    type: 'event' | 'opportunity';
    title: string;
    category: string;
    image: string | null;
    slug?: string; // for events
    createdAt: Date;
}

export async function getTickerItems(): Promise<TickerItem[]> {
    try {
        const [events, opportunities] = await Promise.all([
            prisma.event.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    category: true,
                    image: true,
                    slug: true,
                    createdAt: true,
                },
            }),
            prisma.opportunity.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    category: true,
                    image: true,
                    createdAt: true,
                }
            }),
        ]);

        // Normalize and merge
        const combined: TickerItem[] = [
            ...events.map((e: any) => ({
                id: e.id,
                type: 'event' as const,
                title: e.title,
                category: e.category,
                image: e.image,
                slug: e.slug,
                createdAt: e.createdAt
            })),
            ...opportunities.map((o: any) => ({
                id: o.id,
                type: 'opportunity' as const,
                title: o.title,
                category: o.category,
                image: o.image,
                createdAt: o.createdAt
            }))
        ];

        // Sort by date descending
        combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Return top 10
        return combined.slice(0, 10);

    } catch (error) {
        console.error('Failed to fetch ticker items:', error);
        return [];
    }
}
