"use client";
import { useState } from "react";
import { MessageCircle, Send, X, Minus, Plus } from "lucide-react";

export default function WeatherChatbot({ weatherData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your weather assistant. Ask me anything about the current weather conditions.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          weatherData: weatherData,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botReply = {
        sender: "bot",
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorReply = {
        sender: "bot",
        text: "I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div
          className={`bg-white text-gray-900 rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${
            isMinimized ? "w-80 h-14" : "w-96 h-[28rem]"
          } flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center">
                <MessageCircle size={16} />
              </div>
              <div>
                <h3 className="font-medium text-sm">Weather Assistant</h3>
                {!isMinimized && (
                  <p className="text-xs text-slate-300">
                    AI-powered weather help
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-slate-300 hover:text-white transition-colors p-1.5 rounded hover:bg-slate-700"
              >
                {isMinimized ? <Plus size={14} /> : <Minus size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white transition-colors p-1.5 rounded hover:bg-slate-700"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] ${
                        msg.sender === "user"
                          ? "bg-slate-700 text-white rounded-lg rounded-br-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-lg rounded-bl-sm shadow-sm"
                      } px-3 py-2`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <span
                        className={`text-xs mt-1 block ${
                          msg.sender === "user"
                            ? "text-slate-300"
                            : "text-gray-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg rounded-bl-sm shadow-sm px-3 py-2 max-w-[85%]">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">Typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 border border-gray-200 focus-within:border-slate-400 focus-within:bg-white transition-all">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !isLoading && handleSend()
                    }
                    placeholder="Ask about the weather..."
                    className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500 px-1"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      isLoading || !input.trim()
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-white bg-slate-700 hover:bg-slate-800 shadow-sm hover:shadow-md"
                    }`}
                    disabled={isLoading || !input.trim()}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 hover:bg-slate-700"
        >
          <MessageCircle size={20} />
        </button>
      )}
    </div>
  );
}
