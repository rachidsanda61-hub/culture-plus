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
    addOpportunity: (opp: OpportunityInput) => Promise<void>;
    editOpportunity: (id: string, data: Partial<OpportunityInput>) => Promise<void>;
    deleteOpportunity: (id: string) => Promise<void>;
    isLoading: boolean;
}

const OpportunitiesContext = createContext<OpportunitiesContextType | undefined>(undefined);

export const OpportunitiesProvider = ({ children }: { children: React.ReactNode }) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
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
        <OpportunitiesContext.Provider value={{ opportunities, addOpportunity, editOpportunity, deleteOpportunity, isLoading }}>
            {children}
        </OpportunitiesContext.Provider>
    );
};

export const useOpportunities = () => {
    const context = useContext(OpportunitiesContext);
    if (!context) {
        return {
            opportunities: [],
            addOpportunity: async () => { },
            editOpportunity: async () => { },
            deleteOpportunity: async () => { },
            isLoading: true
        };
    }
    return context;
};

