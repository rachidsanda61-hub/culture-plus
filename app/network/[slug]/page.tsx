'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProfiles } from '@/context/ProfilesContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { MapPin, UserPlus, UserCheck, UserMinus, Star, MessageSquare, Heart, Image as ImageIcon, Send, Loader2, Trash2 } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { ImageUpload } from '@/components/ImageUpload';
import { adminDeletePost, adminDeleteComment, adminDeleteReview } from '@/app/actions/admin';
import { ProfileImageModal } from '@/components/ProfileImageModal';

const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'Date inconnue' : d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export default function ProfileDetailPage() {
    const { slug } = useParams();
    const { getProfileById, followProfile, addReview, addPost, addComment, likePost, isLoading, isProcessingFollow, updateProfile } = useProfiles();
    const { user } = useAuth();
    const profile = getProfileById(slug as string);

    const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
    const [postForm, setPostForm] = useState({ content: '', image: '' });
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'posts' | 'reviews'>('posts');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const isFollowProcessing = profile ? isProcessingFollow(profile.id) : false;

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
                <Loader2 className="animate-spin text-[var(--marketing-orange)]" size={40} />
                Chargement du profil...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                <div className="text-xl font-medium text-gray-900">Profil non trouvé</div>
                <Link href="/network">
                    <Button variant="outline">Retour au réseau</Button>
                </Link>
            </div>
        );
    }

    const isOwnProfile = user?.id === profile.id;
    const isAdmin = (user as any)?.appRole === 'ADMIN';

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addReview(profile.id, {
                rating: reviewForm.rating,
                text: reviewForm.text
            });
            setReviewForm({ rating: 5, text: '' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postForm.content.trim()) return;
        setIsSubmitting(true);
        try {
            await addPost(postForm.content, postForm.image);
            setPostForm({ content: '', image: '' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCommentSubmit = async (postId: string) => {
        const text = commentTexts[postId];
        if (!text || !text.trim()) return;

        try {
            await addComment(postId, text);
            setCommentTexts(prev => ({ ...prev, [postId]: '' }));
        } catch (error) {
            console.error(error);
        }
    };

    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

    const toggleComments = (postId: string) => {
        setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleReplySubmit = async (postId: string, commentId: string) => {
        if (!replyText || !replyText.trim()) return;

        try {
            await addComment(postId, replyText, commentId);
            setReplyText('');
            setReplyingTo(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleImageUpdate = async (base64: string) => {
        await updateProfile({ image: base64 });
    };

    const CommentText = ({ text }: { text: string }) => {
        const parts = text.split(/(@\w+)/g);
        return (
            <p className="text-xs text-gray-700">
                {parts.map((part, i) => (
                    part.startsWith('@') ? (
                        <span key={i} className="text-[var(--marketing-orange)] font-bold">{part}</span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                ))}
            </p>
        );
    };

    return (
        <main className="min-h-screen bg-[var(--sand-50)] pt-24 pb-20">
            {profile && (
                <ProfileImageModal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    image={profile.image || null}
                    name={profile.name}
                    isOwner={isOwnProfile}
                    onUpdate={handleImageUpdate}
                />
            )}
            <div className="max-w-4xl mx-auto px-4">

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-[var(--marketing-orange)] to-[var(--marketing-orange-light)]"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-4">
                            <button
                                onClick={() => setIsImageModalOpen(true)}
                                className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer relative group"
                            >
                                {profile.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-4xl text-white font-bold">
                                        {profile.name[0]}
                                    </div>
                                )}
                                {isOwnProfile && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ImageIcon className="text-white" size={24} />
                                    </div>
                                )}
                            </button>
                            <div className="flex gap-2">
                                {!isOwnProfile && (
                                    <Button
                                        onClick={() => followProfile(profile.id)}
                                        disabled={isFollowProcessing}
                                        variant={profile.isFollowed ? "outline" : "primary"}
                                        className={`group ${profile.isFollowed ? "text-green-600 border-green-600 bg-green-50 hover:bg-red-50 hover:border-red-600 hover:text-red-600" : ""}`}
                                    >
                                        {isFollowProcessing ? <Loader2 className="animate-spin" size={18} /> : (profile.isFollowed ? (
                                            <>
                                                <span className="group-hover:hidden flex items-center gap-2"><UserCheck size={18} /> Suivi</span>
                                                <span className="hidden group-hover:flex items-center gap-2"><UserMinus size={18} /> Se désabonner</span>
                                            </>
                                        ) : <><UserPlus size={18} /> Suivre</>)}
                                    </Button>
                                )}
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
                                {profile.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin size={18} /> {profile.location}
                                    </div>
                                )}
                                <div className="flex items-center gap-1 font-bold">
                                    <Star size={18} className="text-yellow-400 fill-yellow-400" /> {profile.rating}
                                </div>
                                <div className="flex items-center gap-1">
                                    <strong>{profile.followers}</strong> abonnés
                                </div>
                            </div>
                            {profile.bio && <p className="text-gray-600 max-w-2xl">{profile.bio}</p>}
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
                                {/* New Post Form - Only for owner */}
                                {isOwnProfile && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                {profile.image ? <img src={profile.image} alt="" className="w-full h-full object-cover" /> : null}
                                            </div>
                                            <div className="flex-1">
                                                <form onSubmit={handlePostSubmit} className="space-y-3">
                                                    <textarea
                                                        value={postForm.content}
                                                        onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                                                        placeholder={`Quoi de neuf aujourd'hui, ${profile.name.split(' ')[0]} ?`}
                                                        className="w-full bg-gray-50 border-0 rounded-lg p-3 focus:ring-2 focus:ring-[var(--marketing-orange)] resize-none"
                                                        rows={2}
                                                    />

                                                    <div className="py-2">
                                                        <ImageUpload
                                                            label="Ajouter une image à votre publication (Optionnel)"
                                                            value={postForm.image}
                                                            onChange={(base64) => setPostForm({ ...postForm, image: base64 })}
                                                            onRemove={() => setPostForm({ ...postForm, image: '' })}
                                                            aspectRatio="video"
                                                        />
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <Button size="sm" disabled={!postForm.content.trim() || isSubmitting}>
                                                            {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <>Publier <Send size={14} className="ml-1" /></>}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Posts List */}
                                {profile.posts.length === 0 && (
                                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                                        Pas encore de publications.
                                    </div>
                                )}

                                {profile.posts.map((post) => {
                                    const isExpanded = expandedComments[post.id];
                                    const visibleComments = isExpanded ? post.comments : post.comments.slice(0, 3);
                                    const hasMoreComments = post.comments.length > 3;

                                    return (
                                        <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                                            <div className="p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                    {profile.image ? <img src={profile.image} alt="" className="w-full h-full object-cover" /> : null}
                                                </div>
                                                <div>
                                                    <span className="block text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                                                </div>
                                                {isAdmin && (
                                                    <button
                                                        title="Supprimer ce post"
                                                        onClick={async () => {
                                                            if (confirm('Supprimer ce post ?')) {
                                                                await adminDeletePost(user!.id, post.id);
                                                                window.location.reload();
                                                            }
                                                        }}
                                                        className="ml-auto p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
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
                                                    onClick={() => likePost(post.id)}
                                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                                >
                                                    <Heart size={20} className={post.isLiked ? "fill-current" : ""} />
                                                    {post.likes}
                                                </button>
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                                    <MessageSquare size={20} />
                                                    {post.comments.length}
                                                </div>
                                            </div>

                                            {/* Comments Area */}
                                            <div className="bg-gray-50/50 p-4 border-t border-gray-50">
                                                <div className="space-y-4 mb-4">
                                                    {visibleComments.map(comment => (
                                                        <div key={comment.id} className="space-y-2">
                                                            {/* Parent Comment */}
                                                            <div className="flex gap-3 text-left group">
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                                    {comment.author.image ? <img src={comment.author.image} alt="" className="w-full h-full object-cover" /> : (
                                                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                                                                            {comment.author.name[0]}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm relative">
                                                                        <Link href={`/network/${comment.author.id}`} className="text-xs font-bold text-gray-900 mb-1 hover:underline block">
                                                                            {comment.author.name}
                                                                        </Link>
                                                                        <CommentText text={comment.text} />
                                                                        {isAdmin && (
                                                                            <button
                                                                                title="Supprimer ce commentaire"
                                                                                onClick={async () => {
                                                                                    if (confirm('Supprimer ce commentaire ?')) {
                                                                                        await adminDeleteComment(user!.id, comment.id);
                                                                                        window.location.reload();
                                                                                    }
                                                                                }}
                                                                                className="ml-auto p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 mt-1 ml-1">
                                                                        <span className="text-[10px] text-gray-400">{formatDate(comment.createdAt)}</span>
                                                                        {user && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                                                                    setReplyText(`@${comment.author.name.split(' ')[0]} `);
                                                                                }}
                                                                                className="text-[10px] font-semibold text-gray-500 hover:text-[var(--marketing-orange)]"
                                                                            >
                                                                                Répondre
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Replies */}
                                                            {comment.replies && comment.replies.length > 0 && (
                                                                <div className="pl-11 space-y-3">
                                                                    {comment.replies.map(reply => (
                                                                        <div key={reply.id} className="flex gap-3 text-left">
                                                                            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                                                {reply.author.image ? <img src={reply.author.image} alt="" className="w-full h-full object-cover" /> : (
                                                                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-white">
                                                                                        {reply.author.name[0]}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="bg-white p-2 rounded-xl rounded-tl-none border border-gray-100 shadow-sm">
                                                                                    <Link href={`/network/${reply.author.id}`} className="text-[10px] font-bold text-gray-900 mb-0.5 hover:underline block">
                                                                                        {reply.author.name}
                                                                                    </Link>
                                                                                    <CommentText text={reply.text} />
                                                                                </div>
                                                                                <span className="text-[10px] text-gray-400 ml-1 mt-0.5 block">{formatDate(reply.createdAt)}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Reply Input */}
                                                            {replyingTo === comment.id && (
                                                                <div className="pl-11 mt-2 flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder={`Répondre à ${comment.author.name.split(' ')[0]}...`}
                                                                        value={replyText}
                                                                        onChange={e => setReplyText(e.target.value)}
                                                                        className="flex-1 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[var(--marketing-orange)]"
                                                                        onKeyDown={e => e.key === 'Enter' && handleReplySubmit(post.id, comment.id)}
                                                                        autoFocus
                                                                    />
                                                                    <button
                                                                        title="Envoyer la réponse"
                                                                        onClick={() => handleReplySubmit(post.id, comment.id)}
                                                                        className="p-1.5 bg-[var(--marketing-orange)] text-white rounded-full hover:bg-[var(--marketing-orange)]/90 transition-colors"
                                                                    >
                                                                        <Send size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {hasMoreComments && (
                                                    <button
                                                        onClick={() => toggleComments(post.id)}
                                                        className="text-sm font-medium text-[var(--marketing-orange)] hover:underline pl-2"
                                                    >
                                                        {isExpanded ? 'Voir moins' : `Voir les ${post.comments.length - 3} autres commentaires`}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Add Main Comment Input */}
                                            {user && (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Votre commentaire..."
                                                        value={commentTexts[post.id] || ''}
                                                        onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                        className="flex-1 bg-white border border-gray-100 rounded-full px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-[var(--marketing-orange)]"
                                                        onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
                                                    />
                                                    <button
                                                        title="Envoyer le commentaire"
                                                        onClick={() => handleCommentSubmit(post.id)}
                                                        className="p-2 text-[var(--marketing-orange)] hover:bg-[var(--marketing-orange)]/5 rounded-full transition-colors"
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            /* Reviews Tab Content */
                            <div className="space-y-4">
                                {profile.reviews.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 italic">Soyez le premier à donner votre avis.</div>
                                )}
                                {profile.reviews.map((review) => (
                                    <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2 text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                    {review.author.image ? <img src={review.author.image} alt="" className="w-full h-full object-cover" /> : null}
                                                </div>
                                                <Link href={`/network/${review.author.id}`} className="font-bold text-gray-900 hover:underline">
                                                    {review.author.name}
                                                </Link>
                                            </div>
                                            <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                                            {isAdmin && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Supprimer cet avis ?')) {
                                                            await adminDeleteReview(user!.id, review.id);
                                                            window.location.reload();
                                                        }
                                                    }}
                                                    className="p-1 text-red-400 hover:text-red-500 ml-2"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex text-yellow-400 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-300"} />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 text-sm text-left">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold mb-4">Interagir</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Soutenez cet artiste en laissant un avis ou en partageant son profil.
                            </p>

                            <h4 className="font-bold text-sm mb-2 text-gray-700">Laisser un avis rapide</h4>
                            <form onSubmit={handleReviewSubmit} className="space-y-3">
                                <select
                                    title="Note"
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
                                <Button size="sm" className="w-full justify-center" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : "Envoyer l'avis"}
                                </Button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </main >
    );
}
