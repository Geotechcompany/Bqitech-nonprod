"use client";

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function RejectedPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8">Rejected Applications</h2>
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search rejected applications..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Add your rejected applications list or grid here */}
        <p>Rejected applications content goes here</p>
      </motion.div>
    </div>
  );
}
