"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

// Add floating shapes component
function FloatingShapes() {
  return (
    <>
      {/* Enhanced animated shapes with more vibrant colors */}
      <motion.div
        className="absolute -left-32 -top-32 w-96 h-96 bg-gradient-to-br from-[#31CDFF]/30 via-purple-500/25 to-blue-500/30 rounded-full blur-3xl"
        animate={{
          rotate: [0, 90, 0],
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute right-0 bottom-0 w-80 h-80 bg-gradient-to-bl from-blue-600/30 via-[#31CDFF]/25 to-purple-500/30 rounded-full blur-3xl"
        animate={{
          rotate: [0, -90, 0],
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              y: [null, -20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Enhanced geometric pattern */}
      <div className="absolute inset-0  opacity-[0.07]" />
      
      {/* Improved glass effect */}
      <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-white/40 via-transparent to-white/40" />
    </>
  );
}

export default function CallToAction() {
  // Remove the 3D morph transition variants
  // const ctaMorphVariants = {
  //   hidden: { 
  //     opacity: 0,
  //     rotateX: 15, 
  //     rotateY: -4,
  //     rotateZ: 1,
  //     scale: 0.9,
  //     transformPerspective: 1800,
  //     z: -200,
  //     filter: "blur(10px)"
  //   },
  //   visible: { 
  //     opacity: 1,
  //     rotateX: 0, 
  //     rotateY: 0,
  //     rotateZ: 0,
  //     scale: 1,
  //     transformPerspective: 1800,
  //     z: 0,
  //     filter: "blur(0px)",
  //     transition: { 
  //       type: "spring", 
  //       stiffness: 35, 
  //       damping: 15,
  //       mass: 1.4,
  //       duration: 1.3
  //     } 
  //   }
  // };

  return (
    <motion.section 
      className="relative py-32 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50/80"
      // Remove the morph variants
      // variants={ctaMorphVariants}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.25 }}
    >
      {/* <FloatingShapes /> */}

      <div className="container relative mx-auto px-4">
        <motion.div
          className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#0A1128] to-[#1B3C73] 
                     mx-auto max-w-5xl backdrop-blur-xl shadow-2xl shadow-blue-900/30 border border-white/10
                     group perspective-1000 transform-gpu transition-all duration-500 hover:scale-[1.02]
                     hover:[transform:rotateX(2deg)_rotateY(-1deg)]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Enhanced 3D lighting effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Animated glow effect */}
          <div className="absolute -inset-px bg-gradient-to-r from-[#31CDFF]/20 via-purple-500/20 to-blue-500/20 
                         opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />

          {/* Content Container */}
          <div className="relative px-8 py-24 sm:px-12 md:px-20 z-10">
            <motion.div className="text-center max-w-3xl mx-auto space-y-10" variants={containerVariants}>
              <motion.div 
                className="flex items-center justify-center gap-3 bg-white/10 rounded-full py-2 px-4 w-fit mx-auto"
                variants={itemVariants}
              >
                <Sparkles className="w-5 h-5 text-[#31CDFF]" />
                <span className="bg-gradient-to-r from-[#31CDFF] to-blue-400 text-transparent bg-clip-text 
                               font-semibold uppercase tracking-wider text-sm">
                  Empowering Government Digital Transformation
                </span>
              </motion.div>

              <motion.h2 
                className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
                variants={itemVariants}
              >
                <span className="text-white">
                  Modernize your agency with{" "}
                </span>
                <span className="relative">
                  <span className="bg-gradient-to-r from-[#31CDFF] via-blue-400 to-[#31CDFF] text-transparent bg-clip-text">
                    cutting-edge solutions
                  </span>
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  >
                    <path
                      d="M3 9C3 9 40 3 150 3C260 3 297 9 297 9"
                      stroke="url(#gradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                        <stop offset="0%" stopColor="#31CDFF" />
                        <stop offset="50%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#31CDFF" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
                <span className="text-white">
                  {" "}built for tomorrow.
                </span>
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed"
              >
                From custom software development to enterprise system integration, we deliver 
                secure, scalable, and high-performance solutions tailored for government agencies.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              >
                <Link
                  href="/careers/jobs"
                  className="group relative w-full sm:w-auto px-10 py-5 rounded-2xl font-semibold 
                           overflow-hidden transition-all duration-300 transform hover:scale-105
                           hover:[transform:translateZ(20px)] active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#31CDFF] via-blue-500 to-[#31CDFF] 
                                transition-transform duration-300" />
                  
                  <div className="relative flex items-center justify-center gap-3 text-white text-lg">
                    <span>View Current Vacancies</span>
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                  
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 
                                bg-gradient-to-r from-transparent via-white to-transparent 
                                translate-x-[-100%] group-hover:translate-x-[100%] 
                                transition-all duration-700 ease-in-out" />
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Enhanced mesh gradient background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(49,205,255,0.1),rgba(49,205,255,0)_50%)]" />
        </motion.div>
      </div>

      {/* Add noise texture */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
    </motion.section>
  );
}
// Add these styles to your global CSS
const globalStyles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }

  .bg-radial-gradient {
    background: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%);
  }
`;
