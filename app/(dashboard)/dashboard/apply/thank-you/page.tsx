"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

function ThankYouPage() {
  return (
    <motion.div
      className="container mx-auto px-4 py-16 mt-32 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-8" />
      </motion.div>

      <motion.h1
        className="text-4xl font-bold mb-4 text-gray-800"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Thank You for Your Application!
      </motion.h1>

      <motion.p
        className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        We've received your application and appreciate your interest in joining our team. Our hiring team will review your information and get back to you soon.
      </motion.p>

      <motion.div
        className="bg-blue-50 p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">What's Next?</h2>
        <ul className="text-left text-blue-700 space-y-2">
          <li>• Our team will review your application</li>
          <li>• If your profile matches our requirements, we'll contact you for an interview</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center px-6 py-3 bg-[#4D4D70] text-white font-semibold rounded-full hover:bg-[#4D4D70] transition-colors duration-300"
        >
          TRACK STATUS
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </motion.div>

      <motion.div
        className="mt-16 text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <p>Have any questions? Contact us at <a href="mailto:hr@bqitech.com" className="text-blue-500 hover:underline">hr@bqitech.com</a></p>
      </motion.div>
    </motion.div>
  );
}

export default ThankYouPage;
