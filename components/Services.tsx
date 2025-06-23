'use client'

import { motion } from 'framer-motion'
import { Zap, Shield, Briefcase, ArrowRight } from 'lucide-react'

const services = [
  { icon: Zap, title: 'Professional Services', desc: 'Expert consulting and implementation' },
  { icon: Shield, title: 'Business Licensing', desc: 'Streamlined licensing solutions' },
  { icon: Briefcase, title: 'Professional Licensing', desc: 'Efficient credential management' },
]

function Services() {
  // Add 3D morph transition variants
  const serviceMorphVariants = {
    hidden: { 
      opacity: 0,
      rotateX: -8, 
      rotateY: 5,
      rotateZ: -1,
      scale: 0.93,
      transformPerspective: 1400,
      z: -100,
      filter: "blur(6px)"
    },
    visible: { 
      opacity: 1,
      rotateX: 0, 
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      transformPerspective: 1400,
      z: 0,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 45, 
        damping: 18,
        mass: 1.2,
        duration: 1.0,
        delay: 0.1
      } 
    }
  };

  return (
    <motion.section 
      className="py-20 perspective-container transform-3d transform-gpu" 
      id="services"
      variants={serviceMorphVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Our Services
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={service.title}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
            >
              <service.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.desc}</p>
              <motion.a
                href="#"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                whileHover={{ x: 5 }}
              >
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default Services