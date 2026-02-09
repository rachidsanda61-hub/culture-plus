'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProfiles, followProfile as followProfileAction, updateProfile as updateProfileAction, addReview as addReviewAction, addPost as addPostAction, addComment as addCommentAction, likePost as likePostAction } from '@/app/actions/profiles';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { useNotifications } from './NotificationsContext';

export interface Review {
    id: string;
    author: { id: string; name: string; image?: string | null };
    rating: number;
    text: string;
    createdAt: Date;
}

export interface Comment {
    id: string;
    text: string;
    createdAt: Date;
    author: { id: string, name: string; image?: string | null };
    parentId?: string | null;
    replies?: Comment[];
}

export interface Post {
    id: string;
    authorId: string;
    content: string;
    image?: string | null;
    createdAt: Date;
    likes: number;
    isLiked?: boolean;
    comments: Comment[];
}

export interface Profile {
    id: string;
    name: string;
    role: string;
    location: string | null;
    image?: string | null;
    tags: string[];
    bio: string | null;
    followers: number;
    isFollowed: boolean;
    rating: number;
    reviews: Review[];
    posts: Post[];
}

interface ProfilesContextType {
    profiles: Profile[];
    filteredProfiles: Profile[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    followProfile: (targetId: string) => Promise<void>;
    updateProfile: (data: { name?: string, bio?: string, image?: string, location?: string, tags?: string[] }) => Promise<void>;
    addReview: (targetId: string, review: { rating: number; text: string }) => Promise<void>;
    addPost: (content: string, image?: string) => Promise<void>;
    addComment: (postId: string, text: string, parentId?: string) => Promise<void>;
    likePost: (postId: string) => Promise<void>;
    getProfileById: (id: string) => Profile | undefined;
    isLoading: boolean;
    isProcessingFollow: (id: string) => boolean;
}

const ProfilesContext = createContext<ProfilesContextType | undefined>(undefined);

export const ProfilesProvider = ({ children }: { children: ReactNode }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { addNotification } = useNotifications();

    const loadProfiles = async () => {
        try {
            const data = await getProfiles(user?.id);
            setProfiles(data as unknown as Profile[]);
        } catch (error) {
            console.error('Failed to load profiles', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProfiles();
    }, [user?.id]);

    const filteredProfiles = profiles.filter(profile => {
        const query = searchQuery.toLowerCase();
        return (
            profile.name.toLowerCase().includes(query) ||
            profile.role.toLowerCase().includes(query) ||
            (profile.bio && profile.bio.toLowerCase().includes(query)) ||
            (profile.location && profile.location.toLowerCase().includes(query)) ||
            profile.tags.some(tag => tag.toLowerCase().includes(query))
        );
    });

    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

    const followProfile = async (targetId: string) => {
        try {
            if (!user) { toast.error('Connectez-vous pour suivre'); return; }
            if (followingIds.has(targetId)) return;

            setFollowingIds(prev => new Set(prev).add(targetId));

            const result = await followProfileAction(user.id, targetId);
            setProfiles(prev => prev.map(p =>
                p.id === targetId ? {
                    ...p,
                    followers: result.followers ?? (result.isFollowed ? p.followers + 1 : p.followers - 1),
                    isFollowed: result.isFollowed
                } : p
            ));
            toast.success(result.isFollowed ? 'Abonnement réussi' : 'Désabonnement réussi');
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de l\'action');
        } finally {
            setFollowingIds(prev => {
                const next = new Set(prev);
                next.delete(targetId);
                return next;
            });
        }
    };

    const updateProfile = async (data: { name?: string, bio?: string, image?: string, location?: string, tags?: string[] }) => {
        try {
            if (!user) return;
            await updateProfileAction(user.id, data);
            loadProfiles();
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const addReview = async (targetId: string, reviewData: { rating: number; text: string }) => {
        try {
            if (!user) { toast.error('Connectez-vous pour laisser un avis'); return; }
            await addReviewAction(user.id, targetId, reviewData);
            loadProfiles();
            toast.success('Avis publié');
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const addPost = async (content: string, image?: string) => {
        try {
            if (!user) { toast.error('Connectez-vous pour publier'); return; }
            await addPostAction(user.id, { content, image });
            loadProfiles();
            toast.success('Publication réussie');
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const addComment = async (postId: string, text: string, parentId?: string) => {
        try {
            if (!user) { toast.error('Connectez-vous pour commenter'); return; }
            await addCommentAction(user.id, postId, text, parentId);
            loadProfiles();
            toast.success('Commentaire ajouté');
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const likePost = async (postId: string) => {
        if (!user) {
            toast.error('Connectez-vous pour liker');
            return;
        }
        try {
            await likePostAction(postId, user.id);
            loadProfiles();
        } catch (error) {
            console.error(error);
        }
    };

    const getProfileById = (id: string) => profiles.find(p => p.id === id);

    const isProcessingFollow = (id: string) => followingIds.has(id);

    return (
        <ProfilesContext.Provider value={{ profiles, filteredProfiles, searchQuery, setSearchQuery, followProfile, updateProfile, addReview, addPost, addComment, likePost, getProfileById, isLoading, isProcessingFollow }}>
            {children}
        </ProfilesContext.Provider>
    );
};

export const useProfiles = () => {
    const context = useContext(ProfilesContext);
    if (context === undefined) {
        return {
            profiles: [],
            filteredProfiles: [],
            searchQuery: '',
            setSearchQuery: () => { },
            followProfile: async () => { },
            updateProfile: async () => { },
            addReview: async () => { },
            addPost: async () => { },
            addComment: async () => { },
            likePost: async () => { },
            getProfileById: () => undefined,
            isLoading: true,
            isProcessingFollow: () => false
        };
    }
    return context;
};
