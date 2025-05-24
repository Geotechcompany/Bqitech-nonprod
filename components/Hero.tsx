"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { ArrowRight, ChevronDown } from "lucide-react";

interface VideoContent {
  url: string;
  overlay: string;
}

const heroContent = {
  videos: [
    {
      url: "/hero-background.mp4",
    },
    {
      url: "/hero2.mp4",
    },
    // {
    //   url: "/hero4.mp4",
    // }
  ] as VideoContent[],
  typeSequence: [
    
    "IT Solutions", 3000,
    "Gov't Technology", 3000
  ]
};

export function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [nextVideo, setNextVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextVideo((currentVideo + 1) % heroContent.videos.length);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentVideo(nextVideo);
        setIsTransitioning(false);
      }, 1000); // Smooth transition duration
    }, 8000);

    return () => clearInterval(interval);
  }, [currentVideo, nextVideo]);

  return (
    <section className="relative h-screen w-full overflow-hidden -mt-[64px]">
      {/* Video Background with Cross-fade Transitions */}
      <AnimatePresence mode="wait">
        {heroContent.videos.map((video, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentVideo ? 1 : 0,
              transition: { duration: 1.5, ease: "easeInOut" }
            }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${index === currentVideo ? 'z-10' : 'z-0'}`}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                transform: "scale(1.1)",
                transition: "transform 8s ease-out"
              }}
            >
              <source src={video.url} type="video/mp4" />
            </video>
            <div className={`absolute inset-0 ${video.overlay} transition-opacity duration-1000`} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Animated Grid Pattern Overlay */}
      <motion.div
        className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-20"
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{ backgroundPosition: "100% 100%" }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Hero Content */}
      <div className="relative h-full flex flex-col justify-center items-center px-4 z-20 pt-16 sm:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.span
            className="inline-block text-[#31CDFF] text-base sm:text-lg md:text-xl font-semibold tracking-wider mb-2 sm:mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            WELCOME TO BQI TECH
          </motion.span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 text-white">
            Pioneering{" "}
            <span className="bg-gradient-to-r from-[#31CDFF] to-purple-600 text-transparent bg-clip-text">
              <TypeAnimation
                sequence={heroContent.typeSequence}
                wrapper="span"
                cursor={true}
                repeat={Infinity}
              />
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto">
            Empowering government agencies with secure,scalable and innovative IT solutions to drive digital transformation
            
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link
              href="/about"
              className="group w-full sm:w-auto bg-[#31CDFF] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold 
                       hover:bg-white hover:text-[#31CDFF] transition-all duration-300 
                       flex items-center justify-center gap-2 shadow-lg shadow-[#31CDFF]/20"
            >
              Get Started Today
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/services"
              className="text-white hover:text-[#31CDFF] font-medium transition-colors duration-300 text-sm sm:text-base"
            >
              Explore Our Services
            </Link>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
        </motion.div>
      </div>
    </section>
  );
}
