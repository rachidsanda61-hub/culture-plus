'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Opportunity {
    id: string;
    title: string;
    type: string;
    deadline: string;
    amount: string;
    organization: string;
    link?: string;
    description?: string;
}

interface OpportunitiesContextType {
    opportunities: Opportunity[];
    addOpportunity: (opp: Omit<Opportunity, 'id'>) => void;
    deleteOpportunity: (id: string) => void;
}

const OpportunitiesContext = createContext<OpportunitiesContextType | undefined>(undefined);

// Données initiales pour la démo
const initialOpportunities: Opportunity[] = [
    {
        id: '1',
        title: "Fonds de Mobilité Artistique - Afrique de l'Ouest",
        type: "Fonds de Mobilité",
        deadline: "30 Jan 2026",
        amount: "2.000.000 FCFA",
        organization: "Institut Français",
        description: "Soutien aux déplacements des artistes et professionnels de la culture en Afrique de l'Ouest."
    },
    {
        id: '2',
        title: "Appel à Projets : Création Numérique",
        type: "Financement",
        deadline: "15 Fév 2026",
        amount: "5.000.000 FCFA",
        organization: "OIF",
        description: "Financement pour la production d'œuvres d'art numérique innovantes."
    },
    {
        id: '3',
        title: "Résidence d'écriture à Agadez",
        type: "Résidence",
        deadline: "10 Mar 2026",
        amount: "Bourse + Hébergement",
        organization: "Alliance Française",
        description: "Résidence de 3 mois pour auteurs francophones au cœur du désert."
    },
    {
        id: '4',
        title: "Bourse d'études : Arts du Spectacle",
        type: "Bourse",
        deadline: "01 Avr 2026",
        amount: "Prise en charge totale",
        organization: "Ministère de la Culture",
        description: "Bourse pour formation supérieure en théâtre, danse ou cirque."
    }
];

export const OpportunitiesProvider = ({ children }: { children: React.ReactNode }) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

    // Charger les données (simulation persistante via localStorage)
    useEffect(() => {
        const storedOpps = localStorage.getItem('culture_plus_opportunities');
        if (storedOpps) {
            setOpportunities(JSON.parse(storedOpps));
        } else {
            setOpportunities(initialOpportunities);
        }
    }, []);

    // Sauvegarder les changements
    useEffect(() => {
        if (opportunities.length > 0) {
            localStorage.setItem('culture_plus_opportunities', JSON.stringify(opportunities));
        }
    }, [opportunities]);

    const addOpportunity = (opp: Omit<Opportunity, 'id'>) => {
        const newOpp = {
            ...opp,
            id: Math.random().toString(36).substr(2, 9),
        };
        setOpportunities(prev => [newOpp, ...prev]);
    };

    const deleteOpportunity = (id: string) => {
        setOpportunities(prev => prev.filter(o => o.id !== id));
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
        throw new Error('useOpportunities must be used within an OpportunitiesProvider');
    }
    return context;
};
