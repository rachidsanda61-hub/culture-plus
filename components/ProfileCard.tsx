
import React from 'react';
import { MapPin, UserPlus, Star, UserCheck, UserMinus } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';
import { useProfiles } from '@/context/ProfilesContext';
import { useAuth } from '@/context/AuthContext';

interface ProfileCardProps {
    id: string;
    name: string;
    role: string;
    location: string | null;
    image?: string | null;
    tags: string[];
    followers: number;
    isFollowed: boolean;
    rating: number;
}

export const ProfileCard = ({ id, name, role, location, image, tags, followers, isFollowed, rating }: ProfileCardProps) => {
    const { followProfile, isProcessingFollow } = useProfiles();
    const { user } = useAuth();
    const isProcessing = isProcessingFollow(id);
    const isOwnProfile = user?.id === id;

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all p-6 flex flex-col items-center text-center">

            {/* Avatar */}
            <Link href={`/network/${id}`} className="relative mb-4 block group">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-sm group-hover:scale-105 transition-transform">
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[var(--marketing-orange)] flex items-center justify-center text-white text-2xl font-bold">
                            {name[0]}
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--sand-100)] rounded-full text-xs font-semibold text-[var(--marketing-orange)] border border-[var(--marketing-orange-light)] whitespace-nowrap">
                    {rating} ★
                </div>
            </Link>

            <Link href={`/network/${id}`} className="hover:underline">
                <h3 className="text-xl font-bold text-[var(--charcoal-900)] mb-1">{name}</h3>
            </Link>
            <p className="text-[var(--marketing-orange)] font-medium text-sm mb-2">{role}</p>

            <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                <MapPin size={14} />
                <span>{location}</span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-6">
                {tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="mt-auto w-full space-y-3">
                <div className="flex justify-center gap-8 text-sm text-gray-500 mb-2">
                    <div className="items-center flex flex-col">
                        <span className="font-bold text-gray-900">{followers}</span>
                        <span className="text-xs">Abonnés</span>
                    </div>
                    <div className="items-center flex flex-col">
                        <span className="font-bold text-gray-900">{rating}</span>
                        <span className="text-xs">Note</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isOwnProfile && (
                        <Button
                            onClick={() => followProfile(id)}
                            disabled={isProcessing}
                            variant={isFollowed ? "outline" : "primary"}
                            className={`flex-1 justify-center group ${isFollowed ? 'border-green-600 bg-green-50 text-green-700 hover:bg-red-50 hover:border-red-600 hover:text-red-700' : ''}`}
                        >
                            {isProcessing ? '...' : (isFollowed ? (
                                <>
                                    <span className="group-hover:hidden flex items-center gap-1"><UserCheck size={16} /> Abonné</span>
                                    <span className="hidden group-hover:flex items-center gap-1"><UserMinus size={16} /> Désabonner</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} /> Suivre
                                </>
                            ))}
                        </Button>
                    )}
                    <Link href={`/network/${id}`} className="flex-1">
                        <Button variant="outline" className="w-full justify-center">Voir</Button>
                    </Link>
                </div>
            </div>

        </div>
    );
};
