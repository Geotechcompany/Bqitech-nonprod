"use client";

import { motion } from "framer-motion";
import { ChevronRight, Cookie, Shield, Cog, Bell } from "lucide-react";
import Link from "next/link";

export default function CookiePolicyPage() {
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
            <span className="text-white">Cookie Policy</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Cookie Policy</h1>
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
            Cookie Policy
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 mb-8 border-l-4 border-teal-500 pl-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Last updated: {new Date().toLocaleDateString()}
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {cookieFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-teal-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
              >
                <feature.icon className="w-8 h-8 text-teal-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {cookieSections.map((section, index) => (
            <motion.section
              key={section.title}
              className="mb-12 p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-teal-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.01 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">{section.title}</h2>
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
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-white/90">
              If you have questions about our Cookie Policy, please contact us at{" "}
              <a 
                href="mailto:privacy@bqitech.com" 
                className="text-white underline decoration-2 decoration-white/30 hover:decoration-white/100 transition-all"
              >
                privacy@bqitech.com
              </a>
            </p>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}

const cookieFeatures = [
  {
    icon: Cookie,
    title: "Essential Cookies",
    description: "Required for the website to function properly, including user authentication and security."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "We respect your privacy and only collect necessary data to improve your experience."
  },
  {
    icon: Cog,
    title: "Full Control",
    description: "Manage your cookie preferences easily through browser settings."
  },
  {
    icon: Bell,
    title: "Stay Updated",
    description: "We'll notify you of any changes to our cookie policy."
  }
]

const cookieSections = [
  {
    title: "How We Use Cookies",
    content: (
      <div className="space-y-4">
        <p>We use cookies for several purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security features.
          </li>
          <li>
            <strong>Functional Cookies:</strong> Remember your preferences and settings to enhance your experience.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how visitors use our website to improve our services.
          </li>
          <li>
            <strong>Application Process Cookies:</strong> Maintain your application status and progress.
          </li>
        </ul>
      </div>
    )
  },
  {
    title: "Types of Cookies We Use",
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium mb-2">Session Cookies</h3>
          <p>Temporary cookies that expire when you close your browser. They help maintain security and functionality during your visit.</p>
        </div>
        <div>
          <h3 className="text-xl font-medium mb-2">Persistent Cookies</h3>
          <p>Remain on your device for a set period. They help remember your preferences and improve your experience.</p>
        </div>
        <div>
          <h3 className="text-xl font-medium mb-2">Third-Party Cookies</h3>
          <p>Set by third-party services we use, such as analytics tools and social media platforms.</p>
        </div>
      </div>
    )
  },
  {
    title: "Managing Your Cookie Preferences",
    content: (
      <div className="space-y-4">
        <p>You can control cookies through your browser settings:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Block all cookies</li>
          <li>Delete existing cookies</li>
          <li>Allow cookies from specific websites</li>
          <li>Browse in private/incognito mode</li>
        </ul>
        <p className="mt-4 text-gray-600">
          Note: Blocking cookies may affect website functionality and your user experience.
        </p>
      </div>
    )
  },
  {
    title: "Cookie Duration",
    content: (
      <div className="space-y-4">
        <p>The cookies we use have different lifespans:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Session cookies: Last only during your browsing session</li>
          <li>Persistent cookies: Can last from 30 days up to 2 years</li>
          <li>Authentication cookies: Typically last for your logged-in session</li>
        </ul>
      </div>
    )
  },
  {
    title: "Updates to This Policy",
    content: (
      <div className="space-y-4">
        <p>
          We may update this Cookie Policy to reflect changes in our practices or for legal compliance. 
          Check back periodically for updates.
        </p>
        <p>
          We will notify you of any significant changes through a notice on our website.
        </p>
      </div>
    )
  }
];
