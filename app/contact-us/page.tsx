"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ChevronRight } from 'lucide-react';

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
    <motion.main 
      className="container mx-auto px-4 py-8 mt-6"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      }}
      transition={{ duration: 0.5 }}
    >
      <Breadcrumb />
      <motion.h1 
        className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500"
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            {['name', 'role', 'service', 'phone', 'organization', 'email', 'message'].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block mb-1 capitalize">
                  {field.replace(/([A-Z])/g, ' $1')}
                </label>
                {field === 'service' ? (
                  <select
                    id="service"
                    name="service"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                    onChange={handleChange}
                  >
                    <option value="">Select a service</option>
                    <option value="Software Engineering Services">Software Engineering Services</option>
                    <option value="Professional and Implementation Services">Professional and Implementation Services</option>
                  </select>
                ) : field !== 'message' ? (
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    id={field}
                    name={field}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                    onChange={handleChange}
                  />
                ) : (
                  <textarea
                    id={field}
                    name={field}
                    rows={4}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                    onChange={handleChange}
                  ></textarea>
                )}
              </div>
            ))}
            <motion.button
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-2 rounded hover:bg-teal-600 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Message'}
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
