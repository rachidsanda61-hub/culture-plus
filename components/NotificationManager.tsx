
'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';

export const NotificationManager = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert("Ce navigateur ne supporte pas les notifications.");
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            new Notification("Notifications activées !", {
                body: "Vous serez alerté des nouveaux événements sur Culture+.",
                icon: "/icon-192.png" // Fallback icon
            });

            // Simulation d'une notification automatique après 5 secondes
            setTimeout(() => {
                new Notification("Nouvel Événement Ajouté !", {
                    body: "Concert : Nuit du Sahel à Agadez vient d'être publié.",
                    icon: "/icon-192.png"
                });
            }, 5000);
        }
    };

    if (permission === 'granted') {
        return (
            <button
                className="text-[var(--marketing-orange)] hover:bg-[var(--sand-100)] p-2 rounded-full transition-colors relative"
                title="Notifications activées"
            >
                <BellRing size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
            </button>
        );
    }

    if (permission === 'denied') {
        return (
            <button
                className="text-gray-400 p-2 rounded-full cursor-not-allowed"
                title="Notifications bloquées"
            >
                <BellOff size={20} />
            </button>
        );
    }

    return (
        <button
            onClick={requestPermission}
            className="text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)] hover:bg-[var(--sand-100)] p-2 rounded-full transition-colors animate-pulse"
            title="Activer les notifications"
        >
            <Bell size={20} />
        </button>
    );
};
