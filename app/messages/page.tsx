'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useMessages } from '@/context/MessagesContext';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Send, User, Loader2, ArrowLeft, Mail, Check, CheckCheck } from 'lucide-react';

function formatTimeAgo(dateString: string | Date) {
    const diff = Math.max(0, Date.now() - new Date(dateString).getTime());
    const min = Math.floor(diff / 60000);
    if (min === 0) return "à l'instant";
    if (min < 60) return `${min} min`;
    const hs = Math.floor(min / 60);
    if (hs < 24) return `${hs} h`;
    return `${Math.floor(hs / 24)} j`;
}

function MessagesContent() {
    const {
        conversations,
        activeConversationId,
        setActiveConversationId,
        activeMessages,
        sendMessage,
        updateTyping,
        isLoading
    } = useMessages();
    const { user } = useAuth();
    const searchParams = useSearchParams();

    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial load from URL params
    useEffect(() => {
        const convId = searchParams.get('conv');
        if (convId && !activeConversationId) {
            setActiveConversationId(convId);
        } else if (conversations.length > 0 && !activeConversationId && !convId) {
            setActiveConversationId(conversations[0].id);
        }
    }, [searchParams, conversations, activeConversationId, setActiveConversationId]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeMessages]);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    const isPartnerTyping = () => {
        if (!activeConversation || !activeConversation.partnerLastTypedAt) return false;
        const typedAt = new Date(activeConversation.partnerLastTypedAt).getTime();
        return (Date.now() - typedAt) < 3000; // valid for 3 seconds
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        // Handle Typing indicator
        updateTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            updateTyping(false);
        }, 1500);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (activeConversationId && newMessage.trim()) {
            updateTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            await sendMessage(newMessage);
            setNewMessage('');
        }
    };

    if (isLoading && conversations.length === 0) {
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
        <main className="min-h-screen bg-[var(--sand-50)] pt-[5rem] md:pt-[6rem] pb-4 h-[100dvh] md:h-screen overflow-hidden flex flex-col">
            <div className="max-w-6xl mx-auto px-2 md:px-4 h-full w-full flex-1 flex">
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 overflow-hidden w-full flex flex-col md:flex-row h-full">

                    {/* Left Side: Conversation List */}
                    <div className={`${activeConversationId && 'hidden md:flex'} w-full md:w-1/3 lg:w-[350px] border-r border-gray-100 flex flex-col bg-white shrink-0`}>
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Discussions</h2>
                            <div className="w-8 h-8 rounded-full bg-[var(--marketing-orange)]/10 text-[var(--marketing-orange)] flex items-center justify-center font-bold text-sm">
                                {conversations.length}
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-2 space-y-1">
                            {conversations.map(conv => {
                                const unread = conv.unreadCount > 0;
                                const isTyping = conv.partnerLastTypedAt && (Date.now() - new Date(conv.partnerLastTypedAt).getTime() < 3000);

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => {
                                            setActiveConversationId(conv.id);
                                            window.history.pushState(null, '', `/messages?conv=${conv.id}`);
                                        }}
                                        className={`w-full p-3 rounded-2xl flex items-center gap-4 transition-all text-left ${activeConversationId === conv.id ? 'bg-[var(--marketing-orange)]/5 border-transparent' : 'bg-transparent hover:bg-gray-50'}`}
                                    >
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                                {conv.partnerImage ? (
                                                    <img src={conv.partnerImage} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-xl">{conv.partnerName.charAt(0)}</div>
                                                )}
                                            </div>
                                            {unread && <div className="absolute top-0 right-0 w-4 h-4 bg-[var(--marketing-orange)] rounded-full border-2 border-white flex items-center justify-center pointer-events-none text-[8px] text-white font-bold">{conv.unreadCount > 9 ? '9+' : conv.unreadCount}</div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className={`font-bold truncate text-base ${unread ? 'text-gray-900' : 'text-gray-800'}`}>{conv.partnerName}</h4>
                                                {conv.lastMessage && <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap ml-2">
                                                    {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>}
                                            </div>
                                            <p className={`text-sm truncate ${unread ? 'font-semibold text-gray-900' : 'text-gray-500'} ${isTyping ? 'text-[var(--marketing-orange)] italic' : ''}`}>
                                                {isTyping ? 'est en train d\'écrire...' : (
                                                    conv.lastMessage ? (
                                                        (conv.lastMessage.senderId === user.id ? 'Vous: ' : '') + conv.lastMessage.content
                                                    ) : 'Nouvelle conversation'
                                                )}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}

                            {conversations.length === 0 && (
                                <div className="p-8 text-center text-gray-400">
                                    <Mail className="mx-auto mb-4 opacity-20" size={48} />
                                    <p className="font-medium text-gray-600">Aucune conversation</p>
                                    <p className="text-sm mt-2 text-gray-400">Contactez un créateur depuis son profil pour échanger.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Chat Area */}
                    <div className={`${!activeConversationId && 'hidden md:flex'} flex-1 flex flex-col bg-gray-50/50 relative overflow-hidden`}>
                        {activeConversationId && activeConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center gap-3 z-10 sticky top-0">
                                    <button onClick={() => {
                                        setActiveConversationId(null);
                                        window.history.pushState(null, '', `/messages`);
                                    }} className="md:hidden text-gray-400 hover:text-gray-600 p-2 -ml-2 rounded-full transition-colors" title="Retour">
                                        <ArrowLeft size={24} />
                                    </button>
                                    <Link href={`/network/${activeConversation.partnerId}`} className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden shrink-0 border-2 border-white shadow-sm transform hover:scale-105 transition-transform">
                                        {activeConversation.partnerImage ? (
                                            <img src={activeConversation.partnerImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold">{activeConversation.partnerName.charAt(0)}</div>
                                        )}
                                    </Link>
                                    <div className="flex-1">
                                        <Link href={`/network/${activeConversation.partnerId}`} className="hover:text-[var(--marketing-orange)] transition-colors">
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{activeConversation.partnerName}</h3>
                                        </Link>
                                        <p className={`text-xs font-semibold flex items-center gap-1 ${activeConversation.isPartnerOnline ? 'text-[var(--marketing-green)]' : 'text-gray-500'}`}>
                                            <span className={`w-2 h-2 rounded-full ${activeConversation.isPartnerOnline ? 'bg-[var(--marketing-green)] animate-pulse shadow-[0_0_8px_var(--marketing-green)]' : 'bg-red-500'}`}></span>
                                            {activeConversation.isPartnerOnline ? 'En ligne' : (activeConversation.partnerLastSeen ? `Vu(e) il y a ${formatTimeAgo(activeConversation.partnerLastSeen)}` : 'Hors ligne')}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col">
                                    {activeMessages.map((msg, i) => {
                                        const isMe = msg.senderId === user.id;

                                        // Animation logic: only animate latest messages if they drop in
                                        const isLastMessage = i === activeMessages.length - 1;
                                        const animationClass = isLastMessage ? 'animate-pulse' : '';

                                        return (
                                            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${animationClass}`}>
                                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`max-w-[280px] md:max-w-[400px] text-[15px] p-[14px] shadow-sm transform transition-all ${isMe ? 'bg-gradient-to-br from-[var(--marketing-orange)] to-orange-500 text-white rounded-[24px] rounded-br-sm' : 'bg-white text-gray-800 rounded-[24px] rounded-bl-sm border border-gray-100'}`}>
                                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                    </div>

                                                    <div className="flex items-center gap-1 mt-1 opacity-60">
                                                        <span className="text-[10px] font-medium text-gray-500">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMe && (
                                                            <span className="text-gray-400">
                                                                {msg.isSeen ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Typing Indicator Bubble */}
                                    {isPartnerTyping() && (
                                        <div className="flex justify-start animate-bounce">
                                            <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex gap-1 items-center h-[42px] w-[64px]">
                                                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce cursor-default [animation-delay:0ms]"></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce cursor-default [animation-delay:150ms]"></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce cursor-default [animation-delay:300ms]"></span>
                                            </div>
                                        </div>
                                    )}

                                    {activeMessages.length === 0 && (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                                                <Send size={24} className="text-gray-300 ml-1" />
                                            </div>
                                            <p className="text-sm font-medium">Envoyez le premier message !</p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
                                    <form onSubmit={handleSend} className="flex gap-2 relative max-w-4xl mx-auto">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={handleMessageChange}
                                            placeholder="Écrivez un message..."
                                            className="flex-1 px-5 py-3.5 pr-14 rounded-full border border-gray-200 focus:outline-none focus:border-[var(--marketing-orange)] focus:ring-4 focus:ring-[var(--marketing-orange)]/10 bg-gray-50/50 hover:bg-white text-[15px] transition-all"
                                        />
                                        <button
                                            type="submit"
                                            title="Envoyer"
                                            disabled={!newMessage.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--marketing-orange)] text-white hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-md"
                                        >
                                            <Send size={16} className="ml-0.5" aria-hidden="true" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-sm border border-gray-50">
                                    <Mail size={40} className="text-gray-300" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-gray-900 font-bold mb-1 text-lg">Vos messages privés</h3>
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
