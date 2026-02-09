'use client';

import React, { useState, useRef } from 'react';
import { ImageIcon, X, Upload, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
    value?: string | null;
    onChange: (base64: string) => void;
    onRemove: () => void;
    label?: string;
    className?: string;
    aspectRatio?: 'square' | 'video' | 'any';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    onRemove,
    label = "Image",
    className = "",
    aspectRatio = 'square'
}) => {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (base64: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Compression à 0.7 de qualité pour réduire drastiquement le poids
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedBase64);
            };
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsProcessing(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const originalBase64 = reader.result as string;
                const compressedBase64 = await compressImage(originalBase64);
                setPreview(compressedBase64);
                onChange(compressedBase64);
                setIsProcessing(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onRemove();
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

            {isProcessing ? (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 gap-3">
                    <Loader2 className="animate-spin text-[var(--marketing-orange)]" size={32} />
                    <p className="text-sm text-gray-500">Optimisation de l'image...</p>
                </div>
            ) : preview ? (
                <div className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <img
                        src={preview}
                        alt="Preview"
                        className={`w-full object-cover ${aspectRatio === 'square' ? 'aspect-square' :
                            aspectRatio === 'video' ? 'aspect-video' : ''
                            }`}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-white border-none text-red-500 hover:bg-red-50"
                            onClick={handleRemove}
                        >
                            <X size={18} /> Supprimer
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            className="bg-white border-none text-[var(--marketing-orange)]"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={18} /> Changer
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[var(--marketing-orange)] hover:bg-[var(--marketing-orange)]/5 transition-all group"
                >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[var(--marketing-orange)]/10 group-hover:text-[var(--marketing-orange)] transition-colors">
                        <ImageIcon size={24} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Cliquez pour ajouter une photo</p>
                        <p className="text-xs text-gray-400 mt-1">Image optimisée automatiquement</p>
                    </div>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
};
