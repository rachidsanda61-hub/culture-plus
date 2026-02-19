import React from 'react';
import { MapPin, UserPlus, UserCheck, UserMinus, Star } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';
import { useProfiles } from '@/context/ProfilesContext';
import { useAuth } from '@/context/AuthContext';
import { ProfileType } from '@prisma/client';
import { BadgeCheck, Building, Globe, Landmark, Music, Utensils, Hotel, Building2, Heart, Flag } from 'lucide-react';

interface ProfileCardProps {
    id: string;
    name: string;
    role: string;
    profile_type?: ProfileType;
    organization_name?: string | null;
    verified_status?: boolean;
    location: string | null;
    image?: string | null;
    tags: string[];
    followers: number;
    isFollowed: boolean;
    rating: number;
}

const TYPE_CONFIG: Record<ProfileType, { label: string, color: string }> = {
    [ProfileType.INDIVIDUAL]: { label: 'Individuel', color: 'bg-orange-100 text-orange-700' },
    [ProfileType.INTERNATIONAL_ORGANIZATION]: { label: 'Org. Int.', color: 'bg-blue-100 text-blue-700' },
    [ProfileType.DIPLOMATIC_ORGANIZATION]: { label: 'Diplomatie', color: 'bg-amber-100 text-amber-700' },
    [ProfileType.STATE_SERVICE]: { label: 'État', color: 'bg-red-100 text-red-700' },
    [ProfileType.NIGHT_CLUB]: { label: 'Club', color: 'bg-purple-100 text-purple-700' },
    [ProfileType.RESTAURANT]: { label: 'Resto', color: 'bg-emerald-100 text-emerald-700' },
    [ProfileType.HOTEL]: { label: 'Hôtel', color: 'bg-teal-100 text-teal-700' },
    [ProfileType.CULTURAL_ENTERPRISE]: { label: 'Entreprise', color: 'bg-indigo-100 text-indigo-700' },
    [ProfileType.ASSOCIATION_NGO]: { label: 'Association', color: 'bg-pink-100 text-pink-700' },
};

export const ProfileCard = ({
    id, name, role, location, image, tags, followers, isFollowed, rating,
    profile_type = ProfileType.INDIVIDUAL, organization_name, verified_status
}: ProfileCardProps) => {
    const { followProfile, isProcessingFollow } = useProfiles();
    const { user } = useAuth();
    const isProcessing = isProcessingFollow(id);
    const isOwnProfile = user?.id === id;
    const typeInfo = TYPE_CONFIG[profile_type] || TYPE_CONFIG[ProfileType.INDIVIDUAL];

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all p-6 flex flex-col items-center text-center group">

            {/* Avatar */}
            <Link href={`/network/${id}`} className="relative mb-4 block">
                <div className={`w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-sm group-hover:scale-105 transition-transform ${profile_type !== ProfileType.INDIVIDUAL ? 'rounded-2xl' : ''}`}>
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[var(--marketing-orange)] flex items-center justify-center text-white text-2xl font-bold">
                            {name[0]}
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white rounded-full text-xs font-bold text-gray-900 border border-gray-100 shadow-sm whitespace-nowrap">
                    {rating} ★
                </div>
            </Link>

            <div className="flex flex-col items-center gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                    <Link href={`/network/${id}`} className="hover:underline">
                        <h3 className="text-xl font-bold text-[var(--charcoal-900)] truncate max-w-[200px]">
                            {organization_name || name}
                        </h3>
                    </Link>
                    {verified_status && <BadgeCheck size={18} className="text-blue-500 fill-blue-50" />}
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${typeInfo.color}`}>
                        {typeInfo.label}
                    </span>
                    {organization_name && <span className="text-[10px] text-gray-400 font-medium">Par {name}</span>}
                </div>
            </div>

            <p className="text-[var(--marketing-orange)] font-medium text-xs mb-3">{role}</p>

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
