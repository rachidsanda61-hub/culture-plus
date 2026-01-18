
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProfiles } from '@/context/ProfilesContext';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { MapPin, UserPlus, UserCheck, Star, MessageSquare, Heart, Image as ImageIcon, Send } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';

export default function ProfileDetailPage() {
    const { slug } = useParams();
    const { getProfileById, followProfile, addReview, addPost, likePost } = useProfiles();
    const profile = getProfileById(slug as string);

    const [reviewForm, setReviewForm] = useState({ rating: 5, text: '', name: '' });
    const [postContent, setPostContent] = useState('');
    const [activeTab, setActiveTab] = useState<'posts' | 'reviews'>('posts');

    if (!profile) {
        return <div className="min-h-screen flex items-center justify-center">Profil non trouvé</div>;
    }

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addReview(profile.id, {
            author: reviewForm.name || "Visiteur",
            rating: Number(reviewForm.rating),
            text: reviewForm.text,
            date: new Date().toLocaleDateString()
        });
        setReviewForm({ rating: 5, text: '', name: '' });
        alert('Merci pour votre avis !');
    };

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!postContent.trim()) return;

        const newPost = {
            id: `new-post-${Date.now()}`,
            content: postContent,
            date: "À l'instant",
            likes: 0,
            isLiked: false
        };
        addPost(profile.id, newPost);
        setPostContent('');
    };

    return (
        <main className="min-h-screen bg-[var(--sand-50)] py-8 pb-20">
            <div className="max-w-4xl mx-auto px-4">

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-[var(--marketing-orange)] to-[var(--marketing-orange-light)]"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-4">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
                                {profile.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-4xl text-white font-bold">
                                        {profile.name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => followProfile(profile.id)}
                                    variant={profile.isFollowed ? "outline" : "primary"}
                                    className={profile.isFollowed ? "text-green-600 border-green-600 bg-green-50" : ""}
                                >
                                    {profile.isFollowed ? <><UserCheck size={18} /> Suivi</> : <><UserPlus size={18} /> Suivre</>}
                                </Button>
                                <Link href={`/messages?with=${profile.id}`}>
                                    <Button variant="outline" className="gap-2">
                                        <MessageSquare size={18} /> Contacter
                                    </Button>
                                </Link>
                                <ShareButton
                                    url={`/network/${profile.id}`}
                                    title={`Découvrez ${profile.name} sur Culture+`}
                                    text={`Regarde ce profil incroyable de ${profile.role} :`}
                                    variant="outline"
                                    iconOnly
                                />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-[var(--charcoal-900)] mb-2">{profile.name}</h1>
                            <div className="flex flex-wrap gap-4 text-[var(--charcoal-600)] mb-4">
                                <span className="bg-[var(--sand-100)] px-3 py-1 rounded-full text-sm font-medium text-[var(--marketing-orange)]">
                                    {profile.role}
                                </span>
                                <div className="flex items-center gap-1">
                                    <MapPin size={18} /> {profile.location}
                                </div>
                                <div className="flex items-center gap-1 font-bold">
                                    <Star size={18} className="text-yellow-400 fill-yellow-400" /> {profile.rating}
                                </div>
                                <div className="flex items-center gap-1">
                                    <strong>{profile.followers}</strong> abonnés
                                </div>
                            </div>
                            <p className="text-gray-600 max-w-2xl">{profile.bio}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-200 mb-6 sticky top-16 bg-[var(--sand-50)] z-10 pt-2">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`pb-3 px-6 font-medium text-sm transition-colors relative ${activeTab === 'posts' ? 'text-[var(--marketing-orange)]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Fil d&apos;actualité
                        {activeTab === 'posts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--marketing-orange)]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-3 px-6 font-medium text-sm transition-colors relative ${activeTab === 'reviews' ? 'text-[var(--marketing-orange)]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Avis & Notes ({profile.reviews.length})
                        {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--marketing-orange)]" />}
                    </button>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Column (Feed or Reviews) */}
                    <div className="lg:col-span-2 space-y-6">

                        {activeTab === 'posts' ? (
                            <>
                                {/* New Post Form (Simulated for Demo) */}
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                            {profile.image ? <img src={profile.image} alt="" className="w-full h-full object-cover" /> : null}
                                        </div>
                                        <div className="flex-1">
                                            <form onSubmit={handlePostSubmit}>
                                                <textarea
                                                    value={postContent}
                                                    onChange={e => setPostContent(e.target.value)}
                                                    placeholder={`Quoi de neuf, ${profile.name.split(' ')[0]} ?`}
                                                    className="w-full bg-gray-50 border-0 rounded-lg p-3 focus:ring-2 focus:ring-[var(--marketing-orange)] resize-none mb-2"
                                                    rows={2}
                                                />
                                                <div className="flex justify-between items-center">
                                                    <button type="button" className="text-gray-400 hover:text-[var(--marketing-orange)] transition-colors">
                                                        <ImageIcon size={20} />
                                                    </button>
                                                    <Button size="sm" disabled={!postContent.trim()}>
                                                        Publier <Send size={14} className="ml-1" />
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Posts List */}
                                {profile.posts.length === 0 && (
                                    <div className="text-center py-10 text-gray-500">Aucune publication pour le moment.</div>
                                )}

                                {profile.posts.map((post) => (
                                    <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                {profile.image ? <img src={profile.image} alt="" className="w-full h-full object-cover" /> : null}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{profile.name}</h4>
                                                <span className="text-xs text-gray-400">{post.date}</span>
                                            </div>
                                        </div>

                                        <div className="px-4 pb-2">
                                            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                                        </div>

                                        {post.image && (
                                            <div className="mt-2">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={post.image} alt="" className="w-full h-auto object-cover max-h-96" />
                                            </div>
                                        )}

                                        <div className="px-4 py-3 border-t border-gray-50 flex items-center gap-6">
                                            <button
                                                onClick={() => likePost(profile.id, post.id)}
                                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                            >
                                                <Heart size={20} className={post.isLiked ? "fill-current" : ""} />
                                                {post.likes} <span className="hidden sm:inline">J&apos;aime</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                                                <MessageSquare size={20} />
                                                Commenter
                                            </button>
                                            <div className="ml-auto">
                                                <ShareButton
                                                    url={`/network/${profile.id}`} // En réalité, on voudrait un lien vers le post spécifique
                                                    title={`Publication de ${profile.name}`}
                                                    text={post.content.substring(0, 50) + "..."}
                                                    variant="ghost"
                                                    size="sm"
                                                    iconOnly
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            /* Reviews Tab Content */
                            <div className="space-y-4">
                                {profile.reviews.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 italic">Soyez le premier à donner votre avis.</div>
                                )}
                                {profile.reviews.map((review, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-gray-900">{review.author}</span>
                                            <span className="text-xs text-gray-400">{review.date}</span>
                                        </div>
                                        <div className="flex text-yellow-400 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-300"} />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 text-sm">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Sidebar (Always visible options) */}
                    <div className="space-y-6">
                        {/* Quick Actions Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold mb-4">Interagir</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Soutenez cet artiste en laissant un avis ou en partageant son profil.
                            </p>

                            {/* Add Review Form (Mini version) */}
                            <h4 className="font-bold text-sm mb-2 text-gray-700">Laisser un avis rapide</h4>
                            <form onSubmit={handleReviewSubmit} className="space-y-3">
                                <select
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-[var(--marketing-orange)]"
                                    value={reviewForm.rating}
                                    onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                                    <option value="4">⭐⭐⭐⭐ Très bien</option>
                                    <option value="3">⭐⭐⭐ Bien</option>
                                </select>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-[var(--marketing-orange)]"
                                    placeholder="Votre commentaire..."
                                    value={reviewForm.text}
                                    onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })}
                                />
                                <Button size="sm" className="w-full justify-center">Envoyer l&apos;avis</Button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
