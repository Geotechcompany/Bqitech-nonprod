"use client";

import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8">Analytics Dashboard</h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Add your analytics charts and data visualizations here */}
        <p>Analytics content goes here</p>
      </motion.div>
    </div>
  );
}
