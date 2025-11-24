
import React, { useState, useRef, useEffect } from 'react';
import { getInsights, getTrendAnalysis } from '../services/geminiService';
import { View, Period, PerformanceData, HistoricalData } from '../types';
import { marked } from 'marked';
import { Icon } from './Icon';

interface AIAssistantProps {
  data: any;
  historicalData: HistoricalData[];
  view: View;
  period: Period;
  userLocation: { latitude: number; longitude: number } | null;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  html?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ data, historicalData, view, period, userLocation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const defaultPrompts = [
    "Analyze Trends",
    "Which 3 stores had the biggest positive variance vs prior period in SOP?",
    "Which of my stores are near a convention center?",
    "What are recent google reviews saying about my Omaha location?",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const processAIResponse = async (text: string): Promise<Message> => {
    // FIX: Add error handling for markdown parsing
    try {
      const html = await marked.parse(text);
      return { sender: 'ai', text, html };
    } catch (e) {
      console.error("Markdown parsing error:", e);
      // Fallback to plain text if parsing fails
      return { sender: 'ai', text }; 
    }
  }

  // FIX: Refactored to use functional state updates for robustness.
  const handleSend = async (query?: string) => {
    const userQuery = query || input;
    if (!userQuery.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: userQuery };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponseText = await getInsights(data, view, period.label, userQuery, userLocation);
      const aiResponse = await processAIResponse(aiResponseText);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI Insight Error:", error);
      const errorResponse = await processAIResponse("I'm sorry, but I was unable to process that request.");
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: Refactored to use functional state updates for robustness.
  const handleTrendAnalysis = async () => {
    if (isLoading) return;

    const userMessage: Message = { sender: 'user', text: "Analyze trends for my key KPIs." };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
        const aiResponseText = await getTrendAnalysis(historicalData, view);
        const aiResponse = await processAIResponse(aiResponseText);
        setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
        console.error("AI Trend Analysis Error:", error);
        const errorResponse = await processAIResponse('Sorry, I encountered an error during trend analysis.');
        setMessages(prev => [...prev, errorResponse]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDefaultPrompt = (prompt: string) => {
    if (prompt === "Analyze Trends") {
        handleTrendAnalysis();
    } else {
        handleSend(prompt);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2">
          <Icon name="sparkles" className="w-5 h-5 text-cyan-400"/>
          AI Assistant
        </h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && !isLoading && (
            <div className="text-center text-slate-400">
                <p className="mb-4">Or ask me a question about the data below.</p>
            </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
              {msg.html ? (
                <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: msg.html }}></div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-slate-700 text-slate-200 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
       <div className="px-4 pb-2">
          <div className="grid grid-cols-2 gap-2 mb-2">
              {defaultPrompts.map(prompt => (
                  <button key={prompt} onClick={() => handleDefaultPrompt(prompt)} disabled={isLoading} className="text-xs text-left p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      {prompt}
                  </button>
              ))}
          </div>
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about the data..."
            className="flex-1 bg-slate-900 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
            disabled={isLoading}
          />
          <button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
