'use client';

import React, { useState } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/Button';

interface ProfileImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: string | null;
    isOwner: boolean;
    onUpdate: (base64: string) => Promise<void>;
    name: string;
}

export const ProfileImageModal: React.FC<ProfileImageModalProps> = ({ isOpen, onClose, image, isOwner, onUpdate, name }) => {
    const [editMode, setEditMode] = useState(false);
    const [newImage, setNewImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!newImage) return;
        setIsLoading(true);
        try {
            await onUpdate(newImage);
            setEditMode(false);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setEditMode(false);
        setNewImage(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={handleClose}>
            <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <button
                    onClick={handleClose}
                    title="Fermer"
                    className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full z-10 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-6 text-gray-900">
                        {editMode ? 'Modifier la photo' : isOwner ? 'Votre photo de profil' : `Photo de ${name}`}
                    </h3>

                    {editMode ? (
                        <div className="w-full space-y-6">
                            <ImageUpload
                                value={newImage || image}
                                onChange={setNewImage}
                                onRemove={() => setNewImage(null)}
                                aspectRatio="square"
                                label="Nouvelle photo"
                            />
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                                <Button variant="outline" onClick={() => setEditMode(false)} disabled={isLoading}>Annuler</Button>
                                <Button onClick={handleSave} disabled={!newImage || isLoading} className="gap-2">
                                    {isLoading && <Loader2 className="animate-spin" size={16} />}
                                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 flex flex-col items-center w-full">
                            <div className="w-72 h-72 rounded-full overflow-hidden border-8 border-gray-100 shadow-inner bg-gray-200 relative group">
                                {image ? (
                                    <img src={image} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-7xl text-gray-400 font-bold">
                                        {name && name[0]}
                                    </div>
                                )}
                            </div>

                            {isOwner && (
                                <Button onClick={() => setEditMode(true)} className="gap-2 shadow-lg shadow-orange-500/20">
                                    <Camera size={20} /> Changer la photo
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
