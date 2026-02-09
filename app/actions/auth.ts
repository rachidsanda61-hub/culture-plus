'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function login(email: string, password?: string) {
    try {
        console.log(`[AUTH-DEBUG] Login attempt for: ${email}`);

        // Detailed check
        if (!process.env.DATABASE_URL) {
            console.error('[AUTH-DEBUG] DATABASE_URL is missing in environment!');
            throw new Error('Configuration error: database missing');
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.warn(`[AUTH-DEBUG] No user found for: ${email}`);
            throw new Error('Identifiants invalides (User not found)');
        }

        if (password && user.password) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.warn(`[AUTH-DEBUG] Bad password for: ${email}`);
                throw new Error('Identifiants invalides (Password mismatch)');
            }
        } else if (password && !user.password) {
            console.warn(`[AUTH-DEBUG] Legacy user without password: ${email}`);
            throw new Error('Compte non configuré. Veuillez vous réinscrire.');
        }

        console.log(`[AUTH-DEBUG] Login SUCCESS for: ${user.name}`);
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            appRole: user.appRole,
            image: user.image
        };
    } catch (error: any) {
        console.error('[AUTH-DEBUG] Connection/Query Error:', error.message || error);
        // Bubble up error to UI for debugging
        throw new Error(error.message || 'Database error occurred');
    }
}

export async function register(data: { name: string, email: string, phone?: string, password?: string, role: string }) {
    try {
        console.log(`[AUTH-DEBUG] Reg attempt for: ${data.email}`);

        if (!process.env.DATABASE_URL) {
            throw new Error('Configuration error: database missing');
        }

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            console.warn(`[AUTH-DEBUG] Reg failed: ${data.email} exists.`);
            throw new Error('Un utilisateur avec cet email existe déjà.');
        }

        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: hashedPassword,
                role: data.role,
            }
        });

        console.log(`[AUTH-DEBUG] Reg SUCCESS: ${user.id}`);
        revalidatePath('/');
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            appRole: user.appRole,
            image: user.image
        };
    } catch (error: any) {
        console.error('[AUTH-DEBUG] Create User Error:', error.message || error);
        throw new Error(error.message || 'Registration failed');
    }
}

export async function changePassword(userId: string, currentPassword?: string, newPassword?: string) {
    try {
        if (!newPassword) throw new Error('New password required');

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) throw new Error('User not found');

        if (user.password && currentPassword) {
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) throw new Error('Current password incorrect');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error: any) {
        console.error('[AUTH-DEBUG] Pwd change Error:', error.message || error);
        throw new Error(error.message || 'Failed to change password');
    }
}
