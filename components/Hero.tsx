"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { ArrowRight, ChevronDown } from "lucide-react";

interface HeroContent {
  images: {
    url: string;
    overlay: string;
  }[];
  typeSequence: (string | number)[];
}

const heroContent: HeroContent = {
  images: [
    {
      url: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?auto=format&fit=crop&q=80",
      overlay: "bg-gradient-to-r from-[#0B0F19]/70 to-[#0B0F19]/50"
    },
    {
      url: "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&q=80",
      overlay: "bg-gradient-to-r from-[#0B0F19]/65 to-[#0B0F19]/50"
    },
    {
      url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80",
      overlay: "bg-gradient-to-r from-[#0B0F19]/65 to-[#0B0F19]/55"
    },
    {
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
      overlay: "bg-gradient-to-r from-[#0B0F19]/60 to-[#0B0F19]/50"
    },
    {
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80",
      overlay: "bg-gradient-to-r from-[#0B0F19]/60 to-[#0B0F19]/50"
    }
  ],
  typeSequence: [
    "IT Solutions", 3000,
    "Gov't Technology", 3000,
    "Digital Innovation", 3000,
    "Secure Systems", 3000
  ]
};

const AnimatedText = ({ text }: { text: string }) => {
  return (
    <span className="inline-block overflow-visible">
      <motion.span
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="inline-block"
      >
        {text}
      </motion.span>
    </span>
  );
};

export function Hero() {
  const [currentImage, setCurrentImage] = useState(0);
  const [nextImage, setNextImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextImage((currentImage + 1) % heroContent.images.length);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImage(nextImage);
        setIsTransitioning(false);
      }, 1000);
    }, 8000);

    return () => clearInterval(interval);
  }, [currentImage, nextImage]);

  return (
    <section className="relative h-screen w-full overflow-hidden -mt-[80px]">
      {/* Image Background with Cross-fade Transitions */}
      <AnimatePresence mode="wait">
        {heroContent.images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentImage ? 1 : 0,
              transition: { duration: 1.5, ease: "easeInOut" }
            }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${index === currentImage ? 'z-10' : 'z-0'}`}
          >
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${image.url})`,
                transform: "scale(1.05)",
                transition: "transform 8s ease-out"
              }}
            />
            <div className={`absolute inset-0 ${image.overlay} transition-opacity duration-1000`} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Updated Hero Content */}
      <motion.div
        className="relative h-full flex flex-col justify-center items-center px-4 z-20 pt-16 sm:pt-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          className="text-center max-w-6xl mx-auto"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut",
              delay: 0.5 
            }}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#31CDFF] animate-pulse" />
            <span className="text-[#31CDFF] font-semibold tracking-wider text-sm sm:text-base">
              TRANSFORMING GOVERNMENT TECHNOLOGY
            </span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 text-white leading-tight">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="block"
            >
              <AnimatedText text="Building The Future of" />{" "}
            </motion.div>
            <span className="bg-gradient-to-r from-[#31CDFF] via-blue-400 to-purple-500 text-transparent bg-clip-text">
              <TypeAnimation
                sequence={heroContent.typeSequence}
                wrapper="span"
                cursor={true}
                repeat={Infinity}
                speed={35}
                deletionSpeed={50}
                style={{ display: 'inline-block' }}
              />
            </span>
          </h1>

          <motion.p
            className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-8 sm:mb-10 max-w-4xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Empowering government agencies with{" "}
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-white font-normal"
            >
              secure, scalable,
            </motion.span>{" "}
            and{" "}
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="text-white font-normal"
            >
              innovative solutions
            </motion.span>{" "}
            to drive digital transformation
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Link
              href="/about"
              className="group w-full sm:w-auto bg-gradient-to-r from-[#31CDFF] to-blue-600 text-white 
                       px-8 sm:px-10 py-4 sm:py-5 rounded-full font-semibold text-lg
                       hover:shadow-[0_0_30px_rgba(49,205,255,0.3)] transition-all duration-300 
                       flex items-center justify-center gap-3"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/services"
              className="group w-full sm:w-auto border-2 border-white/20 bg-white/5 backdrop-blur-sm
                       hover:border-[#31CDFF]/40 hover:bg-[#31CDFF]/5
                       text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-semibold text-lg
                       transition-all duration-300 flex items-center justify-center gap-3"
            >
              Explore Services
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-white/60 text-sm font-medium tracking-wider">SCROLL DOWN</span>
          <ChevronDown className="w-5 h-5 text-[#31CDFF]" />
        </motion.div>
      </motion.div>
    </section>
  );
}