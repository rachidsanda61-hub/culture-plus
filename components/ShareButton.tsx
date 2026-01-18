
'use client';

import React, { useState } from 'react';
import { Share2, X, Copy, Check } from 'lucide-react';
import { Button } from './Button';

interface ShareButtonProps {
    url: string;
    title: string;
    text?: string;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    iconOnly?: boolean;
}

export const ShareButton = ({ url, title, text = '', className = '', variant = 'ghost', size = 'sm', iconOnly = false }: ShareButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedText = encodeURIComponent(text + ' ' + title);

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    url: fullUrl
                });
                return true;
            } catch (err) {
                console.log('Error sharing:', err);
                return false;
            }
        }
        return false;
    };

    const handleClick = async () => {
        // Try native share first on mobile
        const shared = await handleNativeShare();
        if (!shared) {
            setIsOpen(true);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <Button
                variant={variant}
                size={size}
                className={`${className} ${iconOnly ? 'px-2' : ''}`}
                onClick={handleClick}
                title="Partager"
            >
                <Share2 size={18} />
                {!iconOnly && <span className="ml-2">Partager</span>}
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold mb-6 text-center">Partager via</h3>

                        <div className="grid grid-cols-4 gap-4 mb-6">
                            {/* WhatsApp */}
                            <a
                                href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="fill-white stroke-none"><path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.649.075-.99-.5-1.99-1.2-2.85-2.05-.66-.65-1.1-1.35-1.25-1.65-.05-.3-.02-.55.13-.7.13-.13.3-.35.45-.55.15-.2.2-.35.3-.55.1-.2.05-.35-.05-.55-.1-.2-.898-2.17-.998-2.97-.248-.75-.498-.65-.698-.65-.2 0-.45-.05-.7-.05-.25 0-.648.098-.998.448-.349.35-1.348 1.348-1.348 3.298 0 1.95 1.448 3.848 1.648 4.148.2.3 2.848 4.348 6.898 6.098 2.7.95 3.3.8 3.9.75.9-.07 1.767-.717 2.017-1.417.25-.7.25-1.3.175-1.417-.075-.117-.275-.242-.575-.392z"></path><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                </div>
                                <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                            </a>

                            {/* Facebook */}
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="fill-white stroke-none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                </div>
                                <span className="text-xs font-medium text-gray-600">Facebook</span>
                            </a>

                            {/* X (Twitter) */}
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="fill-white stroke-none"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
                                </div>
                                <span className="text-xs font-medium text-gray-600">X</span>
                            </a>

                            {/* Linkedin (Bonus) */}
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#0A66C2] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="fill-white stroke-none"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                </div>
                                <span className="text-xs font-medium text-gray-600">LinkedIn</span>
                            </a>
                        </div>

                        {/* Copy Link */}
                        <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-3">
                            <span className="text-xs text-gray-500 truncate flex-1">{fullUrl}</span>
                            <button
                                onClick={copyToClipboard}
                                className="text-[var(--marketing-orange)] font-bold text-sm flex items-center gap-1 hover:text-[#FF8C42]"
                            >
                                {copied ? <><Check size={16} /> Copié</> : <><Copy size={16} /> Copier</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
