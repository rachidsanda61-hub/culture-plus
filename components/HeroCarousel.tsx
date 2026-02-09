'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
    id: string;
    image: string;
    title?: string | null;
}

interface HeroCarouselProps {
    slides: Slide[];
}

export const HeroCarousel = ({ slides }: HeroCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = useCallback(() => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, slides.length]);

    const nextSlide = useCallback(() => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, slides.length]);

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [nextSlide, slides.length]);

    if (!slides || slides.length === 0) return null;

    return (
        <div className="relative w-full h-[500px] md:h-[600px] group transition-all duration-500 overflow-hidden rounded-[2rem] md:rounded-[4rem] shadow-2xl">
            <div
                style={{ backgroundImage: `url(${slides[currentIndex].image})` }}
                className="w-full h-full bg-center bg-cover duration-700 ease-in-out"
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8 md:p-16">
                    {slides[currentIndex].title && (
                        <h2 className="text-white text-3xl md:text-5xl font-bold max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {slides[currentIndex].title}
                        </h2>
                    )}
                </div>
            </div>

            {/* Left Arrow */}
            <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-white/20 backdrop-blur-md text-white cursor-pointer hover:bg-white/40 transition-all z-20">
                <ChevronLeft onClick={prevSlide} size={30} />
            </div>

            {/* Right Arrow */}
            <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-white/20 backdrop-blur-md text-white cursor-pointer hover:bg-white/40 transition-all z-20">
                <ChevronRight onClick={nextSlide} size={30} />
            </div>

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, slideIndex) => (
                    <div
                        key={slideIndex}
                        onClick={() => setCurrentIndex(slideIndex)}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${currentIndex === slideIndex ? "bg-white w-8 h-2" : "bg-white/50 w-2 h-2"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};
