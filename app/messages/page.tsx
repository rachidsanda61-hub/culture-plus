
'use client';

import React, { useState, useEffect } from 'react';
import { useMessages } from '@/context/MessagesContext';
import { useProfiles } from '@/context/ProfilesContext';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Send, User } from 'lucide-react';

export default function MessagesPage() {
    const { conversations, sendMessage, markAsRead } = useMessages();
    const { getProfileById } = useProfiles();
    const searchParams = useSearchParams();

    // Le hash ou query param pourrait être utilisé pour pré-sélectionner une conv
    // Simplification : on utilise l'état local
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');

    // Effet pour ouvrir une conversation si demandé via URL (ex: "Contacter" depuis profil)
    useEffect(() => {
        const withId = searchParams.get('with');
        if (withId) {
            setActiveConversationId(withId);
        } else if (conversations.length > 0 && !activeConversationId) {
            setActiveConversationId(conversations[0].partnerId);
        }
    }, [searchParams, conversations, activeConversationId]);

    // Marquer comme lu quand on change de conversation active
    useEffect(() => {
        if (activeConversationId) {
            markAsRead(activeConversationId);
        }
    }, [activeConversationId, markAsRead]); // markAsRead dependency might loops if not stable, but ok here

    const activeConversation = conversations.find(c => c.partnerId === activeConversationId) || (
        activeConversationId ? { partnerId: activeConversationId, messages: [] } : null
    );

    const activeProfile = activeConversationId ? getProfileById(activeConversationId) : null;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeConversationId && newMessage.trim()) {
            sendMessage(activeConversationId, newMessage);
            setNewMessage('');
        }
    };

    return (
        <main className="min-h-screen bg-[var(--sand-50)] py-8 h-[calc(100vh-64px)]">
            <div className="max-w-6xl mx-auto px-4 h-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex">

                    {/* Sidebar: Liste des conversations */}
                    <div className="w-1/3 border-r border-gray-100 flex flex-col">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold">Messages</h2>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {conversations.map(conv => {
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
                                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                {profile?.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={profile.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-white font-bold">{profile?.name.charAt(0)}</div>
                                                )}
                                            </div>
                                            {unread && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className={`font-bold truncate ${unread ? 'text-black' : 'text-gray-700'}`}>{profile?.name || conv.partnerId}</h4>
                                                <span className="text-xs text-gray-400">{new Date(lastMsg.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className={`text-sm truncate ${unread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                                {lastMsg.senderId === 'me' ? 'Vous: ' : ''}{lastMsg.content}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}

                            {conversations.length === 0 && (
                                <div className="p-8 text-center text-gray-400">
                                    Aucune conversation. <br /> Contactez un artiste depuis son profil !
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-gray-50">
                        {activeConversationId ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                        {activeProfile?.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={activeProfile.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-white font-bold">{activeProfile?.name.charAt(0) || <User />}</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{activeProfile?.name || 'Utilisateur Inconnu'}</h3>
                                        <p className="text-xs text-[var(--marketing-green)] font-medium">En ligne</p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
                                    {activeConversation?.messages.map((msg, i) => {
                                        const isMe = msg.senderId === 'me';
                                        return (
                                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl p-4 ${isMe ? 'bg-[var(--marketing-orange)] text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}>
                                                    <p>{msg.content}</p>
                                                    <div className={`text-xs mt-1 text-right opacity-70`}>
                                                        {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-gray-100">
                                    <form onSubmit={handleSend} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Écrivez votre message..."
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)] bg-gray-50"
                                        />
                                        <Button className="px-4" disabled={!newMessage.trim()}>
                                            <Send size={20} />
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                    <User size={32} />
                                </div>
                                <p>Sélectionnez une conversation pour commencer</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
