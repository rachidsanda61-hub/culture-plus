'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getEvents, addEvent as addEventAction, deleteEvent as deleteEventAction, likeEvent as likeEventAction, interestEvent as interestEventAction, EventInput } from '@/app/actions/events';
import { toast } from 'react-hot-toast';
import { useNotifications } from './NotificationsContext';
import { useAuth } from './AuthContext';

export interface Event {
    id: string;
    title: string;
    category: string;
    date: string;
    location: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    price?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    organizer?: string | null;
    likes: number;
    interested: number;
}

interface EventsContextType {
    events: Event[];
    filteredEvents: Event[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    categoryFilter: string;
    setCategoryFilter: (category: string) => void;
    locationFilter: string;
    setLocationFilter: (location: string) => void;
    addEvent: (event: EventInput) => Promise<void>;
    deleteEvent: (slug: string) => Promise<void>;
    likeEvent: (slug: string) => Promise<void>;
    interestEvent: (slug: string) => Promise<void>;
    isLoading: boolean;
    categories: string[];
    locations: string[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [locationFilter, setLocationFilter] = useState('ALL');
    const [isLoading, setIsLoading] = useState(true);
    const { addNotification } = useNotifications();
    const { user } = useAuth();

    const loadEvents = async () => {
        try {
            const data = await getEvents();
            setEvents(data as Event[]);
        } catch (error) {
            console.error('Failed to load events', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const categories = Array.from(new Set(events.map(e => e.category)));
    const locations = Array.from(new Set(events.map(e => e.location)));

    const filteredEvents = events.filter(event => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || (
            event.title.toLowerCase().includes(q) ||
            event.description?.toLowerCase().includes(q) ||
            event.location.toLowerCase().includes(q) ||
            event.category.toLowerCase().includes(q)
        );

        const matchesCategory = categoryFilter === 'ALL' || event.category === categoryFilter;
        const matchesLocation = locationFilter === 'ALL' || event.location === locationFilter;

        return matchesSearch && matchesCategory && matchesLocation;
    });

    const addEvent = async (newEvent: EventInput) => {
        try {
            const created = await addEventAction(newEvent);
            setEvents(prev => [created as Event, ...prev]);
            toast.success('Événement ajouté');
            addNotification({
                type: 'event',
                title: 'Événement publié !',
                message: `Votre événement "${created.title}" est maintenant en ligne.`,
                link: '/events',
                image: created.image || undefined
            });
        } catch (error) {
            toast.error('Erreur lors de l’ajout');
        }
    };

    const deleteEvent = async (slug: string) => {
        try {
            await deleteEventAction(slug);
            setEvents(prev => prev.filter(ev => ev.slug !== slug));
            toast.success('Événement supprimé');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const likeEvent = async (slug: string) => {
        if (!user) {
            toast.error('Connectez-vous pour aimer cet événement');
            return;
        }
        try {
            const updated = await likeEventAction(slug, user.id);
            setEvents(prev => prev.map(ev => ev.slug === slug ? updated as Event : ev));
        } catch (error) {
            console.error(error);
        }
    };

    const interestEvent = async (slug: string) => {
        if (!user) {
            toast.error('Connectez-vous pour manifester votre intérêt');
            return;
        }
        try {
            const updated = await interestEventAction(slug, user.id);
            setEvents(prev => prev.map(ev => ev.slug === slug ? updated as Event : ev));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <EventsContext.Provider value={{
            events,
            filteredEvents,
            searchQuery,
            setSearchQuery,
            categoryFilter,
            setCategoryFilter,
            locationFilter,
            setLocationFilter,
            addEvent,
            deleteEvent,
            likeEvent,
            interestEvent,
            isLoading,
            categories,
            locations
        }}>
            {children}
        </EventsContext.Provider>
    );
};

export const useEvents = () => {
    const context = useContext(EventsContext);
    if (context === undefined) {
        return {
            events: [],
            filteredEvents: [],
            searchQuery: '',
            setSearchQuery: () => { },
            categoryFilter: 'ALL',
            setCategoryFilter: () => { },
            locationFilter: 'ALL',
            setLocationFilter: () => { },
            addEvent: async () => { },
            deleteEvent: async () => { },
            likeEvent: async () => { },
            interestEvent: async () => { },
            isLoading: true,
            categories: [],
            locations: []
        };
    }
    return context;
};
