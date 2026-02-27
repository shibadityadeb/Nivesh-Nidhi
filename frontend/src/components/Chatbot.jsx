import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
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
        // Add welcome message
        let welcomeMessage;
        if (response.data.isAuthenticated) {
          welcomeMessage = {
            role: 'assistant',
            content: `Hello ${response.data.userName}! I'm Nidhi AI, your intelligent assistant for managing your chit fund activities. ${
              (response.data.role === 'USER' || response.data.role === 'MEMBER')
                ? "I can help you with your chit memberships, payment history, and escrow balance."
                : "I can help you manage your organizations, monitor chit groups, and review member activities."
            } How can I assist you today?`,
            timestamp: new Date(),
          };
        } else {
          welcomeMessage = {
            role: 'assistant',
            content: `Hello! I'm Nidhi AI, your intelligent assistant for chit fund information. I can help answer your questions about how chit funds work, provide guidance on managing chit groups, and assist with general inquiries. To access personalized features and manage your accounts, please log in. How can I help you today?`,
            timestamp: new Date(),
          };
        }
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to load context:', error);
      // Continue even if context loading fails
      const defaultMessage = {
        role: 'assistant',
        content: `Hello! I'm Nidhi AI, your intelligent assistant for chit fund information. How can I help you today?`,
        timestamp: new Date(),
      };
      setMessages([defaultMessage]);
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
      // Prepare conversation history for API
      const conversationHistory = messages
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        }))
        .slice(-10); // Keep last 10 messages for context

      const response = await sendChatMessage(inputMessage, conversationHistory);

      if (response.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          actionIntent: response.data.actionIntent,
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
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
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

  const formatMessage = (content) => {
    // Handle JSON action intents
    try {
      const jsonMatch = content.match(/\{[\s\S]*"intent"[\s\S]*\}/);
      if (jsonMatch) {
        const json = JSON.parse(jsonMatch[0]);
        const textPart = content.replace(jsonMatch[0], '').trim();
        return (
          <>
            {textPart && <p className="mb-2">{textPart}</p>}
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Action Required: {json.action}
              </p>
              <p className="text-sm text-blue-700">{json.message}</p>
            </div>
          </>
        );
      }
    } catch (e) {
      // Not a JSON response, render as is
    }

    // Format regular text with line breaks
    return content.split('\n').map((line, i) => (
      <p key={i} className="mb-1">
        {line}
      </p>
    ));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full bg-transparent p-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50 group border-0"
        aria-label="Open Nidhi AI Chatbot"
      >
        <img
          src="/chatbot.png"
          alt="Chatbot"
            className="w-32 h-32 rounded-full object-cover"
        />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          AI
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full">
            <img src="/chatbot.png" alt="Chatbot" className="w-10 h-10 rounded-full" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Nidhi AI</h3>
            <p className="text-xs text-blue-100">
              {userContext?.role === 'MEMBER' ? 'Member Assistant' : 'Organizer Assistant'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 p-2 rounded-full transition-colors"
          aria-label="Close chatbot"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
                <img src="/chatbot.png" alt="AI" className="w-8 h-8 rounded-full" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : message.isError
                  ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-none'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-none'
              }`}
            >
              <div className="text-sm">{formatMessage(message.content)}</div>
              <div
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
              <img src="/chatbot.png" alt="AI" className="w-8 h-8 rounded-full" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-200">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Powered by Claude AI • Secure & Compliant
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
