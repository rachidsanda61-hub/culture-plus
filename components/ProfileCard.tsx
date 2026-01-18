
import React from 'react';
import { MapPin, UserPlus, Star, UserCheck } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';
import { useProfiles } from '@/context/ProfilesContext';

interface ProfileCardProps {
    id: string;
    name: string;
    role: string;
    location: string;
    image?: string;
    tags: string[];
    followers: number;
    isFollowed: boolean;
    rating: number;
}

export const ProfileCard = ({ id, name, role, location, image, tags, followers, isFollowed, rating }: ProfileCardProps) => {
    const { followProfile } = useProfiles();

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all p-6 flex flex-col items-center text-center">

            {/* Avatar */}
            <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-sm">
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[var(--marketing-orange)] flex items-center justify-center text-white text-2xl font-bold">
                            {name[0]}
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-2 px-2 py-0.5 bg-[var(--sand-100)] rounded-full text-xs font-semibold text-[var(--marketing-orange)] border border-[var(--marketing-orange-light)]">
                    {rating} ★
                </div>
            </div>

            <h3 className="text-xl font-bold text-[var(--charcoal-900)] mb-1">{name}</h3>
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
                    <Button
                        onClick={() => followProfile(id)}
                        variant={isFollowed ? "outline" : "primary"}
                        className={`flex-1 justify-center ${isFollowed ? 'border-[var(--marketing-green)] text-[var(--marketing-green)] hover:bg-green-50' : ''}`}
                    >
                        {isFollowed ? (
                            <>
                                <UserCheck size={16} /> Suivi
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} /> Suivre
                            </>
                        )}
                    </Button>
                    <Link href={`/network/${id}`} className="flex-1">
                        <Button variant="outline" className="w-full justify-center">Voir</Button>
                    </Link>
                </div>
            </div>

        </div>
    );
};
