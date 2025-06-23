"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ChevronRight, Send } from 'lucide-react';

// Define an interface for the form data
interface FormData {
  name: string
  role: string
  phone: string
  organization: string
  service: string
  email: string
  message: string
}

function Breadcrumb() {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <a href="/" className="text-sm font-medium text-gray-700 hover:text-teal-500">
            Home
          </a>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <a href="/contact-us" className="ml-1 text-sm font-medium text-gray-700 hover:text-teal-500">
              Contact Us
            </a>
          </div>
        </li>
      </ol>
    </nav>
  )
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function ContactUsPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: '',
    phone: '',
    organization: '',
    service: '',
    email: '',
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/contact-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to send message');

      window.location.href = '/contact-us/confirmation';
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <motion.main 
        className="container mx-auto px-4 py-12 max-w-7xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Breadcrumb />
        
        {/* Hero Section */}
        <div className="relative py-16 md:py-24">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          />
          <div className="relative text-center">
            <motion.div 
              className="mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.2]">
                Let's Build Something
                <span className="block mt-4 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent leading-[1.2]">
                  Amazing Together
                </span>
              </h1>
            </motion.div>
            <motion.p 
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mt-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Have a project in mind? We'd love to discuss how we can help bring your ideas to life.
            </motion.p>
          </div>
        </div>

        {/* Contact Grid */}
        <div className="grid lg:grid-cols-5 gap-12 mt-12">
          {/* Contact Form */}
          <motion.div
            className="lg:col-span-3 bg-white rounded-3xl shadow-xl shadow-gray-100/50 overflow-hidden"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-8 bg-gradient-to-r from-teal-500 to-blue-500">
              <h2 className="text-2xl font-bold text-white mb-2">Send us a message</h2>
              <p className="text-teal-50">Fill out the form below and we'll get back to you shortly.</p>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                {['name', 'email'].map((field) => (
                  <div key={field} className="relative">
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      id={field}
                      name={field}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      required
                      onChange={handleChange}
                      value={formData[field as keyof FormData]}
                    />
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {['organization', 'phone'].map((field) => (
                  <div key={field} className="relative">
                    <input
                      type={field === 'phone' ? 'tel' : 'text'}
                      id={field}
                      name={field}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      required
                      onChange={handleChange}
                      value={formData[field as keyof FormData]}
                    />
                  </div>
                ))}
              </div>

              <div className="relative">
                <select
                  id="service"
                  name="service"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 appearance-none"
                  required
                  onChange={handleChange}
                  value={formData.service}
                >
                  <option value="">Select Service Type</option>
                  <option value="Software Engineering Services">Software Engineering Services</option>
                  <option value="Professional and Implementation Services">Professional and Implementation Services</option>
                </select>
              </div>

              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  placeholder="Your Message"
                  rows={4}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  required
                  onChange={handleChange}
                  value={formData.message}
                ></textarea>
              </div>

              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-medium inline-flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isLoading}
              >
                <span>{isLoading ? 'Sending...' : 'Send Message'}</span>
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Connect With Us</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: MapPin,
                    title: "Visit our office",
                    content: "The Piano, 8th Floor, Brookside Drive, Westlands, Nairobi, Kenya",
                  },
                  {
                    icon: Phone,
                    title: "Call us",
                    content: "+254 (0)11 229 5287",
                  },
                  {
                    icon: Mail,
                    title: "Email us",
                    content: "info@bqitech.com",
                    isLink: true,
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="bg-gradient-to-br from-teal-500 to-blue-500 p-3 rounded-xl text-white">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      {item.isLink ? (
                        <a href={`mailto:${item.content}`} className="text-gray-600 hover:text-teal-500">
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-gray-600">{item.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8176744277105!2d36.80943661475403!3d-1.2635390990699898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f17366e8d5d8f%3A0x1b3b7bd8d8a9d4a0!2sThe%20Piano%2C%20Brookside%20Dr%2C%20Nairobi!5e0!3m2!1sen!2sus!4v1637310000000!5m2!1sen!2sus"
                width="100%" 
                height="300" 
                style={{border:0}} 
                allowFullScreen={true} 
                loading="lazy"
                className="w-full"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}