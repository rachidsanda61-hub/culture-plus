'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOpportunities, createOpportunity, deleteOpportunity as deleteOpportunityAction } from '@/app/actions/opportunities';
import { toast } from 'react-hot-toast';

export interface Opportunity {
    id: string;
    title: string;
    type: string;
    deadline: string;
    amount: string;
    organization: string;
    link?: string | null;
    description?: string | null;
}

interface OpportunitiesContextType {
    opportunities: Opportunity[];
    addOpportunity: (opp: Omit<Opportunity, 'id'>) => void;
    deleteOpportunity: (id: string) => void;
}

const OpportunitiesContext = createContext<OpportunitiesContextType | undefined>(undefined);

export const OpportunitiesProvider = ({ children }: { children: React.ReactNode }) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadOpportunities = async () => {
        try {
            const data = await getOpportunities();
            setOpportunities(data as Opportunity[]);
        } catch (error) {
            console.error("Failed to load opportunities", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOpportunities();
    }, []);

    const addOpportunity = async (opp: Omit<Opportunity, 'id'>) => {
        try {
            const newOpp = await createOpportunity(opp);
            setOpportunities(prev => [newOpp, ...prev]);
            toast.success("Opportunité ajoutée avec succès");
        } catch (error) {
            console.error("Failed to create opportunity", error);
            toast.error("Erreur lors de la création");
        }
    };

    const deleteOpportunity = async (id: string) => {
        try {
            await deleteOpportunityAction(id);
            setOpportunities(prev => prev.filter(o => o.id !== id));
            toast.success("Opportunité supprimée");
        } catch (error) {
            console.error("Failed to delete opportunity", error);
            toast.error("Erreur lors de la suppression");
        }
    };

    return (
        <OpportunitiesContext.Provider value={{ opportunities, addOpportunity, deleteOpportunity }}>
            {children}
        </OpportunitiesContext.Provider>
    );
};

export const useOpportunities = () => {
    const context = useContext(OpportunitiesContext);
    if (!context) {
        return {
            opportunities: [],
            addOpportunity: () => { },
            deleteOpportunity: () => { }
        };
    }
    return context;
};
