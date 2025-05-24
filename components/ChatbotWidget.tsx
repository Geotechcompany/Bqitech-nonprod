"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsLoading(true);
      setIsFullyLoaded(false);
    }
  };

  // Handle iframe load completion
  const handleIframeLoad = () => {
    // Add a slight delay to ensure content is fully rendered
    setTimeout(() => {
      setIsLoading(false);
      // Add additional delay for smooth transition
      setTimeout(() => {
        setIsFullyLoaded(true);
      }, 500);
    }, 1500);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-[400px] rounded-lg shadow-lg bg-white overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#272055] to-[#31CDFF]">
              <h3 className="text-white font-semibold">Chat with us</h3>
              <button
                onClick={toggleChat}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Skeleton Loader */}
            {!isFullyLoaded && (
              <div className="p-4 space-y-4">
                <div className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-3 animate-pulse justify-end">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-2/3 ml-auto" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 ml-auto" />
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                </div>
                <div className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
                {/* Additional skeleton messages for more realistic loading */}
                <div className="flex gap-3 animate-pulse justify-end">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4 ml-auto" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 ml-auto" />
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                </div>
                <div className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                    <div className="h-3 bg-gray-200 rounded w-3/5" />
                  </div>
                </div>
              </div>
            )}

            {/* Chatbot iframe */}
            <div className={`transition-opacity duration-500 ${isFullyLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <iframe
                src="https://app.thinkstack.ai/bot/index.html?chatbot_id=67334193bde936bef06b2d4a"
                className="w-full border-0"
                style={{ minHeight: "500px" }}
                onLoad={handleIframeLoad}
              />
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleChat}
            className="p-3 bg-gradient-to-r from-[#272055] to-[#31CDFF] rounded-full shadow-lg 
                     hover:shadow-xl transition-all duration-300"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
