
'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { EventCard } from './EventCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Event } from '@/context/EventsContext';
import { useEvents } from '@/context/EventsContext';

interface EventCarouselProps {
    events: Event[];
}

export const EventCarousel = ({ events }: EventCarouselProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 4000 })]);

    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <div className="relative group">
            {/* Carousel Container */}
            <div className="overflow-hidden p-4 -m-4" ref={emblaRef}>
                <div className="flex gap-6">
                    {events.map((event, idx) => (
                        <div className="flex-[0_0_90%] md:flex-[0_0_45%] lg:flex-[0_0_32%] min-w-0" key={idx}>
                            <EventCard {...event} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={scrollPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg text-[var(--marketing-orange)] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10 disabled:opacity-0"
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} />
            </button>

            <button
                onClick={scrollNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg text-[var(--marketing-orange)] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                aria-label="Next slide"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
};
