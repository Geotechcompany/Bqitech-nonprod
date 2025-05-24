"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Shield, Zap, Code, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { MouseEvent } from "react";
import Spline from '@splinetool/react-spline'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei'

const features = [
  {
    icon: Shield,
    title: "Security-First Approach",
    description: "Our solutions are built with security at their core, ensuring compliance and protecting sensitive data.",
    gradient: "from-blue-500 to-purple-500",
    shadowColor: "rgba(99, 102, 241, 0.15)",
    delay: 0.2
  },
  {
    icon: Zap,
    title: "Optimized for Performance",
    description: "Our high-speed, scalable software ensures efficiency, helping you work smarter and faster.",
    gradient: "from-[#31CDFF] to-blue-500",
    shadowColor: "rgba(49, 205, 255, 0.15)",
    delay: 0.3
  },
  {
    icon: Code,
    title: "Custom Development, Tailored for You",
    description: "We build bespoke software solutions to match your unique business or government agency needs.",
    gradient: "from-purple-500 to-pink-500",
    shadowColor: "rgba(168, 85, 247, 0.15)",
    delay: 0.4
  },
  {
    icon: Users,
    title: "Collaborative & Client-Focused",
    description: "We work closely with you to align technology solutions with your goals, ensuring seamless implementation.",
    gradient: "from-[#272055] to-[#31CDFF]",
    shadowColor: "rgba(39, 32, 85, 0.15)",
    delay: 0.5
  }
];

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`
    radial-gradient(
      650px circle at ${mouseX}px ${mouseY}px,
      ${feature.shadowColor},
      transparent 80%
    )
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: feature.delay }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="relative group"
    >
      <div
        onMouseMove={handleMouseMove}
        className={cn(
          "relative h-full rounded-3xl p-px",
          "bg-gradient-to-b from-gray-200/30 to-gray-700/5",
          "dark:from-gray-800/30 dark:to-gray-800/5",
          "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b",
          "before:from-gray-900/5 before:to-gray-700/5",
          "dark:before:from-gray-800/10 dark:before:to-gray-800/5",
          "after:absolute after:inset-0 after:rounded-3xl after:bg-gradient-to-b",
          "after:from-gray-900/5 after:to-gray-700/5",
          "dark:after:from-gray-800/10 dark:after:to-gray-800/5"
        )}
      >
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background }}
        />
        <div className={cn(
          "relative h-full bg-white dark:bg-gray-900 rounded-3xl p-8",
          "backdrop-blur-xl backdrop-filter",
          "border border-gray-200/50 dark:border-gray-700/50",
          "group-hover:border-gray-300 dark:group-hover:border-gray-600",
          "transition-colors duration-500"
        )}>
          <div className={cn(
            "w-14 h-14 rounded-2xl mb-8",
            "flex items-center justify-center",
            "bg-gradient-to-tr shadow-lg",
            feature.gradient,
            "transform group-hover:scale-110 group-hover:rotate-3",
            "transition-transform duration-500"
          )}>
            <feature.icon className="w-7 h-7 text-white transform -rotate-3" />
          </div>
          
          <h3 className={cn(
            "text-2xl font-bold mb-4",
            "bg-gradient-to-r bg-clip-text text-transparent",
            feature.gradient
          )}>
            {feature.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Background() {
  return (
    <mesh>
      <Sphere args={[1.5, 128, 128]}>
        <MeshDistortMaterial
          color="#31CDFF"
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0.2}
          metalness={0.9}
          bumpScale={0.005}
          clearcoat={1}
          clearcoatRoughness={0.1}
          radius={1}
          depthWrite={false}
        />
      </Sphere>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#31CDFF" />
    </mesh>
  )
}

export default function Features() {
  return (
    <section className="relative py-24 overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="absolute inset-0 w-full h-full opacity-40">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <OrbitControls 
            enableZoom={false} 
            autoRotate 
            autoRotateSpeed={1.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
          <Background />
        </Canvas>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 to-gray-50 dark:via-gray-900/80 dark:to-gray-900" />
      
      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <motion.span 
            className="text-sm font-bold tracking-wider text-[#31CDFF] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Why Choose Us
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-[#272055] to-[#31CDFF] text-transparent bg-clip-text [background-size:200%_auto] pb-2">
            Transforming Ideas into Reality
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Accelerate your digital transformation with cutting-edge solutions designed for maximum impact.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
