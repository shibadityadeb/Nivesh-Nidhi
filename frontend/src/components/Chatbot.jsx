import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { sendChatMessage, getChatbotContext } from '../lib/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !userContext) {
      loadContext();
    }
  }, [isOpen]);

  const loadContext = async () => {
    try {
      const response = await getChatbotContext();
      if (response.success) {
        setUserContext(response.data);
        const welcomeMessage = {
          role: 'assistant',
          content: response.data.isAuthenticated
            ? `Hi ${response.data.userName}! 👋 I'm Nidhi AI. How can I help you today?`
            : `Hello! 👋 I'm Nidhi AI, your chit fund assistant. How can I help you today?`,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to load context:', error);
      setMessages([{
        role: 'assistant',
        content: `Hello! 👋 I'm Nidhi AI. How can I help you today?`,
        timestamp: new Date(),
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        }))
        .slice(-10);

      const response = await sendChatMessage(inputMessage, conversationHistory);

      if (response.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 rounded-full bg-transparent p-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 z-50 border-0"
        aria-label="Open Nidhi AI Chatbot"
      >
        <img
          src="/chatbot.png"
          alt="Chatbot"
          className="w-20 h-20 rounded-full object-cover"
        />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-3.5 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2.5">
          <img src="/chatbot.png" alt="Nidhi AI" className="w-9 h-9 rounded-full object-cover" />
          <div>
            <h3 className="font-semibold text-foreground text-sm">Nidhi AI</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online now
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          aria-label="Close chatbot"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-secondary/5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <img src="/chatbot.png" alt="AI" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
            )}
            <div
              className={`max-w-[75%] rounded-xl px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm'
                  : message.isError
                  ? 'bg-red-50 text-red-900 border border-red-100 rounded-bl-sm'
                  : 'bg-card text-card-foreground shadow-sm border border-border rounded-bl-sm'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <img src="/chatbot.png" alt="AI" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
            <div className="bg-card rounded-xl rounded-bl-sm px-3 py-2 shadow-sm border border-border">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 text-sm border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/90 text-primary-foreground flex items-center justify-center hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">Powered by Team Async</p>
      </div>
    </div>
  );
};

export default Chatbot;
