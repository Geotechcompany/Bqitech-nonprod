"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const projects = [
  {
    title: "Government Agency Portal",
    description: "A secure and efficient portal for managing government services and citizen interactions.",
    image: "/gov.gif",
    gradient: "from-blue-500 to-purple-500",
    shadowColor: "rgba(99, 102, 241, 0.15)",
    category: "Web Platform"
  },
  {
    title: "Smart City Infrastructure",
    description: "IoT-based solution for monitoring and optimizing city resources and services.",
    image: "/smart-city.gif",
    gradient: "from-[#31CDFF] to-blue-500",
    shadowColor: "rgba(49, 205, 255, 0.15)",
    category: "IoT Solution"
  },
  {
    title: "Healthcare Data Management",
    description: "Centralized system for managing patient data and streamlining healthcare operations.",
    image: "/health.gif",
    gradient: "from-emerald-500 to-teal-500",
    shadowColor: "rgba(16, 185, 129, 0.15)",
    category: "Data Platform"
  }
];

function ProjectCard({ project, index }: { project: typeof projects[0], index: number }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const background = useMotionTemplate`
    radial-gradient(
      800px circle at ${mouseX}px ${mouseY}px,
      ${project.shadowColor},
      transparent 80%
    )
  `

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      <div
        onMouseMove={handleMouseMove}
        className="relative h-full rounded-3xl p-px bg-gradient-to-b from-gray-200/30 to-gray-700/5 dark:from-gray-800/30 dark:to-gray-800/5"
      >
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background }}
        />
        <div className="relative h-full bg-white dark:bg-gray-900 rounded-3xl p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20 dark:from-white/5 dark:to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <span className={cn(
            "inline-block px-3 py-1 rounded-full text-sm font-medium mb-4",
            `bg-gradient-to-r ${project.gradient} text-white`
          )}>
            {project.category}
          </span>

          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-6 transform group-hover:scale-[1.02] transition-transform duration-500">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>

          <h3 className="text-2xl font-bold mb-2 group-hover:text-transparent bg-gradient-to-r bg-clip-text transition-colors duration-300"
              style={{
                backgroundImage: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))`
              }}>
            {project.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {project.description}
          </p>

          <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowUpRight className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function RecentProjects() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <span className="text-sm font-bold tracking-wider text-[#31CDFF] uppercase">
            Our Work
          </span>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-[#272055] to-[#31CDFF] text-transparent bg-clip-text pb-2">
            Recent Projects
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover how we've helped organizations transform their operations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
