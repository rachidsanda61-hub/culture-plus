'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProfiles } from '@/context/ProfilesContext';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessagesContext';
import { Button } from '@/components/Button';
import Link from 'next/link';
import {
    MapPin, UserPlus, UserCheck, UserMinus, Star, MessageSquare, Heart,
    Image as ImageIcon, Send, Loader2, Trash2, BadgeCheck,
    Globe as GlobeIcon, Building, MapPin as MapIcon, User, Globe,
    Flag, Landmark, Music, Utensils, Hotel, Building2
} from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { ImageUpload } from '@/components/ImageUpload';
import { adminDeletePost, adminDeleteComment, adminDeleteReview } from '@/app/actions/admin';
import { ProfileImageModal } from '@/components/ProfileImageModal';
import { ProfileType } from '@prisma/client';

// Moved outside to avoid re-creation
const formatDate = (date: Date | string) => {
    if (!date) return 'Date inconnue';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Date inconnue';

    // Use a fixed format or suppress hydration warning in the caller
    return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const PROFILE_TYPE_CONFIG: Record<ProfileType, { label: string, color: string, icon: any }> = {
    [ProfileType.INDIVIDUAL]: { label: 'Individuel', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: User },
    [ProfileType.INTERNATIONAL_ORGANIZATION]: { label: 'Org. Internationale', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Globe },
    [ProfileType.DIPLOMATIC_ORGANIZATION]: { label: 'Ambassade / Diplomatie', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Flag },
    [ProfileType.STATE_SERVICE]: { label: 'Service de l’État', color: 'bg-red-100 text-red-700 border-red-200', icon: Landmark },
    [ProfileType.NIGHT_CLUB]: { label: 'Boîte de nuit', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Music },
    [ProfileType.RESTAURANT]: { label: 'Restaurant', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Utensils },
    [ProfileType.HOTEL]: { label: 'Hôtel', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Hotel },
    [ProfileType.CULTURAL_ENTERPRISE]: { label: 'Entreprise Culturelle', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Building2 },
    [ProfileType.ASSOCIATION_NGO]: { label: 'Association / ONG', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: Heart },
};

export default function ProfileDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { getProfileById, followProfile, addReview, deleteReview, addPost, addComment, likePost, isLoading, isProcessingFollow, updateProfile } = useProfiles();
    const { user } = useAuth();
    const { startConversation } = useMessages();

    // All hooks must be called before any conditional returns
    const [mounted, setMounted] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
    const [postForm, setPostForm] = useState({ content: '', image: '' });
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'posts' | 'reviews'>('posts');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setMounted(true);
    }, []);

    // Get profile from context - MUST be called before any conditional returns
    const profile = getProfileById(slug as string);
    const isFollowProcessing = profile ? isProcessingFollow(profile.id) : false;

    // NOW we can do conditional returns
    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500 bg-[var(--sand-50)]">
                <Loader2 className="animate-spin text-[var(--marketing-orange)]" size={40} />
                <p className="animate-pulse">Chargement de l&apos;univers de l&apos;artiste...</p>
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
    const typeConfig = PROFILE_TYPE_CONFIG[profile.profile_type] || PROFILE_TYPE_CONFIG[ProfileType.INDIVIDUAL];

    const handleContact = async () => {
        setIsSubmitting(true);
        try {
            const convId = await startConversation(profile!.id);
            if (convId) {
                router.push(`/messages?conv=${convId}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const toggleComments = (postId: string) => {
        setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleImageUpdate = async (base64: string) => {
        try {
            await updateProfile({ image: base64 });
        } catch (error) {
            console.error('Failed to update image:', error);
        }
    };

    const CommentText = ({ text }: { text: string }) => {
        if (!text) return null;
        const parts = text.split(/(@\w+)/g);
        return (
            <div className="text-xs text-gray-700 leading-relaxed">
                {parts.map((part, i) => (
                    part.startsWith('@') ? (
                        <span key={i} className="text-[var(--marketing-orange)] font-bold">{part}</span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                ))}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-20">
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
            <div className="max-w-5xl mx-auto px-4">

                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-8">
                    <div className={`h-48 bg-gradient-to-br transition-all duration-700 ${profile.profile_type === ProfileType.INDIVIDUAL ? 'from-[var(--marketing-orange)] to-orange-400' : 'from-gray-800 to-gray-600'}`}></div>
                    <div className="px-8 pb-10">
                        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-20 mb-8 gap-6 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                                <button
                                    onClick={() => setIsImageModalOpen(true)}
                                    className={`w-40 h-40 rounded-3xl border-[6px] border-white bg-white overflow-hidden shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer relative group ${profile.profile_type === ProfileType.INDIVIDUAL ? 'rounded-full' : ''}`}
                                >
                                    {profile.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-5xl text-gray-300 font-bold">
                                            {profile.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    {isOwnProfile && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ImageIcon className="text-white" size={32} />
                                        </div>
                                    )}
                                </button>
                                <div className="md:mb-4">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                            {profile.organization_name || profile.name}
                                        </h1>
                                        {profile.verified_status && (
                                            <BadgeCheck className="text-blue-500 fill-blue-50" size={28} />
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border ${typeConfig.color}`}>
                                            <typeConfig.icon size={14} />
                                            {typeConfig.label}
                                        </span>
                                        {profile.organization_name && profile.name && (
                                            <span className="text-gray-400 text-sm font-medium">Représenté par {profile.name}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mb-4">
                                {!isOwnProfile && (
                                    <Button
                                        onClick={() => followProfile(profile.id)}
                                        disabled={isFollowProcessing}
                                        variant={profile.isFollowed ? "outline" : "primary"}
                                        className={`rounded-2xl px-6 py-6 h-auto shadow-lg shadow-[var(--marketing-orange)]/10 group ${profile.isFollowed ? "text-green-600 border-green-600 bg-green-50 hover:bg-red-50 hover:border-red-600 hover:text-red-600" : ""}`}
                                    >
                                        {isFollowProcessing ? <Loader2 className="animate-spin" size={20} /> : (profile.isFollowed ? (
                                            <>
                                                <span className="group-hover:hidden flex items-center gap-2 font-bold"><UserCheck size={20} /> Abonné</span>
                                                <span className="hidden group-hover:flex items-center gap-2 font-bold"><UserMinus size={20} /> Se désabonner</span>
                                            </>
                                        ) : <><UserPlus size={20} /> S&apos;abonner</>)}
                                    </Button>
                                )}
                                <Button onClick={handleContact} disabled={isSubmitting} variant="outline" className="rounded-2xl px-6 py-6 h-auto border-gray-200 hover:bg-gray-50 gap-2 font-bold transition-all">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><MessageSquare size={20} /> Message</>}
                                </Button>
                                <ShareButton
                                    url={`/network/${profile.id}`}
                                    title={`Découvrez ${profile.name} sur Culture+`}
                                    text={`Regarde ce profil de ${profile.role} :`}
                                    variant="outline"
                                    iconOnly
                                    className="rounded-2xl w-14 h-14 border-gray-200"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-gray-50">
                            <div className="md:col-span-3">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">À propos</h3>
                                <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                                    {profile.bio || "Aucune description fournie."}
                                </p>

                                <div className="flex flex-wrap gap-8 mt-8">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-gray-900">{profile.followers || 0}</span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Abonnés</span>
                                    </div>
                                    <div className="flex flex-col border-l border-gray-100 pl-8">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-2xl font-black text-gray-900">{profile.rating || 0}</span>
                                            <Star size={20} className="text-yellow-400 fill-yellow-400" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Note Moyenne</span>
                                    </div>
                                    <div className="flex flex-col border-l border-gray-100 pl-8">
                                        <span className="text-2xl font-black text-gray-900">{profile.reviews?.length || 0}</span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avis</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Informations</h3>
                                <div className="space-y-4">
                                    {(profile.country || profile.city) && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <MapIcon size={14} className="text-gray-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-500">Localisation</span>
                                                <span className="text-sm font-medium text-gray-900">{profile.city}{profile.city && profile.country ? ', ' : ''}{profile.country}</span>
                                            </div>
                                        </div>
                                    )}
                                    {profile.address && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Building size={14} className="text-gray-400" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs font-bold text-gray-500">Addresse</span>
                                                <span className="text-sm font-medium text-gray-900 leading-tight">{profile.address}</span>
                                            </div>
                                        </div>
                                    )}
                                    {profile.official_website && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <GlobeIcon size={14} className="text-gray-400" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs font-bold text-gray-500">Site Web</span>
                                                <a href={profile.official_website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[var(--marketing-orange)] truncate max-w-[150px] hover:underline">
                                                    {profile.official_website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Multi-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Sidebar Info */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Coordonnées & Infos</h3>

                            <div className="space-y-5">
                                <Button onClick={handleContact} disabled={isSubmitting} className="w-full py-6 rounded-2xl text-lg font-black shadow-lg shadow-[var(--marketing-orange)]/20 gap-3 group">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><MessageSquare className="group-hover:scale-110 transition-transform" /> Contacter</>}
                                </Button>

                                <div className="grid grid-cols-2 gap-3">
                                    {!isOwnProfile && (
                                        <Button
                                            onClick={() => followProfile(profile.id)}
                                            disabled={isFollowProcessing}
                                            variant={profile.isFollowed ? "outline" : "primary"}
                                            className={`rounded-xl px-4 py-3 h-auto text-sm font-bold border-gray-200 ${profile.isFollowed ? "text-green-600 bg-green-50 border-green-200" : ""}`}
                                        >
                                            {isFollowProcessing ? <Loader2 className="animate-spin" size={16} /> : (profile.isFollowed ? "Abonné" : "Suivre")}
                                        </Button>
                                    )}
                                    <ShareButton
                                        url={`/network/${profile.id}`}
                                        title={`Découvrez ${profile.name} sur Culture+`}
                                        text={`Regarde ce profil de ${profile.role} :`}
                                        variant="outline"
                                        className="rounded-xl px-4 py-3 h-auto text-sm font-bold border-gray-200"
                                    />
                                </div>

                                <div className="pt-4 space-y-4 border-t border-gray-50">
                                    {(profile.country || profile.city) && (
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                                                <MapIcon size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Localisation</p>
                                                <p className="text-sm font-bold text-gray-900">{profile.city}{profile.city && profile.country ? ', ' : ''}{profile.country}</p>
                                            </div>
                                        </div>
                                    )}

                                    {profile.official_website && (
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                                                <Globe size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Site Web</p>
                                                <a href={profile.official_website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[var(--marketing-orange)] truncate block hover:underline">
                                                    {profile.official_website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[var(--marketing-orange)] rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10">Statistiques</h3>
                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                <div>
                                    <p className="text-3xl font-black">{profile.followers || 0}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Abonnés</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 ">
                                        <p className="text-3xl font-black">{profile.rating || 0}</p>
                                        <Star size={20} className="text-yellow-400 fill-yellow-400 mb-1" />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Note Moyenne</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Main Content */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Feed / About */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-4 px-1 flex items-center gap-2">
                                <Building className="text-[var(--marketing-orange)]" size={24} />
                                Présentation
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                                {profile.bio || "Aucune description fournie pour le moment."}
                            </p>
                        </div>

                        {/* Latest Activities (Posts) */}
                        <section>
                            <div className="flex items-center justify-between mb-6 px-1">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <ImageIcon className="text-[var(--marketing-orange)]" size={24} />
                                    Actualités & Publications
                                </h3>
                            </div>

                            <div className="space-y-6">
                                {/* New Post Form - Only for owner */}
                                {isOwnProfile && (
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-[var(--marketing-orange)]">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 shadow-inner">
                                                {profile.image ? <img src={profile.image} alt="" className="w-full h-full object-cover" /> : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">{profile.name?.[0]?.toUpperCase() || '?'}</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <form onSubmit={handlePostSubmit} className="space-y-4">
                                                    <textarea
                                                        value={postForm.content}
                                                        onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                                                        placeholder={`Partagez vos actualités avec la communauté...`}
                                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-[var(--marketing-orange)]/20 transition-all outline-none resize-none text-gray-700 min-h-[100px]"
                                                    />

                                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                                        <ImageUpload
                                                            label="Illustration"
                                                            value={postForm.image}
                                                            onChange={(base64) => setPostForm({ ...postForm, image: base64 })}
                                                            onRemove={() => setPostForm({ ...postForm, image: '' })}
                                                            aspectRatio="video"
                                                        />
                                                        <Button size="lg" disabled={!postForm.content.trim() || isSubmitting} className="rounded-2xl px-10 font-black shadow-lg shadow-[var(--marketing-orange)]/10">
                                                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Publier"}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {profile.posts?.map((post, idx) => {
                                    const isExpanded = expandedComments[post.id];
                                    const comments = post.comments || [];
                                    const visibleComments = isExpanded ? comments : comments.slice(0, 3);

                                    return (
                                        <div key={post.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className="p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden">
                                                        {profile.image ? <img src={profile.image} alt="" className="w-full h-full object-cover" /> : null}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 leading-none">{profile.organization_name || profile.name}</p>
                                                        <span className="text-[10px] font-bold text-gray-400" suppressHydrationWarning>{formatDate(post.createdAt)}</span>
                                                    </div>
                                                    {isAdmin && (
                                                        <button
                                                            title="Supprimer"
                                                            onClick={async () => { if (confirm('Supprimer?')) { await adminDeletePost(user!.id, post.id); window.location.reload(); } }}
                                                            className="ml-auto p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                            </div>

                                            {post.image && (
                                                <div className="aspect-video relative overflow-hidden bg-gray-100 border-y border-gray-50">
                                                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}

                                            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50">
                                                <div className="flex items-center gap-6">
                                                    <button
                                                        title="Aimer la publication"
                                                        onClick={() => likePost(post.id)}
                                                        className={`flex items-center gap-2 text-sm font-bold transition-all hover:scale-110 ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                                    >
                                                        <Heart size={22} className={post.isLiked ? "fill-current" : ""} />
                                                        {post.likes}
                                                    </button>
                                                    <button
                                                        title="Voir les commentaires"
                                                        onClick={() => toggleComments(post.id)}
                                                        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[var(--marketing-orange)] transition-colors"
                                                    >
                                                        <MessageSquare size={22} />
                                                        {post.comments?.length || 0}
                                                    </button>
                                                </div>
                                                <ShareButton url={`/network/${profile.id}#post-${post.id}`} title="Partager cette publication" iconOnly size="sm" variant="ghost" />
                                            </div>

                                            {/* Nested Comments */}
                                            {isExpanded && (
                                                <div className="bg-gray-50/50 p-6 space-y-4 border-t border-gray-100">
                                                    <div className="space-y-4">
                                                        {visibleComments.map(comment => (
                                                            <div key={comment.id} className="flex gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                                                                    {comment.author.image ? <img src={comment.author.image} alt="" className="w-full h-full object-cover" /> : <User size={16} className="m-2 text-gray-400" />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                                                        <Link href={`/network/${comment.author.id}`} className="text-xs font-black text-gray-900 mb-1 hover:underline block">{comment.author.name}</Link>
                                                                        <CommentText text={comment.text} />
                                                                    </div>
                                                                    <div className="flex items-center gap-4 mt-1.5 ml-1">
                                                                        <span className="text-[10px] font-bold text-gray-400" suppressHydrationWarning>{formatDate(comment.createdAt)}</span>
                                                                        {user && (
                                                                            <button
                                                                                onClick={() => { setReplyingTo(comment.id); setReplyText(`@${comment.author.name.split(' ')[0]} `); }}
                                                                                className="text-[10px] font-black text-gray-500 hover:text-[var(--marketing-orange)] uppercase tracking-tighter"
                                                                            >
                                                                                Répondre
                                                                            </button>
                                                                        )}
                                                                        {isAdmin && <button onClick={async () => { if (confirm('Supprimer?')) { await adminDeleteComment(user!.id, comment.id); window.location.reload(); } }} className="text-[10px] font-bold text-red-300 hover:text-red-500 uppercase tracking-tighter">Supprimer</button>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {user && (
                                                        <div className="flex gap-3 mt-4">
                                                            <div className="w-8 h-8 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-100">
                                                                {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : <User size={16} className="m-2 text-gray-400" />}
                                                            </div>
                                                            <div className="flex-1 relative">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Votre commentaire..."
                                                                    value={commentTexts[post.id] || ''}
                                                                    onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                    onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
                                                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20"
                                                                />
                                                                <button title="Publier le commentaire" onClick={() => handleCommentSubmit(post.id)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--marketing-orange)] p-1 hover:bg-orange-50 rounded-lg transition-colors">
                                                                    <Send size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {(!profile.posts || profile.posts.length === 0) && (
                                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 font-bold">Aucune publication pour le moment.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Reviews & Ratings Section (Always visible) */}
                        <section id="reviews" className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            <div className="flex items-center justify-between mb-6 px-1">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <Star className="text-[var(--marketing-orange)]" size={24} />
                                    Avis & Notes communautaires
                                </h3>
                                <div className="bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                                    <span className="text-lg font-black text-gray-900">{profile.rating || 0}</span>
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className={i < Math.round(profile.rating || 0) ? "fill-current" : "text-gray-200"} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">({profile.reviews?.length || 0} avis)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Review Submission Card */}
                                {!isOwnProfile && (
                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-center">
                                        <h4 className="font-black text-lg mb-2">Laissez un avis</h4>
                                        <p className="text-sm text-gray-500 mb-6 leading-snug">Votre retour aide la communauté à découvrir les meilleurs talents.</p>

                                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                                            <div className="flex justify-center gap-3">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        title={`Noter ${star} étoiles`}
                                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                        className={`transition-all duration-300 transform hover:scale-125 ${star <= reviewForm.rating ? 'text-yellow-400 scale-110' : 'text-gray-100'}`}
                                                    >
                                                        <Star size={36} className={star <= reviewForm.rating ? "fill-current" : "fill-current text-gray-100"} />
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                required
                                                rows={3}
                                                className="w-full px-5 py-4 border-none bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 transition-all resize-none shadow-inner"
                                                placeholder="Partagez votre expérience..."
                                                value={reviewForm.text}
                                                onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })}
                                            />
                                            <Button size="lg" className="w-full rounded-2xl font-black py-4 shadow-lg shadow-[var(--marketing-orange)]/10" disabled={isSubmitting}>
                                                {isSubmitting ? <Loader2 className="animate-spin text-white" size={20} /> : "Envoyer mon avis"}
                                            </Button>
                                        </form>
                                    </div>
                                )}

                                {/* Individual Reviews */}
                                <div className={`${!isOwnProfile ? 'space-y-4' : 'md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6'}`}>
                                    {(!profile.reviews || profile.reviews.length === 0) && (
                                        <div className={`text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 ${isOwnProfile ? 'md:col-span-2' : ''}`}>
                                            <Star size={40} className="mx-auto mb-3 opacity-10" />
                                            <p className="text-gray-400 font-bold">Aucun avis pour le moment.</p>
                                        </div>
                                    )}

                                    {profile.reviews?.slice(0, 4).map((review) => {
                                        const canDelete = (user?.id === review.author?.id) || isAdmin;
                                        return (
                                            <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-gray-100 overflow-hidden shadow-inner">
                                                            {review.author?.image ? <img src={review.author.image} alt="" className="w-full h-full object-cover" /> : <User className="m-2.5 text-gray-300" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-gray-900 text-sm truncate">{review.author?.name}</p>
                                                            <div className="flex text-yellow-400 mt-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={10} className={i < review.rating ? "fill-current" : "text-gray-200"} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {canDelete && (
                                                        <button
                                                            title="Supprimer cet avis"
                                                            onClick={async () => { if (confirm('Supprimer cet avis?')) await deleteReview(review.id); }}
                                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 italic">&quot;{review.text}&quot;</p>
                                                <p className="text-[9px] font-black text-gray-300 uppercase mt-3" suppressHydrationWarning>{formatDate(review.createdAt)}</p>
                                            </div>
                                        );
                                    })}

                                    {profile.reviews && profile.reviews.length > 4 && (
                                        <button className="w-full py-4 text-xs font-black text-gray-400 hover:text-[var(--marketing-orange)] uppercase tracking-widest border-t border-gray-50 transition-colors">
                                            Voir les {profile.reviews.length - 4} autres avis
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main >
    );
}
