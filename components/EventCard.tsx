
import React from 'react';
import { Calendar, MapPin, ArrowRight, Heart, Star } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';
import { useEvents } from '@/context/EventsContext';

interface EventProps {
    title: string;
    category: string;
    date: string;
    location: string;
    image?: string | null;
    slug: string;
    description?: string | null;
    price?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    organizer?: string | null;
    likes: number;
    interested: number;
}

import { ShareButton } from './ShareButton';

export const EventCard = ({ title, category, date, location, image, slug, description, likes, interested, price, startTime, endTime, organizer }: EventProps) => {
    const { likeEvent, interestEvent } = useEvents();

    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            {/* Image Placeholder */}
            <div className="h-48 bg-gray-200 relative overflow-hidden">
                {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--marketing-orange)] to-gray-800 flex items-center justify-center text-white/50">
                        <span>Image de l&apos;événement</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[var(--marketing-orange)] uppercase tracking-wider">
                    {category}
                </div>
                {price && (
                    <div className="absolute bottom-4 right-4 bg-[var(--marketing-orange)] text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                        {price}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-sm text-[var(--charcoal-600)] mb-3">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-[var(--marketing-orange)]" />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin size={16} className="text-[var(--marketing-orange)]" />
                        <span className="truncate max-w-[120px]">{location}</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-[var(--charcoal-900)] mb-1 line-clamp-2 leading-tight">
                    {title}
                </h3>

                {organizer && (
                    <p className="text-xs font-medium text-[var(--marketing-orange)] mb-3 uppercase tracking-wide">
                        Par {organizer}
                    </p>
                )}

                {description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {description}
                    </p>
                )}

                {/* Actions Bar */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex gap-4">
                        <button
                            onClick={() => likeEvent(slug)}
                            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium"
                        >
                            <Heart size={18} />
                            <span>{likes}</span>
                        </button>

                        <button
                            onClick={() => interestEvent(slug)}
                            className="flex items-center gap-1 text-gray-500 hover:text-yellow-500 transition-colors text-sm font-medium"
                        >
                            <Star size={18} />
                            <span>{interested}</span>
                        </button>
                    </div>

                    <div className="flex gap-3 items-center">
                        <ShareButton
                            url={`/events/${slug}`}
                            title={title}
                            text={`Découvrez cet événement sur Culture+ : ${title}`}
                            variant="ghost"
                            iconOnly
                            className="text-gray-400 hover:text-[var(--marketing-orange)]"
                        />
                        <Link href={`/events/${slug}`} className="text-[var(--marketing-orange)] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                            Voir <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
