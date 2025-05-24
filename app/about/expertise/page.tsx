"use client";

import { motion } from "framer-motion";
import { AboutLayout } from "@/components/layouts/AboutLayout";
import { Card } from "@/components/ui/card";
import { Code, Shield, Zap, Users, Cloud, Wrench } from "lucide-react";

export default function Expertise() {
  const expertiseAreas = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "Custom Software Development",
      description: "Tailored solutions built with cutting-edge technologies",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Security & Compliance",
      description: "Robust security measures and regulatory compliance",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Performance Optimization",
      description: "High-performance solutions for maximum efficiency",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Expertise",
      description: "Skilled professionals with diverse technical backgrounds",
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Cloud Solutions",
      description: "Scalable cloud infrastructure and services",
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      title: "Technical Support",
      description: "24/7 support and maintenance services",
    },
  ];

  const breadcrumbItems = [
    { label: "About", href: "/about" },
    { label: "Our Expertise" },
  ];

  return (
    <AboutLayout
      title="Our Expertise"
      subtitle="Discover our core competencies and technical capabilities"
      breadcrumbItems={breadcrumbItems}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expertiseAreas.map((area, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 text-[#31CDFF]">{area.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{area.title}</h3>
              <p className="text-gray-600">{area.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center"
      >
        <h2 className="text-2xl font-semibold mb-4">Ready to Work Together?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Let us help you transform your business with our expertise and
          innovative solutions.
        </p>
      </motion.div>
    </AboutLayout>
  );
}
