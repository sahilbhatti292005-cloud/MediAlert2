
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const Support: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Hello! I'm your MediAlert assistant. 👋 How can I help you today?", 
      sender: 'bot', 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const responses: Record<string, string> = {
    "hi": "Hello! I am your MediAlert assistant. How can I help you today?",
    "hello": "Hello! I am your MediAlert assistant. How can I help you today?",
    "bye": "Goodbye! Don't forget to take your medicine on time!",
    "how to use": "MediAlert helps you track your medication. You can add reminders and see your dose history.",
    "add medicine": "To add a medicine: 1. Click 'Add Medicine' in the menu. 2. Enter the name, dosage, and frequency. 3. Save it!",
    "delete medicine": "To delete a medicine: go to the Dashboard and click the trash icon (🗑️) on the medicine card.",
    "login problem": "Make sure you have registered an account first. If you're still stuck, try refreshing the page.",
    "default": "I'm not sure about that. Try asking 'how to use', 'add medicine', or 'login problem'."
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = input.toLowerCase().trim();
    setInput('');

    // Simulate bot delay
    setTimeout(() => {
      const replyText = responses[query] || responses["default"];
      const botMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        text: replyText,
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="font-bold">MediAlert Chat Support</h2>
          <p className="text-xs text-blue-100 italic">Always online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-100'
                  : 'bg-slate-100 text-slate-700 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2 bg-slate-50">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something... (e.g. 'how to use')"
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Support;
