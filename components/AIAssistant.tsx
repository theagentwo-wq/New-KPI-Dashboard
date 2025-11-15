import React, { useState, useRef, useEffect } from 'react';
import { getInsights, getTrendAnalysis } from '../services/geminiService';
import { View, Period, PerformanceData } from '../types';

interface AIAssistantProps {
  data: any;
  historicalData: { periodLabel: string; data: PerformanceData }[];
  view: View;
  period: Period;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ data, historicalData, view, period }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const defaultPrompts = [
    "Analyze Trends",
    "Which store is performing best in Sales?",
    "What's the biggest issue in my region?",
    "Summarize the prime cost performance.",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (query?: string) => {
    const userQuery = query || input;
    if (!userQuery.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: userQuery }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const aiResponse = await getInsights(data, view, period.label, userQuery);
    setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  const handleTrendAnalysis = async () => {
    if (isLoading) return;

    const userMessage = "Analyze trends for my key KPIs.";
    const newMessages: Message[] = [...messages, { sender: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    const aiResponse = await getTrendAnalysis(historicalData, view);
    setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  const handleDefaultPrompt = (prompt: string) => {
    if (prompt === "Analyze Trends") {
        handleTrendAnalysis();
    } else {
        handleSend(prompt);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-slate-800 rounded-lg border border-slate-700">
      <h3 className="text-lg font-bold text-cyan-400 p-4 border-b border-slate-700">AI Assistant</h3>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
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
      {messages.length === 0 && !isLoading && (
        <div className="p-4 grid grid-cols-2 gap-2">
            {defaultPrompts.map(prompt => (
                <button key={prompt} onClick={() => handleDefaultPrompt(prompt)} className="text-sm text-left p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300">
                    {prompt}
                </button>
            ))}
        </div>
      )}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about the data..."
            className="flex-1 bg-slate-900 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
            disabled={isLoading}
          />
          <button onClick={() => handleSend()} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};