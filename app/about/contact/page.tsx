"use client";

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUsPage() {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.main 
      className="container mx-auto px-4 py-8 mt-32"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 
        className="text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Contact Us
      </motion.h1>
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <p className="mb-4">
            We&apos;d love to hear from you. Please fill out the form below and we&apos;ll
            get back to you as soon as possible.
          </p>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              ></textarea>
            </div>
            <motion.button
              type="submit"
              className="bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send Message
            </motion.button>
          </form>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Our Office</h2>
          <div className="space-y-4 mb-6">
            <p className="flex items-center">
              <MapPin className="mr-2 text-teal-500" />
              The Piano, 8th Floor, Brookside Drive, Westlands, Nairobi, Kenya
            </p>
            <p className="flex items-center">
              <Phone className="mr-2 text-teal-500" />
              +254 (0)11 229 5287
            </p>
            <p className="flex items-center">
              <Mail className="mr-2 text-teal-500" />
              <a href="mailto:info@bqitech.com" className="hover:text-teal-500 transition-colors">
                info@bqitech.com
              </a>
            </p>
          </div>
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8176744277105!2d36.80943661475403!3d-1.2635390990699898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f17366e8d5d8f%3A0x1b3b7bd8d8a9d4a0!2sThe%20Piano%2C%20Brookside%20Dr%2C%20Nairobi!5e0!3m2!1sen!2sus!4v1637310000000!5m2!1sen!2sus"
              width="600" 
              height="450" 
              style={{border:0}} 
              allowFullScreen={true} 
              loading="lazy"
              className="rounded-lg shadow-md"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}
