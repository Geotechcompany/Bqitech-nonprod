"use client";

import { motion } from 'framer-motion';
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Sparkles, Zap, Rocket, Shield, LineChart, Layout, Briefcase } from 'lucide-react';

interface Update {
  title: string;
  description: string;
  date: string;
  icon: React.ElementType;
  category: 'New Feature' | 'Improvement' | 'Security' | 'Performance';
}

const updates: Update[] = [
  {
    title: "Unified Admin Layout & Navigation",
    description: "Implemented consistent header and breadcrumb navigation across all admin pages, with improved mobile responsiveness.",
    date: "February 24, 2025",
    icon: Layout,
    category: "Improvement"
  },
  {
    title: "Smart Search Functionality",
    description: "Added contextual search bars with filters for Applications, Shortlisted, Technical Assessment, Interviewing, and other sections.",
    date: "February 24, 2025",
    icon: LineChart,
    category: "New Feature"
  },
  {
    title: "What's New Section",
    description: "Introduced a dedicated page to keep you informed about the latest features and improvements in the admin panel.",
    date: "February 24, 2025",
    icon: Sparkles,
    category: "New Feature"
  },
  {
    title: "Enhanced Job Postings Management",
    description: "Streamlined job postings interface with improved organization and modern styling.",
    date: "February 24, 2025",
    icon: Briefcase,
    category: "Improvement"
  },
  {
    title: "Optimized Data Tables",
    description: "Enhanced data tables with sticky headers, better mobile responsiveness, and improved filtering capabilities.",
    date: "February 24, 2025",
    icon: Zap,
    category: "Performance"
  }
];

const categoryColors = {
  'New Feature': 'bg-purple-500',
  'Improvement': 'bg-blue-500',
  'Security': 'bg-green-500',
  'Performance': 'bg-orange-500'
};

export default function WhatsNewPage() {
  return (
    <AdminPageLayout
      title="What's New"
      showSearch={false}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center p-2 bg-purple-100 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Latest Updates & Improvements</h1>
          <p className="text-gray-600">Check out what's new in your admin dashboard</p>
        </motion.div>

        <div className="space-y-6">
          {updates.map((update, index) => (
            <motion.div
              key={update.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${categoryColors[update.category]} bg-opacity-10`}>
                    <update.icon className={`w-6 h-6 ${categoryColors[update.category]} text-opacity-100`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                      <span className="text-sm text-gray-500">{update.date}</span>
                    </div>
                    <p className="text-gray-600">{update.description}</p>
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${categoryColors[update.category]} bg-opacity-10 text-opacity-100`}>
                        {update.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl"
        >
          <Rocket className="w-8 h-8 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">More Updates Coming Soon!</h2>
          <p className="text-gray-600">We're constantly working on improving your experience.</p>
        </motion.div>
      </div>
    </AdminPageLayout>
  );
} 