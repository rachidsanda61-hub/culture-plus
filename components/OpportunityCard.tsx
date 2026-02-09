
import React from 'react';
import { Calendar, DollarSign, ArrowUpRight, X, ExternalLink, Trash2, Edit2, MapPin } from 'lucide-react';
import { Button } from './Button';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOpportunities } from '@/context/OpportunitiesContext';

interface OpportunityProps {
    id: string;
    title: string;
    description: string | null;
    category: string;
    deadline: string;
    location: string | null;
    image: string | null;
    link: string | null;
    authorId: string;
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

export const OpportunityCard = ({ id, title, category, deadline, location, link, description, image, authorId, author }: OpportunityProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const { deleteOpportunity } = useOpportunities();

    const isOwner = user?.id === authorId;
    const isAdmin = (user as any)?.appRole === 'ADMIN';
    const canManage = isOwner || isAdmin;

    const handleLearnMore = () => {
        setIsModalOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Voulez-vous vraiment supprimer cette opportunité ?')) {
            await deleteOpportunity(id);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-start overflow-hidden group/card relative h-full">
            {image && (
                <div className="w-full h-40 overflow-hidden">
                    <img src={image} alt={title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                </div>
            )}

            <div className="p-6 flex flex-col flex-1 w-full">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[var(--sand-100)] text-[var(--charcoal-600)] mb-4 uppercase tracking-wider">
                    {category}
                </div>

                <h3 className="text-xl font-bold text-[var(--charcoal-900)] mb-2 leading-tight">
                    {title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
                        {author.image ? <img src={author.image} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <span>{author.name}</span>
                </div>

                <div className="mt-auto w-full space-y-4">
                    <div className="flex flex-col gap-2 text-sm text-[var(--charcoal-600)]">
                        {location && (
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-blue-500" />
                                <span>{location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Date limite : <span className="font-semibold text-red-500">{deadline}</span></span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 group" onClick={handleLearnMore}>
                            En savoir plus <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Button>

                        {canManage && (
                            <button
                                onClick={handleDelete}
                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {image && <img src={image} alt="" className="w-full h-64 object-cover" />}

                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-start justify-between">
                            <div>
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--sand-100)] text-[var(--charcoal-600)] mb-3 uppercase tracking-wide">
                                    {category}
                                </div>
                                <h2 className="text-2xl font-bold text-[var(--charcoal-900)]">{title}</h2>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                        {author.image ? <img src={author.image} alt="" className="w-full h-full object-cover" /> : null}
                                    </div>
                                    <span>Publié par {author.name}</span>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 text-left">
                            <div className="flex flex-wrap gap-4">
                                {location && (
                                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                                        <MapPin size={18} className="text-blue-600" />
                                        <span className="font-semibold text-blue-900">{location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
                                    <Calendar size={18} className="text-red-600" />
                                    <span className="font-semibold text-red-900">Deadline: {deadline}</span>
                                </div>
                            </div>

                            {description && (
                                <div>
                                    <h3 className="font-bold text-lg mb-3">Description</h3>
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{description}</p>
                                </div>
                            )}

                            {link && (
                                <div className="pt-4 border-t border-gray-100">
                                    <Button className="w-full gap-2" onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}>
                                        Accéder à l'opportunité <ExternalLink size={18} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

