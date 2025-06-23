"use client";

import { motion } from "framer-motion";
import { ChevronRight, FileText, Shield, Scale } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="-mt-32">
      <div className="bg-gradient-to-r from-[#0A2540] via-[#1E4D8A] to-[#0066CC] text-white pb-4 py-32 mb-12 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex items-center gap-2 text-sm text-gray-300/80 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 opacity-50" />
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <ChevronRight className="h-4 w-4 opacity-50" />
            <span className="text-white font-medium">Terms & Conditions</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Terms and Conditions
          </motion.h1>
          
          <motion.p
            className="text-gray-300/90 max-w-2xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Please read these terms carefully before using our services
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-lg max-w-none dark:prose-invert"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#31CDFF]/5 rounded-full mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#31CDFF] animate-pulse" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </motion.div>

          <div className="grid gap-8">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                className="bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#31CDFF]/10 text-[#31CDFF]">
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#272055] to-[#31CDFF] bg-clip-text text-transparent">
                        {section.title}
                      </h2>
                      <div className="prose prose-lg dark:prose-invert">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            ))}
          </div>

          <motion.section
            className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-[#272055] to-[#31CDFF] text-white shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-white/90 font-bold">Contact Information</h2>
            </div>
            <p className="text-white/90 text-lg">
              For questions about these Terms and Conditions, please contact us at{" "}
              <a 
                href="mailto:hr@bqitech.com" 
                className="text-white underline decoration-2 decoration-white/30 hover:decoration-white/100 transition-all font-medium"
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

const sections = [
  {
    title: "Agreement to Terms",
    icon: <FileText className="w-6 h-6" />,
    content: (
      <p>
        By accessing and using BQI Tech's website and services, you agree to be bound by these Terms and Conditions. 
        If you disagree with any part of these terms, please do not use our services.
      </p>
    )
  },
  {
    title: "Job Application Process",
    icon: <Scale className="w-6 h-6" />,
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
    icon: <FileText className="w-6 h-6" />,
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
    icon: <Shield className="w-6 h-6" />,
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
    icon: <Shield className="w-6 h-6" />,
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
    icon: <Shield className="w-6 h-6" />,
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