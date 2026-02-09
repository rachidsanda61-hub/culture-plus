
import React from 'react';
import { Calendar, DollarSign, ArrowUpRight, X, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { useState } from 'react';

interface OpportunityProps {
    title: string;
    type: string;
    deadline: string;
    amount?: string | null;
    organization: string;
    link?: string | null;
    description?: string | null;
}

export const OpportunityCard = ({ title, type, deadline, amount, organization, link, description }: OpportunityProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLearnMore = () => {
        if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-start h-full">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--sand-100)] text-[var(--charcoal-600)] mb-4 uppercase tracking-wide">
                {type}
            </div>

            <h3 className="text-xl font-bold text-[var(--charcoal-900)] mb-2 leading-tight">
                {title}
            </h3>

            <p className="text-[var(--marketing-orange)] font-medium mb-4">{organization}</p>

            <div className="mt-auto w-full space-y-4">
                <div className="flex flex-col gap-2 text-sm text-[var(--charcoal-600)]">
                    {amount && (
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-green-600" />
                            <span>{amount}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Date limite : <span className="font-semibold text-red-500">{deadline}</span></span>
                    </div>
                </div>

                <Button variant="outline" size="sm" className="w-full group" onClick={handleLearnMore}>
                    En savoir plus <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-start justify-between">
                            <div>
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--sand-100)] text-[var(--charcoal-600)] mb-3 uppercase tracking-wide">
                                    {type}
                                </div>
                                <h2 className="text-2xl font-bold text-[var(--charcoal-900)]">{title}</h2>
                                <p className="text-[var(--marketing-orange)] font-medium mt-1">{organization}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex flex-wrap gap-4">
                                {amount && (
                                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                                        <DollarSign size={18} className="text-green-600" />
                                        <span className="font-semibold text-green-900">{amount}</span>
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
