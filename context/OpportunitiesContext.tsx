'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOpportunities, createOpportunity, updateOpportunity, deleteOpportunity as deleteOpportunityAction, OpportunityInput } from '@/app/actions/opportunities';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

export interface Opportunity {
    id: string;
    title: string;
    description: string | null;
    category: string;
    deadline: string;
    location: string | null;
    image: string | null;
    link: string | null;
    authorId: string;
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
    createdAt: Date;
}

interface OpportunitiesContextType {
    opportunities: Opportunity[];
    filteredOpportunities: Opportunity[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    categoryFilter: string;
    setCategoryFilter: (category: string) => void;
    locationFilter: string;
    setLocationFilter: (location: string) => void;
    addOpportunity: (opp: OpportunityInput) => Promise<void>;
    editOpportunity: (id: string, data: Partial<OpportunityInput>) => Promise<void>;
    deleteOpportunity: (id: string) => Promise<void>;
    isLoading: boolean;
    categories: string[];
    locations: string[];
}

const OpportunitiesContext = createContext<OpportunitiesContextType | undefined>(undefined);

export const OpportunitiesProvider = ({ children }: { children: React.ReactNode }) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [locationFilter, setLocationFilter] = useState('ALL');
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const loadOpportunities = async () => {
        try {
            const data = await getOpportunities();
            setOpportunities(data as unknown as Opportunity[]);
        } catch (error) {
            console.error("Failed to load opportunities", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOpportunities();
    }, []);

    const categories = Array.from(new Set(opportunities.map(o => o.category)));
    const locations = Array.from(new Set(opportunities.filter(o => o.location).map(o => o.location!)));

    const filteredOpportunities = opportunities.filter(opp => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || (
            opp.title.toLowerCase().includes(q) ||
            opp.description?.toLowerCase().includes(q) ||
            opp.location?.toLowerCase().includes(q) ||
            opp.category.toLowerCase().includes(q)
        );

        const matchesCategory = categoryFilter === 'ALL' || opp.category === categoryFilter;
        const matchesLocation = locationFilter === 'ALL' || opp.location === locationFilter;

        return matchesSearch && matchesCategory && matchesLocation;
    });

    const addOpportunity = async (opp: OpportunityInput) => {
        if (!user) {
            toast.error("Vous devez être connecté");
            return;
        }
        try {
            await createOpportunity(user.id, opp);
            await loadOpportunities();
            toast.success("Opportunité publiée immédiatement");
        } catch (error) {
            console.error("Failed to create opportunity", error);
            toast.error("Erreur lors de la création");
        }
    };

    const editOpportunity = async (id: string, data: Partial<OpportunityInput>) => {
        if (!user) return;
        try {
            await updateOpportunity(user.id, id, data);
            await loadOpportunities();
            toast.success("Mise à jour réussie");
        } catch (error) {
            console.error("Failed to update opportunity", error);
            toast.error("Erreur lors de la modification");
        }
    };

    const deleteOpportunity = async (id: string) => {
        if (!user) return;
        try {
            const userRole = (user as any).appRole || 'USER';
            await deleteOpportunityAction(user.id, userRole, id);
            setOpportunities(prev => prev.filter(o => o.id !== id));
            toast.success("Opportunité supprimée");
        } catch (error) {
            console.error("Failed to delete opportunity", error);
            toast.error("Erreur lors de la suppression");
        }
    };

    return (
        <OpportunitiesContext.Provider value={{
            opportunities,
            filteredOpportunities,
            searchQuery,
            setSearchQuery,
            categoryFilter,
            setCategoryFilter,
            locationFilter,
            setLocationFilter,
            addOpportunity,
            editOpportunity,
            deleteOpportunity,
            isLoading,
            categories,
            locations
        }}>
            {children}
        </OpportunitiesContext.Provider>
    );
};

export const useOpportunities = () => {
    const context = useContext(OpportunitiesContext);
    if (!context) {
        return {
            opportunities: [],
            filteredOpportunities: [],
            searchQuery: '',
            setSearchQuery: () => { },
            categoryFilter: 'ALL',
            setCategoryFilter: () => { },
            locationFilter: 'ALL',
            setLocationFilter: () => { },
            addOpportunity: async () => { },
            editOpportunity: async () => { },
            deleteOpportunity: async () => { },
            isLoading: true,
            categories: [],
            locations: []
        };
    }
    return context;
};

