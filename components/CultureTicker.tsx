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
        <div className="w-full bg-white border-y border-gray-100 py-3 relative z-20 shadow-sm">
            <div className={styles.tickerContainer}>
                <div className={styles.tickerTrack}>
                    {loopItems.map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            onClick={() => handleItemClick(item)}
                            className="flex-shrink-0 flex items-center gap-4 bg-[var(--sand-50)] hover:bg-white border border-gray-100 px-4 py-2 rounded-xl cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 group max-w-[400px]"
                        >
                            {/* Image */}
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
                                {item.image ? (
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        {item.type === 'event' ? <Calendar size={20} /> : <Briefcase size={20} />}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.type === 'event'
                                        ? 'bg-orange-100 text-[var(--marketing-orange)]'
                                        : 'bg-green-100 text-[var(--marketing-green)]'}`}>
                                        {item.category}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-[var(--charcoal-900)] truncate max-w-[250px] leading-tight group-hover:text-[var(--marketing-orange)] transition-colors">
                                    {item.title}
                                </h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
