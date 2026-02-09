'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface EventInput {
    title: string;
    category: string;
    date: string;
    location: string;
    slug: string;
    description?: string;
    image?: string;
    price?: string;
    startTime?: string;
    endTime?: string;
    organizer?: string;
}

export async function getEvents() {
    try {
        return await prisma.event.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    } catch (error) {
        console.error('Failed to fetch events:', error);
        return [];
    }
}

export async function addEvent(data: EventInput) {
    try {
        const event = await prisma.event.create({
            data: {
                ...data,
                likes: 0,
                interested: 0,
            },
        });
        revalidatePath('/events');
        revalidatePath('/');
        return event;
    } catch (error) {
        console.error('Failed to add event:', error);
        throw new Error('Failed to add event');
    }
}

export async function deleteEvent(slug: string) {
    try {
        await prisma.event.delete({
            where: { slug },
        });
        revalidatePath('/events');
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to delete event:', error);
        throw new Error('Failed to delete event');
    }
}

export async function likeEvent(slug: string, userId: string) {
    try {
        const event = await prisma.event.findUnique({
            where: { slug },
            select: { id: true, likes: true }
        });
        if (!event) throw new Error('Event not found');

        const existingLike = await prisma.eventLike.findUnique({
            where: {
                userId_eventId: { userId, eventId: event.id }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.$transaction([
                prisma.eventLike.delete({ where: { id: existingLike.id } }),
                prisma.event.update({
                    where: { id: event.id },
                    data: { likes: { decrement: 1 } }
                })
            ]);
        } else {
            // Like
            await prisma.$transaction([
                prisma.eventLike.create({
                    data: { userId, eventId: event.id }
                }),
                prisma.event.update({
                    where: { id: event.id },
                    data: { likes: { increment: 1 } }
                })
            ]);
        }

        const updated = await prisma.event.findUnique({ where: { slug } });
        revalidatePath('/events');
        revalidatePath(`/events/${slug}`);
        return updated;
    } catch (error) {
        console.error('Failed to toggle like event:', error);
        throw new Error('Failed to toggle like');
    }
}

export async function interestEvent(slug: string, userId: string) {
    try {
        const event = await prisma.event.findUnique({
            where: { slug },
            select: { id: true, interested: true }
        });
        if (!event) throw new Error('Event not found');

        const existingInterest = await prisma.eventInterest.findUnique({
            where: {
                userId_eventId: { userId, eventId: event.id }
            }
        });

        if (existingInterest) {
            // Un-interest
            await prisma.$transaction([
                prisma.eventInterest.delete({ where: { id: existingInterest.id } }),
                prisma.event.update({
                    where: { id: event.id },
                    data: { interested: { decrement: 1 } }
                })
            ]);
        } else {
            // Interest
            await prisma.$transaction([
                prisma.eventInterest.create({
                    data: { userId, eventId: event.id }
                }),
                prisma.event.update({
                    where: { id: event.id },
                    data: { interested: { increment: 1 } }
                })
            ]);
        }

        const updated = await prisma.event.findUnique({ where: { slug } });
        revalidatePath('/events');
        revalidatePath(`/events/${slug}`);
        return updated;
    } catch (error) {
        console.error('Failed to toggle interest event:', error);
        throw new Error('Failed to toggle interest');
    }
}
