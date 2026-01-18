
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Review {
    author: string;
    rating: number;
    text: string;
    date: string;
}

export interface Post {
    id: string;
    content: string;
    image?: string;
    date: string;
    likes: number;
    isLiked: boolean;
}

export interface Profile {
    id: string;
    name: string;
    role: string;
    location: string;
    image?: string;
    tags: string[];
    bio: string;
    followers: number;
    isFollowed: boolean;
    rating: number;
    reviews: Review[];
    posts: Post[];
}

interface ProfilesContextType {
    profiles: Profile[];
    followProfile: (id: string) => void;
    addReview: (id: string, review: Review) => void;
    addPost: (profileId: string, post: Post) => void;
    likePost: (profileId: string, postId: string) => void;
    getProfileById: (id: string) => Profile | undefined;
}

const initialProfiles: Profile[] = [
    {
        id: "amina-kader",
        name: "Amina Kader",
        role: "Artiste Peintre",
        location: "Niamey",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
        tags: ["Art Contemporain", "Peinture", "Formation"],
        bio: "Artiste peintre passionnée par les couleurs du Sahel. J'anime également des ateliers pour les jeunes talents.",
        followers: 1240,
        isFollowed: false,
        rating: 4.8,
        reviews: [
            { author: "Jean D.", rating: 5, text: "Une artiste incroyable, ses toiles sont vivantes !", date: "10 Jan 2026" },
            { author: "Fatou S.", rating: 4, text: "Très pédagogue lors des formations.", date: "05 Dec 2025" }
        ],
        posts: [
            { id: "post1", content: "Nouveau vernissage ce weekend au CCFN ! Venez nombreux découvrir ma série 'Sables Mouvants'. 🎨", date: "Il y a 2h", likes: 45, isLiked: false, image: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&q=80&w=400" },
            { id: "post2", content: "Retour en images sur l'atelier avec les enfants d'Agadez. Quel talent ! ❤️", date: "Hier", likes: 120, isLiked: true }
        ]
    },
    {
        id: "sahel-vibes",
        name: "Sahel Vibes Agency",
        role: "Promoteur Culturel",
        location: "Agadez",
        tags: ["Concerts", "Festivals", "Management"],
        bio: "Agence dédiée à la promotion de la musique touareg et des festivals dans la région d'Agadez.",
        followers: 3500,
        isFollowed: false,
        rating: 4.5,
        reviews: [],
        posts: [
            { id: "post3", content: "Le Festival de l'Aïr approche à grands pas ! Préparez vos chèches. 🎸🐪", date: "Il y a 4h", likes: 230, isLiked: false }
        ]
    },
    {
        id: "moussa-art",
        name: "Moussa Artisanat",
        role: "Artisan",
        location: "Maradi",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
        tags: ["Cuir", "Maroquinerie", "Tradition"],
        bio: "Maître artisan spécialisé dans le travail du cuir selon les traditions ancestrales de Maradi.",
        followers: 890,
        isFollowed: false,
        rating: 4.9,
        reviews: [],
        posts: []
    },
    {
        id: "sara-slam",
        name: "Sara Slam",
        role: "Artiste Slameuse",
        location: "Zinder",
        tags: ["Poésie", "Slam", "Ateliers"],
        bio: "Je donne une voix aux maux à travers les mots. Slameuse engagée pour la jeunesse.",
        followers: 2100,
        isFollowed: true,
        rating: 5.0,
        reviews: [],
        posts: []
    }
];

const ProfilesContext = createContext<ProfilesContextType | undefined>(undefined);

export const ProfilesProvider = ({ children }: { children: ReactNode }) => {
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);

    const followProfile = (id: string) => {
        setProfiles(prev => prev.map(p =>
            p.id === id
                ? { ...p, isFollowed: !p.isFollowed, followers: p.isFollowed ? p.followers - 1 : p.followers + 1 }
                : p
        ));
    };

    const addReview = (id: string, review: Review) => {
        setProfiles(prev => prev.map(p => {
            if (p.id === id) {
                const newReviews = [review, ...p.reviews];
                const avgRating = newReviews.reduce((acc, r) => acc + r.rating, 0) / newReviews.length;
                return {
                    ...p,
                    reviews: newReviews,
                    rating: Number(avgRating.toFixed(1))
                };
            }
            return p;
        }));
    };

    const addPost = (profileId: string, post: Post) => {
        setProfiles(prev => prev.map(p => {
            if (p.id === profileId) {
                return { ...p, posts: [post, ...p.posts] };
            }
            return p;
        }));
    };

    const likePost = (profileId: string, postId: string) => {
        setProfiles(prev => prev.map(p => {
            if (p.id === profileId) {
                return {
                    ...p,
                    posts: p.posts.map(post =>
                        post.id === postId
                            ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
                            : post
                    )
                };
            }
            return p;
        }));
    };

    const getProfileById = (id: string) => profiles.find(p => p.id === id);

    return (
        <ProfilesContext.Provider value={{ profiles, followProfile, addReview, addPost, likePost, getProfileById }}>
            {children}
        </ProfilesContext.Provider>
    );
};

export const useProfiles = () => {
    const context = useContext(ProfilesContext);
    if (context === undefined) {
        throw new Error('useProfiles must be used within a ProfilesProvider');
    }
    return context;
};
