"use client";

import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import Features from "@/components/Features";
import RecentProjects from "@/components/RecentProjects";
import BlogPreview from "@/components/BlogPreview";
import CallToAction from "@/components/CallToAction";
import { ComingSoon } from "./ComingSoon";

interface ClientHomePageProps {
  userId: string | null
}

export default function ClientHomePage({ userId }: ClientHomePageProps) {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <Features />
      {/* <RecentProjects /> */}
      {/* <BlogPreview /> */}
      <CallToAction /> 
    </motion.div>
  );
}