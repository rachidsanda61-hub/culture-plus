'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useMessages } from '@/context/MessagesContext';
import { useProfiles } from '@/context/ProfilesContext';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Send, User, Loader2, ArrowLeft, Mail } from 'lucide-react';

function MessagesContent() {
    const { conversations, sendMessage, markAsRead, isLoading } = useMessages();
    const { getProfileById } = useProfiles();
    const { user } = useAuth();
    const searchParams = useSearchParams();

    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const withId = searchParams.get('with');
        if (withId) {
            setActiveConversationId(withId);
        } else if (conversations.length > 0 && !activeConversationId) {
            setActiveConversationId(conversations[0].partnerId);
        }
    }, [searchParams, conversations, activeConversationId]);

    useEffect(() => {
        if (activeConversationId) {
            markAsRead(activeConversationId);
        }
    }, [activeConversationId]);

    const activeConversation = conversations.find(c => c.partnerId === activeConversationId) || (
        activeConversationId ? { partnerId: activeConversationId, messages: [] } : null
    );

    const activeProfile = activeConversationId ? getProfileById(activeConversationId) : null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (activeConversationId && newMessage.trim()) {
            await sendMessage(activeConversationId, newMessage);
            setNewMessage('');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--sand-50)]">
                <Loader2 className="animate-spin text-[var(--marketing-orange)]" size={32} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-24 text-center bg-[var(--sand-50)]">
                <p className="mb-4 text-gray-500">Veuillez vous connecter pour voir vos messages.</p>
                <Button onClick={() => window.location.href = '/login'}>Se connecter</Button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--sand-50)] pt-20 pb-8 h-screen overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 h-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col md:flex-row">

                    {/* Sidebar: Liste des conversations */}
                    <div className={`${activeConversationId && 'hidden md:flex'} w-full md:w-1/3 border-r border-gray-100 flex flex-col bg-white`}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Messages</h2>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {conversations.sort((a, b) => {
                                const lastA = new Date(a.messages[a.messages.length - 1]?.createdAt || 0).getTime();
                                const lastB = new Date(b.messages[b.messages.length - 1]?.createdAt || 0).getTime();
                                return lastB - lastA;
                            }).map(conv => {
                                const profile = getProfileById(conv.partnerId);
                                const lastMsg = conv.messages[conv.messages.length - 1];
                                const unread = conv.messages.some(m => m.senderId === conv.partnerId && !m.read);

                                return (
                                    <button
                                        key={conv.partnerId}
                                        onClick={() => setActiveConversationId(conv.partnerId)}
                                        className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${activeConversationId === conv.partnerId ? 'bg-orange-50 hover:bg-orange-50' : ''}`}
                                    >
                                        <div className="relative">
                                            <Link href={`/network/${profile?.id}`} onClick={(e) => e.stopPropagation()} className="block w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 hover:opacity-80 transition-opacity">
                                                {profile?.image ? (
                                                    <img src={profile.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold">{profile?.name.charAt(0) || '?'}</div>
                                                )}
                                            </Link>
                                            {unread && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white pointer-events-none"></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className={`font-bold truncate ${unread ? 'text-black' : 'text-gray-700'}`}>{profile?.name || 'Artiste'}</h4>
                                                {lastMsg && <span className="text-[10px] text-gray-400 font-medium">{new Date(lastMsg.createdAt).toLocaleDateString()}</span>}
                                            </div>
                                            <p className={`text-sm truncate ${unread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                                {lastMsg ? (lastMsg.senderId === user.id ? 'Vous: ' : '') + lastMsg.content : 'Aucun message'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}

                            {conversations.length === 0 && (
                                <div className="p-12 text-center text-gray-400">
                                    <Mail className="mx-auto mb-4 opacity-20" size={48} />
                                    <p>Aucune conversation.</p>
                                    <p className="text-sm mt-2">Contactez un artiste depuis son profil pour commencer discuter.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`${!activeConversationId && 'hidden md:flex'} flex-1 flex flex-col bg-gray-50`}>
                        {activeConversationId ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
                                    <button onClick={() => setActiveConversationId(null)} className="md:hidden text-gray-400 p-1" title="Retour aux conversations">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <Link href={`/network/${activeProfile?.id}`} className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 hover:opacity-80 transition-opacity">
                                        {activeProfile?.image ? (
                                            <img src={activeProfile.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold">{activeProfile?.name.charAt(0) || <User size={18} />}</div>
                                        )}
                                    </Link>
                                    <div>
                                        <Link href={`/network/${activeProfile?.id}`} className="hover:underline">
                                            <h3 className="font-bold text-gray-900">{activeProfile?.name || 'Conversation'}</h3>
                                        </Link>
                                        <p className="text-[10px] text-[var(--marketing-green)] font-bold uppercase tracking-wider">En ligne</p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col">
                                    {activeConversation?.messages.map((msg, i) => {
                                        const isMe = msg.senderId === user.id;
                                        return (
                                            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${isMe ? 'bg-[var(--marketing-orange)] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                    <div className={`text-[9px] mt-1 text-right font-medium opacity-60`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {activeConversation?.messages.length === 0 && (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                                            <div className="p-4 bg-white rounded-full shadow-sm">
                                                <Send size={24} className="text-gray-200" />
                                            </div>
                                            <p className="text-sm">Envoyez le premier message !</p>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-gray-100">
                                    <form onSubmit={handleSend} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Écrivez votre message..."
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 bg-gray-50 text-sm"
                                        />
                                        <Button className="px-5 rounded-xl shadow-lg shadow-[var(--marketing-orange)]/20" disabled={!newMessage.trim()}>
                                            <Send size={18} />
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-200">
                                    <User size={40} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-gray-900 font-bold mb-1">Vos conversations</h3>
                                    <p className="text-sm">Sélectionnez une discussion pour commencer à échanger.</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}



export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--sand-50)]"><Loader2 className="animate-spin text-[var(--marketing-orange)]" size={32} /></div>}>
            <MessagesContent />
        </Suspense>
    );
}
