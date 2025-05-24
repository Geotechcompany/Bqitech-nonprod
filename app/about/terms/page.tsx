"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="-mt-8">
      <div className="bg-gradient-to-r from-[#272055] to-[#1B174E] py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Terms & Conditions</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Terms and Conditions</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-lg max-w-none"
        >
          <motion.h1 
            className="text-4xl font-bold mb-8 bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Terms and Conditions
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 mb-8 border-l-4 border-teal-500 pl-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Last updated: {new Date().toLocaleDateString()}
          </motion.p>

          {/* Sections with hover effects and animations */}
          {sections.map((section, index) => (
            <motion.section
              key={section.title}
              className="mb-12 p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-teal-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.01 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <span className="text-teal-500">{index + 1}.</span>
                {section.title}
              </h2>
              <div className="prose prose-lg">
                {section.content}
              </div>
            </motion.section>
          ))}

          <motion.section
            className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-8 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-white/90">
              For questions about these Terms and Conditions, please contact us at{" "}
              <a 
                href="mailto:hr@bqitech.com" 
                className="text-white underline decoration-2 decoration-white/30 hover:decoration-white/100 transition-all"
              >
                hr@bqitech.com
              </a>
            </p>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}

// Move sections data outside component for better organization
const sections = [
  {
    title: "Agreement to Terms",
    content: (
      <p>
        By accessing and using BQI Tech's website and services, you agree to be bound by these Terms and Conditions. 
        If you disagree with any part of these terms, please do not use our services.
      </p>
    )
  },
  {
    title: "Job Application Process",
    content: (
      <div className="space-y-4">
        <p>When applying for positions through our platform, you agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide accurate and truthful information in your application</li>
          <li>Submit original and authentic documents for verification</li>
          <li>Maintain confidentiality regarding the application process</li>
          <li>Accept our assessment and selection procedures</li>
          <li>Comply with background check requirements when applicable</li>
        </ul>
      </div>
    )
  },
  {
    title: "Intellectual Property",
    content: (
      <div className="space-y-4">
        <p>
          All content on this website, including but not limited to text, graphics, logos, images, and software, 
          is the property of BQI Tech and protected by intellectual property laws.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You may not use our content without express written permission</li>
          <li>Our trademarks and brand features are protected by law</li>
          <li>Any unauthorized use may result in legal action</li>
        </ul>
      </div>
    )
  },
  {
    title: "User Responsibilities",
    content: (
      <div className="space-y-4">
        <p>Users of our website agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Not attempt to gain unauthorized access to our systems</li>
          <li>Not interfere with the proper working of the website</li>
          <li>Not engage in any activity that could harm our systems</li>
          <li>Respect other users' privacy and rights</li>
          <li>Comply with all applicable laws and regulations</li>
        </ul>
      </div>
    )
  },
  {
    title: "Privacy and Data Protection",
    content: (
      <div className="space-y-4">
        <p>
          We collect and process personal data in accordance with our Privacy Policy and applicable data protection laws. 
          By using our services, you consent to such processing and warrant that all data provided is accurate.
        </p>
        <p>
          We implement appropriate technical and organizational measures to ensure data security.
        </p>
      </div>
    )
  },
  {
    title: "Limitation of Liability",
    content: (
      <div className="space-y-4">
        <p>
          BQI Tech shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
          resulting from your use or inability to use our services.
        </p>
        <p>
          We make no warranties or representations about the accuracy or completeness of the website's content.
        </p>
      </div>
    )
  }
];
