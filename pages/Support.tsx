
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
      text: "Hello! I'm your MediAlert assistant. 👋 Need help with something?", 
      sender: 'bot', 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const responses = [
    { 
      keywords: ["hi", "hello", "hey", "greet", "hiii"], 
      replies: [
        "Hello! How can I help you today?",
        "Hi there! What's on your mind?",
        "Hey! Ready to manage your medicines?"
      ] 
    },
    { 
      keywords: ["bye", "goodbye", "cya", "exit"], 
      replies: [
        "Goodbye! Stay healthy!",
        "Bye! Don't forget your doses!",
        "See you later! I'll be here if you need me."
      ] 
    },
    { 
      keywords: ["how", "use", "app", "tutorial", "help"], 
      replies: [
        "MediAlert helps you track your medication. You can add reminders in the 'Add' tab.",
        "It's simple: Add your medicine details, and I will remind you when it's time!",
        "Check your Dashboard for daily meds and History for what you've already taken."
      ] 
    },
    { 
      keywords: ["add", "medicine", "reminder", "new"], 
      replies: [
        "To add a medicine: Click 'Add Medicine' in the menu, fill the form, and save!",
        "Adding meds is easy. Just look for the Plus icon (+) in the menu.",
        "Navigate to the 'Add' page to set up a new reminder schedule."
      ] 
    },
    { 
      keywords: ["delete", "remove", "trash", "clear"], 
      replies: [
        "To delete: Go to Dashboard and click the red trash icon on any medicine card.",
        "You can remove reminders by clicking 'Delete' in the Dashboard view.",
        "Want to clear a dose? Use the trash icon on your Dashboard."
      ] 
    },
    { 
      keywords: ["login", "signin", "auth", "problem", "error"], 
      replies: [
        "Check your internet and make sure your password is correct.",
        "If you can't log in, try the 'Register' tab to create a new account.",
        "Auth issues? Make sure you verified your email if required."
      ] 
    }
  ];

  const fallbacks = [
    "I'm not quite sure I follow. Could you try rephrasing that?",
    "Hmm, I didn't get that. Try asking about 'adding medicine' or 'help'.",
    "I'm still learning! Could you try a different question?",
    "Sorry, I don't recognize that request. Ask me 'how to use' for a start."
  ];

  // Helper: Normalize input (e.g., "hiiiiii" -> "hi")
  const normalizeInput = (text: string) => {
    // Replace 3 or more repeated characters with a single one
    return text.toLowerCase().replace(/(.)\1{2,}/g, '$1').trim();
  };

  const getLevenshteinDistance = (a: string, b: string) => {
    const matrix = Array.from({ length: a.length + 1 }, () => 
      Array.from({ length: b.length + 1 }, (_, i) => i)
    );
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[a.length][b.length];
  };

  const getBestResponse = (userInput: string) => {
    const cleanInput = normalizeInput(userInput);
    const rawWords = cleanInput.replace(/[?.,!]/g, "").split(/\s+/);
    
    let bestMatch = { replies: fallbacks, score: 0 };

    responses.forEach(item => {
      let currentScore = 0;
      item.keywords.forEach(keyword => {
        if (rawWords.includes(keyword)) currentScore += 10;
        rawWords.forEach(word => {
          const distance = getLevenshteinDistance(word, keyword);
          if (word.length > 3 && distance === 1) currentScore += 5;
        });
      });

      if (currentScore > bestMatch.score && currentScore > 0) {
        bestMatch = { replies: item.replies, score: currentScore };
      }
    });

    // Return a random reply from the chosen set
    const selectedReplies = bestMatch.replies;
    return selectedReplies[Math.floor(Math.random() * selectedReplies.length)];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInputText = input;
    setInput('');
    setIsTyping(true);

    // Simulate natural typing delay
    setTimeout(() => {
      const replyText = getBestResponse(userInputText);
      const botMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        text: replyText,
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold">Chat Support</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-[10px] text-blue-100 uppercase font-black tracking-widest">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-100 font-medium'
                  : 'bg-white text-slate-700 rounded-bl-none border border-slate-100 shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          disabled={isTyping}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isTyping ? "Support is typing..." : "Type a message..."}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:shadow-none"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Support;
