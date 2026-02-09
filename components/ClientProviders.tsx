'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { EventsProvider } from '@/context/EventsContext';
import { ProfilesProvider } from '@/context/ProfilesContext';
import { OpportunitiesProvider } from '@/context/OpportunitiesContext';
import { MessagesProvider } from '@/context/MessagesContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { Toaster } from 'react-hot-toast';

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <NotificationsProvider>
                <EventsProvider>
                    <ProfilesProvider>
                        <OpportunitiesProvider>
                            <MessagesProvider>
                                {children}
                                <Toaster position="bottom-center" />
                            </MessagesProvider>
                        </OpportunitiesProvider>
                    </ProfilesProvider>
                </EventsProvider>
            </NotificationsProvider>
        </AuthProvider>
    );
}
