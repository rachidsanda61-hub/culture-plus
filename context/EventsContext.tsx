
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Event {
    title: string;
    category: string;
    date: string;
    location: string;
    slug: string;
    description?: string;
    image?: string;
    likes: number;
    interested: number;
}

interface EventsContextType {
    events: Event[];
    addEvent: (event: Event) => void;
    deleteEvent: (slug: string) => void;
    likeEvent: (slug: string) => void;
    interestEvent: (slug: string) => void;
}

const initialEvents: Event[] = [
    {
        title: "Festival de la Mode Nigérienne - FIMA 2026",
        category: "Mode & Design",
        date: "12 Déc 2026",
        location: "Niamey, Palais des Congrès",
        slug: "fima-2026",
        description: "Le rendez-vous incontournable de la mode africaine. Défilés, concours et expositions.",
        likes: 120,
        interested: 450
    },
    {
        title: "Concert de la Paix - Sahel Tour",
        category: "Musique",
        date: "05 Nov 2026",
        location: "Agadez, Stade Régional",
        slug: "sahel-tour",
        description: "Un concert géant pour célébrer la paix et l'unité dans le Sahel avec les plus grands artistes.",
        image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=800",
        likes: 340,
        interested: 890
    },
    {
        title: "Foire Artisanale de Dosso",
        category: "Foire",
        date: "12 Mar 2026",
        location: "Dosso, Place des Artisans",
        slug: "foire-dosso",
        description: "Découvrez le savoir-faire des artisans de la région : cuir, poterie, textile.",
        likes: 45,
        interested: 120
    },
    {
        title: "Formation : Marketing Digital pour Artistes",
        category: "Formation",
        date: "18 Fev 2026",
        location: "Niamey, Incubateur CIPMEN",
        slug: "formation-marketing",
        description: "Apprenez à gérer votre image en ligne et à promouvoir vos œuvres sur les réseaux sociaux.",
        likes: 89,
        interested: 200
    },
    {
        title: "Exposition d'Art Touareg Contemporain",
        category: "Exposition",
        date: "20 Oct - 05 Nov",
        location: "Zinder, Centre Culturel",
        slug: "art-touareg",
        likes: 67,
        interested: 150
    },
    {
        title: "Séminaire : Droit d'auteur au Niger",
        category: "Séminaire",
        date: "05 Avr 2026",
        location: "Niamey, Grand Hôtel",
        slug: "seminaire-droit-auteur",
        likes: 34,
        interested: 90
    },
    {
        title: "Atelier d'Écriture Slam & Poésie",
        category: "Littérature",
        date: "15 Jan 2026",
        location: "Niamey, CCFN",
        slug: "atelier-slam",
        likes: 56,
        interested: 110
    },
    {
        title: "Danse Traditionnelle du Manga",
        category: "Danse",
        date: "02 Fev 2026",
        location: "Diffa, Maison de la Culture",
        slug: "danse-manga",
        likes: 125,
        interested: 300
    },
    {
        title: "Projection Plein Air : 'L'Arbre sans fruit'",
        category: "Cinéma",
        date: "10 Jan 2026",
        location: "Maradi, Place Publique",
        slug: "projection-plein-air",
        likes: 78,
        interested: 180
    }
];

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
    const [events, setEvents] = useState<Event[]>(initialEvents);

    const addEvent = (newEvent: Event) => {
        setEvents((prev) => [newEvent, ...prev]);
    };

    const deleteEvent = (slug: string) => {
        setEvents((prev) => prev.filter((event) => event.slug !== slug));
    };

    const likeEvent = (slug: string) => {
        setEvents(prev => prev.map(ev =>
            ev.slug === slug ? { ...ev, likes: ev.likes + 1 } : ev
        ));
    };

    const interestEvent = (slug: string) => {
        setEvents(prev => prev.map(ev =>
            ev.slug === slug ? { ...ev, interested: ev.interested + 1 } : ev
        ));
    };

    return (
        <EventsContext.Provider value={{ events, addEvent, deleteEvent, likeEvent, interestEvent }}>
            {children}
        </EventsContext.Provider>
    );
};

export const useEvents = () => {
    const context = useContext(EventsContext);
    if (context === undefined) {
        throw new Error('useEvents must be used within an EventsProvider');
    }
    return context;
};
