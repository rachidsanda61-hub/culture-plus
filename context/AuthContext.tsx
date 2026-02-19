'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginAction, register as registerAction, changePassword as changePasswordAction } from '@/app/actions/auth';
import { toast } from 'react-hot-toast';
import { ProfileType } from '@prisma/client';

export interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    profile_type: ProfileType;
    appRole: string;
    image?: string | null;
    organization_name?: string | null;
    country?: string | null;
    city?: string | null;
    official_website?: string | null;
    verified_status?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password?: string) => Promise<boolean>;
    register: (user: {
        name: string,
        email: string,
        phone?: string,
        password?: string,
        role: string,
        profile_type: ProfileType,
        organization_name?: string,
        country?: string,
        city?: string,
        official_website?: string,
        address?: string
    }) => Promise<void>;
    changePassword: (currentPassword?: string, newPassword?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('culture_plus_user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    if (parsed && typeof parsed === 'object' && (parsed.id || parsed.email)) {
                        setUser(parsed);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to parse stored user:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password?: string) => {
        try {
            const foundUser = await loginAction(email, password);
            if (foundUser) {
                setUser(foundUser as User);
                localStorage.setItem('culture_plus_user', JSON.stringify(foundUser));
                toast.success('Bon retour !');
                return true;
            }
            toast.error('Identifiants invalides');
            return false;
        } catch (error: any) {
            console.error(error);
            // This is the important part: show the actual error coming from the server
            toast.error(error.message || 'Erreur de connexion');
            return false;
        }
    };

    const register = async (userData: {
        name: string,
        email: string,
        phone?: string,
        password?: string,
        role: string,
        profile_type: ProfileType,
        organization_name?: string,
        country?: string,
        city?: string,
        official_website?: string,
        address?: string
    }) => {
        try {
            const newUser = await registerAction(userData);
            setUser(newUser as User);
            localStorage.setItem('culture_plus_user', JSON.stringify(newUser));
            toast.success('Inscription réussie');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Erreur lors de l’inscription');
        }
    };

    const changePassword = async (currentPassword?: string, newPassword?: string) => {
        if (!user) return;
        try {
            await changePasswordAction(user.id, currentPassword, newPassword);
            toast.success('Mot de passe mis à jour');
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors du changement de mot de passe');
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('culture_plus_user');
        router.push('/');
        toast.success('Déconnecté');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, changePassword, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        return {
            user: null,
            isAuthenticated: false,
            login: async () => false,
            register: async () => { },
            changePassword: async () => { },
            logout: () => { },
            isLoading: true
        };
    }
    return context;
};
