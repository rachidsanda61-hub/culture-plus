'use client';

import { useEffect, useState } from 'react';
import { getTickerItems, TickerItem } from '@/app/actions/ticker';
import styles from './CultureTicker.module.css';
import { useRouter } from 'next/navigation';
import { Calendar, Briefcase, ExternalLink } from 'lucide-react';

export const CultureTicker = () => {
    const [items, setItems] = useState<TickerItem[]>([]);
    const router = useRouter();

    useEffect(() => {
        getTickerItems().then(setItems);
    }, []);

    if (items.length === 0) return null;

    // Duplicate items to create seamless loop (2 sets is enough for 10+ items)
    const loopItems = [...items, ...items];

    const handleItemClick = (item: TickerItem) => {
        if (item.type === 'event' && item.slug) {
            router.push(`/events/${item.slug}`);
        } else if (item.type === 'opportunity') {
            router.push('/opportunities');
        }
    };

    return (
        <section
            className="w-full bg-white border-y border-gray-100 py-4 relative z-20 shadow-sm overflow-hidden"
            aria-label="Actualités et Opportunités en continu"
        >
            <div className={styles.tickerContainer}>
                <div className={styles.tickerTrack}>
                    {loopItems.map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            onClick={() => handleItemClick(item)}
                            className="flex-shrink-0 flex items-center gap-4 bg-[var(--sand-50)]/50 hover:bg-white border border-gray-100/80 px-5 py-3 rounded-2xl cursor-pointer transition-all hover:shadow-xl hover:shadow-[var(--marketing-orange)]/5 hover:-translate-y-0.5 active:scale-95 group min-w-[320px] max-w-[380px]"
                        >
                            {/* Image */}
                            <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 relative shadow-sm transition-transform group-hover:scale-105">
                                {item.image ? (
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                        {item.type === 'event' ? <Calendar size={24} /> : <Briefcase size={24} />}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${item.type === 'event'
                                        ? 'bg-orange-100 text-[var(--marketing-orange)] border border-orange-200/50'
                                        : 'bg-green-100 text-[var(--marketing-green)] border border-green-200/50'}`}>
                                        {item.category}
                                    </span>
                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-[var(--charcoal-900)] truncate leading-snug group-hover:text-[var(--marketing-orange)] transition-colors mb-0.5">
                                    {item.title}
                                </h4>
                                {item.description && (
                                    <p className="text-[11px] text-gray-500 line-clamp-1 leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {item.description.length > 60 ? item.description.substring(0, 57) + '...' : item.description}
                                    </p>
                                )}
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                <ExternalLink size={14} className="text-[var(--marketing-orange)]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
