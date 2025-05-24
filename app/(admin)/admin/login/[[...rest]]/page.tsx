"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-500 to-blue-600">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-8 bg-white shadow-2xl rounded-lg w-full max-w-md"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center mb-6"
        >
          <Zap className="w-12 h-12 text-teal-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">BQI Tech Admin</h1>
        </motion.div>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center text-gray-600 mb-8"
        >
          Sign in to access the admin dashboard
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <SignIn
            redirectUrl="/admin/overview"
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-teal-500 hover:bg-teal-600 text-sm normal-case",
                card: "bg-white shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "normal-case",
                formFieldInput:
                  "border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50",
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-500",
                footer: "hidden", // Hide the footer containing "Secured by Clerk"
              },
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
