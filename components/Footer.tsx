"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { Linkedin, Twitter, Instagram, Github, Mail, Phone, MapPin, ExternalLink, ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold mb-6 text-cyan-300">
    {children}
  </h3>
);

const SplitButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => {
  // Extract any props that might conflict with motion props
  const { type, onClick, disabled, form, ...restProps } = props;
  
  return (
    <motion.button
      className="group relative w-full overflow-hidden rounded-md bg-transparent text-white font-medium"
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      form={form}
    >
      <span className="relative z-10 block py-3 px-6">
        {children}
      </span>
      <span className="absolute inset-0 z-0 bg-cyan-600 opacity-90"></span>
      <span className="absolute inset-0 z-0 translate-y-full bg-purple-700 transition-transform duration-300 group-hover:translate-y-0"></span>
    </motion.button>
  );
};

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const footerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.2 });
  
  // Social links with vibrant colors
  const socialLinks = [
    { Icon: Linkedin, href: "https://www.linkedin.com/company/bqi-technologies", label: "LinkedIn", color: "text-blue-400 hover:text-blue-300" },
    { Icon: Twitter, href: "#", label: "Twitter", color: "text-cyan-400 hover:text-cyan-300" },
    { Icon: Instagram, href: "#", label: "Instagram", color: "text-pink-400 hover:text-pink-300" },
    { Icon: Github, href: "#", label: "GitHub", color: "text-purple-400 hover:text-purple-300" },
  ];

  // Links
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
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("Subscribed successfully!");
      setEmail("");
    } catch (error) {
      setMessage("Failed to subscribe. Please try again.");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    },
  };

  // Colors for links and elements
  const linkColors = [
    "text-cyan-400", 
    "text-blue-400", 
    "text-purple-400", 
    "text-pink-400"
  ];

  return (
    <motion.footer 
      ref={footerRef}
      className="relative bg-gradient-to-b from-gray-900 via-[#0a0b1e] to-black text-white py-28 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid lines */}
        <div className="absolute inset-0  bg-repeat opacity-5" />
        
        {/* Colored background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-800 rounded-full opacity-10 blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-700 rounded-full opacity-10 blur-[150px] translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-700 rounded-full opacity-5 blur-[100px]" />
        
        {/* Floating colored elements */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute size-24 border rounded-lg backdrop-blur-sm ${
                i % 4 === 0 ? 'border-cyan-800' : 
                i % 4 === 1 ? 'border-purple-800' : 
                i % 4 === 2 ? 'border-pink-800' : 
                'border-blue-800'
              }`}
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                rotate: Math.random() * 180,
                opacity: 0.05 + Math.random() * 0.08,
                scale: 0.8,
                z: Math.random() * -200,
              }}
              animate={{
                y: [`${Math.random() * 90}%`, `${Math.random() * 90}%`],
                rotate: [Math.random() * 180, Math.random() * 360],
                scale: [0.8, 1.2, 0.8],
                z: [Math.random() * -200, Math.random() * 100, Math.random() * -200],
              }}
              transition={{
                duration: 20 + Math.random() * 30,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 z-10 relative">
        {/* Main content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 relative"
        >
          {/* Logo and About column */}
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-4 space-y-6"
          >
            {/* Logo with glow effect */}
            <div className="mb-8">
              <div className="relative inline-block">
                <Image
                  src="/bqilogo-light.png"
                  alt="BQI Tech Logo"
                  width={160}
                  height={52}
                  className="drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" // Cyan glow
                />
              </div>
            </div>
            
            <SectionTitle>About Us</SectionTitle>
            <p className="text-gray-300 leading-relaxed text-sm">
              Innovating to build a better world through advanced technology solutions. 
              We leverage cutting-edge tech to solve complex problems and drive meaningful change 
              across industries and communities.
            </p>
            
            {/* Social icons in a colorful container */}
            <div className="pt-4">
              <div className="flex space-x-4 p-4 bg-slate-900 rounded-lg border border-cyan-900/50">
                {socialLinks.map(({ Icon, href, label, color }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`${color} transition-all duration-300`}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Links columns with colorful elements */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <SectionTitle>Quick Links</SectionTitle>
            <ul className="space-y-3">
              {quickLinks.map((item, index) => (
                <motion.li
                  key={item.name}
                  whileHover={{ x: 6 }}
                  className="group"
                >
                  <Link
                    href={item.href}
                    className="flex items-center text-gray-300 hover:text-white transition-colors"
                  >
                    <ChevronRight className={`w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity ${linkColors[index % linkColors.length]}`} />
                    <span>{item.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <SectionTitle>Legal</SectionTitle>
            <ul className="space-y-3">
              {legalLinks.map((item, index) => (
                <motion.li
                  key={item.name}
                  whileHover={{ x: 6 }}
                  className="group"
                >
                  <Link
                    href={item.href}
                    className="flex items-center text-gray-300 hover:text-white transition-colors"
                  >
                    <ChevronRight className={`w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity ${linkColors[(index + 2) % linkColors.length]}`} />
                    <span>{item.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact information with colorful elements */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
            <SectionTitle>Contact Us</SectionTitle>
            
            <div className="space-y-4 bg-slate-900 rounded-xl p-5 border border-purple-900/50">
              <motion.div
                className="flex items-start group"
                whileHover={{ x: 5 }}
              >
                <MapPin className="mr-3 h-5 w-5 text-cyan-400 mt-1 flex-shrink-0" />
                <Link 
                  href="https://maps.google.com/?q=The+Piano,+Brookside+Drive,+Westlands,+Nairobi,+Kenya"
                  target="_blank"
                  className="text-gray-300 group-hover:text-white transition-colors"
                >
                  The Piano, 8th Floor, Brookside Drive, Westlands, Nairobi, Kenya
                  <span className="ml-1 inline-block align-text-bottom opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </Link>
              </motion.div>
              
              <motion.div
                className="flex items-center group"
                whileHover={{ x: 5 }}
              >
                <Phone className="mr-3 h-5 w-5 text-pink-400 flex-shrink-0" />
                <Link 
                  href="tel:+254011229528"
                  className="text-gray-300 group-hover:text-white transition-colors"
                >
                  +254 (0)11 229 5287
                </Link>
              </motion.div>

              <motion.div
                className="flex items-center group"
                whileHover={{ x: 5 }}
              >
                <Mail className="mr-3 h-5 w-5 text-purple-400 flex-shrink-0" />
                <Link 
                  href="mailto:info@bqitech.com"
                  className="text-gray-300 group-hover:text-white transition-colors"
                >
                  info@bqitech.com
                </Link>
              </motion.div>
            </div>
            
            {/* Newsletter subscription with vibrant colors */}
            <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
              <div className="relative overflow-hidden rounded-md border border-cyan-900/50">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Subscribe to our newsletter"
                  className="w-full bg-slate-900 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700/50 transition-all duration-300"
                  required
                />
              </div>
              <SplitButton type="submit">Subscribe</SplitButton>
              {message && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-cyan-400"
                >
                  {message}
                </motion.p>
              )}
            </form>
          </motion.div>
        </motion.div>

        {/* Footer bottom with colorful elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-20 pt-8 border-t border-slate-800"
        >
          <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-purple-900/40 p-8 shadow-xl">
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-300">
                &copy; {new Date().getFullYear()} BQI Tech. All rights reserved.
              </p>
              
              <motion.div 
                className="text-sm font-medium text-cyan-300"
                whileHover={{ scale: 1.05 }}
              >
                Transforming Tomorrow Through Technology
              </motion.div>
            </div>
            
            {/* Colored decorative element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-700 blur-3xl rounded-full opacity-10"></div>
          </div>
        </motion.div>
      </div>
      
      {/* Colorful bottom decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500"></div>
    </motion.footer>
  );
}

export default Footer;