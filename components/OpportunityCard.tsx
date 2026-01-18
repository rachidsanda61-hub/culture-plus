
import React from 'react';
import { Calendar, DollarSign, ArrowUpRight } from 'lucide-react';
import { Button } from './Button';

interface OpportunityProps {
    title: string;
    type: string;
    deadline: string;
    amount?: string;
    organization: string;
}

export const OpportunityCard = ({ title, type, deadline, amount, organization }: OpportunityProps) => {
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

                <Button variant="outline" size="sm" className="w-full group">
                    En savoir plus <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Button>
            </div>
        </div>
    );
};
