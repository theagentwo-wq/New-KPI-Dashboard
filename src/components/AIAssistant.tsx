import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';
import { Icon } from './Icon';
import { View, DataItem } from '../types';
import { callGeminiAPI } from '../lib/ai-client';

interface AIAssistantProps {
    periodLabel: string;
    currentView: View;
    allStoresData: { [storeId: string]: { actual: DataItem } };
    directorAggregates: { [directorName: string]: { aggregated: DataItem } };
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isLoading?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
    periodLabel,
    currentView,
    allStoresData,
    directorAggregates
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (message: string) => {
        if (!message.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
        };

        const loadingMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
            isLoading: true,
        };

        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setInputValue('');

        try {
            // Prepare context data for AI
            const contextData = {
                period: periodLabel,
                view: currentView,
                storesCount: Object.keys(allStoresData).length,
                directorsCount: Object.keys(directorAggregates).length,
            };

            // Call AI with user question and context
            const response = await callGeminiAPI('chatWithData', {
                question: message,
                context: contextData,
                allStoresData,
                directorAggregates,
            });

            // Parse markdown response
            const html = await marked.parse(response);

            // Replace loading message with actual response
            setMessages(prev =>
                prev.map(msg =>
                    msg.isLoading
                        ? { ...msg, content: html, isLoading: false }
                        : msg
                )
            );
        } catch (error) {
            console.error('[AIAssistant] Error:', error);
            const errorHtml = await marked.parse("I'm sorry, I encountered an error processing your request. Please try again.");
            setMessages(prev =>
                prev.map(msg =>
                    msg.isLoading
                        ? { ...msg, content: errorHtml, isLoading: false }
                        : msg
                )
            );
        }
    };

    const handleGenerateInsight = async () => {
        await handleSendMessage('Generate a comprehensive insight for this period, including top performers, areas needing attention, and key trends.');
    };

    const handleQuickQuestion = async (question: string) => {
        await handleSendMessage(question);
    };

    const handleClearChat = () => {
        setMessages([]);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputValue);
        }
    };

    const containerClass = isFullScreen
        ? "fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl p-8 flex flex-col overflow-hidden"
        : "bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col h-[600px] relative overflow-hidden before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-br before:from-cyan-500/30 before:via-blue-500/20 before:to-transparent before:-z-10 before:pointer-events-none";

    const renderContent = () => (
        <div className={containerClass}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
                <div>
                    <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2">
                        <Icon name="sparkles" className="w-5 h-5 text-cyan-400" />
                        AI Assistant
                    </h3>
                    <p className="text-xs text-slate-400">{currentView} • {periodLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <button
                            onClick={handleClearChat}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title="Clear chat"
                        >
                            <Icon name="trash" className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                        <Icon name={isFullScreen ? 'compress' : 'expand'} className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400">
                        <Icon name="bot" className="w-16 h-16 text-slate-600" />
                        <div>
                            <p className="text-sm font-medium text-slate-300">Welcome! I'm your AI Operations Assistant</p>
                            <p className="text-xs mt-1">Click "Generate Insight" or ask me anything below</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                        <Icon name="bot" className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] rounded-lg p-3 ${
                                    msg.role === 'user'
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-slate-700 text-slate-200'
                                }`}>
                                    {msg.isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                                        </div>
                                    ) : msg.role === 'user' ? (
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    ) : (
                                        <div
                                            className="prose prose-sm prose-invert max-w-none text-slate-200"
                                            dangerouslySetInnerHTML={{ __html: msg.content }}
                                        />
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                                        <Icon name="user" className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="flex-shrink-0 mb-3">
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                    <Icon name="zap" className="w-3 h-3" />
                    Quick Actions:
                </p>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleGenerateInsight}
                        className="px-3 py-1.5 text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-md transition-all duration-200 shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 hover:scale-105 flex items-center gap-1.5"
                    >
                        <Icon name="sparkles" className="w-3 h-3" />
                        Generate Insight
                    </button>
                    <button
                        onClick={() => handleQuickQuestion('What should I focus on this period?')}
                        className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                        What should I focus on?
                    </button>
                    <button
                        onClick={() => handleQuickQuestion('Compare to last period')}
                        className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                        Compare to last period
                    </button>
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 border-t border-slate-700 pt-3">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask anything... (or type /help)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:shadow-lg focus:shadow-cyan-500/10 transition-all duration-200"
                    />
                    <button
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={!inputValue.trim()}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2 font-semibold text-sm disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                        Send
                        <Icon name="send" className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    if (isFullScreen) {
        return createPortal(renderContent(), document.body);
    }
    return renderContent();
};
