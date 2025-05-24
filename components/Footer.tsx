"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

function FooterCard({ children }: { children: React.ReactNode }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`
    radial-gradient(
      400px circle at ${mouseX}px ${mouseY}px,
      rgba(49, 205, 255, 0.05),
      transparent 80%
    )
  `;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      className="relative rounded-xl overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background }}
      />
      <div className="relative p-6 backdrop-blur-sm bg-gray-900/90 rounded-xl border border-gray-800/50">
        {children}
      </div>
    </motion.div>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const socialIcons = [
    { Icon: Linkedin, href: "https://www.linkedin.com/company/bqi-technologies", label: "LinkedIn", color: "hover:bg-blue-700" },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Careers", href: "/careers" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  const legalLinks = [
    { name: "Terms & Conditions", href: "/about/terms" },
    { name: "Cookie Policy", href: "/about/cookie-policy" },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("Subscribed successfully!");
    } catch (error) {
      setMessage("Failed to subscribe. Please try again.");
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white py-20 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient" />
          <div className="absolute inset-0 bg-[url('/mesh-pattern.svg')] bg-repeat opacity-20" />
        </div>
        
        <div className="absolute inset-0">
          <div className="absolute w-full h-full">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
                initial={{
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  y: ["-20%", "120%"],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 10 + 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid md:grid-cols-5 gap-8">
          <FooterCard>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <Image
                src="/bqilogo-light.png"
                alt="BQI Tech Logo"
                width={120}
                height={40}
                className="drop-shadow-lg"
              />
              <p className="text-gray-300 text-sm leading-relaxed">
                Innovating to build a better world through advanced technology solutions.
              </p>
            </motion.div>
          </FooterCard>

          <FooterCard>
            <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <motion.li
                  key={item.name}
                  className="group"
                  whileHover={{ x: 5 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center text-gray-300 hover:text-[#31CDFF] transition-colors"
                  >
                    <span>{item.name}</span>
                    <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </FooterCard>
          <FooterCard>
            <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((item) => (
                <motion.li
                  key={item.name}
                  className="group"
                  whileHover={{ x: 5 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center text-gray-300 hover:text-[#31CDFF] transition-colors"
                  >
                    <span>{item.name}</span>
                    <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </FooterCard>
          <FooterCard>
            <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <motion.li
                className="flex items-start group"
                whileHover={{ x: 5 }}
              >
                <MapPin className="mr-2 h-5 w-5 text-[#31CDFF] mt-1 flex-shrink-0" />
                <Link 
                  href="https://maps.google.com/?q=The+Piano,+Brookside+Drive,+Westlands,+Nairobi,+Kenya"
                  target="_blank"
                  className="text-gray-300 group-hover:text-white transition-colors"
                >
                  The Piano, 8th Floor, Brookside Drive, Westlands, Nairobi, Kenya
                </Link>
              </motion.li>
              
              <motion.li
                className="flex items-center group"
                whileHover={{ x: 5 }}
              >
                <Phone className="mr-2 h-5 w-5 text-[#31CDFF] flex-shrink-0" />
                <Link 
                  href="tel:+254011229528"
                  className="text-gray-300 group-hover:text-white transition-colors"
                >
                  +254 (0)11 229 5287
                </Link>
              </motion.li>

              <motion.li
                className="flex items-center group"
                whileHover={{ x: 5 }}
              >
                <Mail className="mr-2 h-5 w-5 text-[#31CDFF] flex-shrink-0" />
                <Link 
                  href="mailto:info@bqitech.com"
                  className="text-gray-300 group-hover:text-white transition-colors"
                >
                  info@bqitech.com
                </Link>
              </motion.li>
            </ul>
          </FooterCard>

          

          <FooterCard>
            <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Stay Connected
            </h3>
            <div className="space-y-6">
              <div className="flex space-x-4">
                {socialIcons.map(({ Icon, href, label, color }) => (
                  <motion.a
                    key={label}
                    href={href}
                    aria-label={label}
                    className={`bg-gray-800/50 p-2 rounded-lg ${color} transition-all duration-300`}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
              
              <form className="space-y-3" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31CDFF] transition-all duration-300"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#31CDFF] to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#31CDFF]/20 transition-all duration-300"
                >
                  Subscribe
                </motion.button>
              </form>
              {message && <p className="text-sm text-gray-400">{message}</p>}
            </div>
          </FooterCard>
        </div>

        <motion.div
          className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p>
            &copy; {new Date().getFullYear()} BQI Tech. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;
