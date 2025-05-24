"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Add floating shapes component
function FloatingShapes() {
  return (
    <>
      {/* Large Circle */}
      <motion.div
        className="absolute -left-20 -top-20 w-72 h-72 bg-[#31CDFF]/10 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Small Circle */}
      <motion.div
        className="absolute right-20 top-40 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Gradient Blob */}
      <motion.div
        className="absolute -right-20 -bottom-20 w-96 h-96 bg-gradient-to-br from-[#31CDFF]/20 to-blue-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Additional decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/50" />
    </>
  );
}

export default function CallToAction() {
  return (
    <section className="relative py-24 overflow-hidden bg-gray-50/50">
      {/* Add floating shapes behind the container */}
      <FloatingShapes />

      <div className="container relative mx-auto px-4">
        <motion.div
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#272055] to-[#1D1640] mx-auto max-w-5xl
                     backdrop-blur-sm shadow-2xl shadow-gray-200/50"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Rest of your existing container code remains the same */}
          <motion.div
            className="absolute inset-0 opacity-10"
            initial={{ backgroundPosition: "0% 0%" }}
            animate={{ backgroundPosition: "100% 100%" }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            style={{
              backgroundImage: "url('/grid-pattern.svg')",
              backgroundSize: "cover"
            }}
          />

          {/* Content Container */}
          <div className="relative px-6 py-20 sm:px-12 md:px-20">
            <motion.div 
              className="text-center max-w-3xl mx-auto space-y-8"
              variants={containerVariants}
            >
              <motion.div 
                className="flex items-center justify-center gap-2"
                variants={itemVariants}
              >
                <Sparkles className="w-5 h-5 text-[#31CDFF]" />
                <span className="bg-gradient-to-r from-[#31CDFF] to-blue-400 text-transparent bg-clip-text 
                               font-semibold uppercase tracking-wider text-sm">
                  Empowering Government Digital Transformation
                </span>
              </motion.div>

              <motion.h2 
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight"
                variants={itemVariants}
              >
                <span className="bg-gradient-to-r from-white via-white to-gray-300 text-transparent bg-clip-text">
                  Modernize your agency with
                </span>{" "}
                <span className="bg-gradient-to-r from-[#31CDFF] to-blue-400 text-transparent bg-clip-text">
                  cutting-edge solutions
                </span>{" "}
                <span className="bg-gradient-to-r from-white via-white to-gray-300 text-transparent bg-clip-text">
                  built for tomorrow.
                </span>
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-gray-300 text-lg max-w-2xl mx-auto"
              >
                From custom software development to enterprise system integration, we deliver 
                secure, scalable, and high-performance solutions tailored for government agencies.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
              >
                <Link
                  href="/contact-us"
                  className="group w-full sm:w-auto bg-gradient-to-r from-[#31CDFF] to-blue-500 
                           text-white px-8 py-4 rounded-full font-semibold 
                           hover:from-white hover:to-white hover:text-[#31CDFF] 
                           transition-all duration-300 
                           flex items-center justify-center gap-2 
                           shadow-lg shadow-[#31CDFF]/20
                           border border-transparent hover:border-[#31CDFF]"
                >
                  Start Your Transformation Today!
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Add radial gradient for better depth */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-white to-gray-50/50 pointer-events-none" />
    </section>
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

