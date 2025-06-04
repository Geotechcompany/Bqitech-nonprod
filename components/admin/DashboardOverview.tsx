"use client";

import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const overviewItems = [
  { title: 'Total Applications', value: 150, icon: FileText, color: 'bg-blue-500', path: '/admin/applications' },
  { title: 'Shortlisted', value: 45, icon: CheckCircle, color: 'bg-green-500', path: '/admin/shortlisted' },
  { title: 'Technical Assessment', value: 30, icon: XCircle, color: 'bg-red-500', path: '/admin/assessments' },
  { title: 'In Review', value: 75, icon: Users, color: 'bg-yellow-500', path: '/admin/reviews' },
];

export default function DashboardOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewItems.map((item, index) => (
        <Link href={item.path} key={item.title} className="hover:opacity-90 transition-opacity">
          <motion.div
            className={`${item.color} rounded-lg shadow-md p-6 text-white cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold mb-2">{item.title}</p>
                <h3 className="text-3xl font-bold">{item.value}</h3>
              </div>
              <item.icon className="w-12 h-12 opacity-80" />
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
