'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Briefcase, Code, CheckCircle, ArrowRight } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import { Suspense } from 'react'
import Link from 'next/link'

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 ">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={1} />
          
          {Array.from({ length: 50 }).map((_, i) => (
            <Sphere
              key={i}
              position={[
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
                Math.random() * 20 - 10
              ]}
              scale={Math.random() * 0.2}
            >
              <meshStandardMaterial
                color={`hsl(${Math.random() * 90 + 180}, 50%, 50%)`}
                transparent
                opacity={0.6}
              />
            </Sphere>
          ))}

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

const services = [
  {
    icon: Briefcase,
    title: 'Professional IT Implementation Services',
    description: `Our team of technical experts brings hands-on experience to tackle complex IT projects. We specialize in configuring enterprise platforms, ensuring smooth integration and optimized performance.`,
    details: [
      'Enterprise Platform Configuration – Our experts customize and configure your enterprise systems to enhance performance and usability.',
      'Advanced Report Writing – We simplify the process of generating custom reports using SSRS, Crystal Reports, and other reporting tools, helping you gain valuable business insights.'
    ],
    image: '/implementation.jpg'
  },
  {
    icon: Code,
    title: 'Software Engineering & Development Services',
    description: `BQI Tech offers full-cycle software development services, from concept and design to deployment and maintenance. Our team of software engineers, DevOps professionals, and UX designers ensures innovative, high-quality solutions that meet your business needs.`,
    details: [
      'Custom Software Development - We build tailor-made web and mobile applications that align with your business objectives.',
      'COTS Software Optimization - We enhance, manage, and integrate commercial off-the-shelf (COTS) software, providing a scalable and future-ready foundation for your business.',
      'Platform Engineering & DevOps - Our DevOps expertise ensures efficient CI/CD pipelines, automation, and cloud optimization, enhancing operational efficiency and cost-effectiveness.'
    ],
    image: '/software.jpg'
  }
]

export default function ServicesPage() {
  const breadcrumbItems = [
    { label: "Services" }
  ]

  return (
    <>
      <AnimatedBackground />
      <motion.main 
        className="container mx-auto px-4 py-16 -mt-16 relative"
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
        <Breadcrumb items={breadcrumbItems} />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mb-16 py-24 overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#272055]/70 to-[#31CDFF]/60" />
          </div>

          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
              Our Services
            </h1>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              Comprehensive IT Solutions to Drive Business Success
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 p-8 rounded-2xl bg-white/90 backdrop-blur-sm"
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              At BQI Tech, we provide end-to-end software development, IT consulting, and DevOps solutions to help 
              businesses optimize operations and achieve digital transformation. Our expertise spans custom software 
              development, enterprise platform engineering, and IT implementation, ensuring seamless and scalable 
              solutions for every industry.
            </p>
          </div>
        </motion.section>

        {services.map((service, index) => (
          <motion.section
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 * index }}
            className="mb-24 p-8 rounded-2xl bg-white/90 backdrop-blur-sm"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className={`space-y-6 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                <h2 className="text-3xl font-bold text-gray-800">{service.title}</h2>
                <p className="text-lg text-gray-600">{service.description}</p>
                <ul className="list-disc pl-5 text-gray-600">
                  {service.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>
              <div className={`relative h-[400px] ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover rounded-lg shadow-xl"
                />
              </div>
            </div>
          </motion.section>
        ))}

        {/* Why Choose BQI Tech Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 p-8 rounded-2xl bg-gradient-to-r from-[#272055] to-[#31CDFF] text-white"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Why Choose BQI Tech?</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Industry-Leading Expertise</h3>
                  <p>Our team stays ahead of industry trends, delivering cutting-edge solutions.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Scalable & Secure Solutions</h3>
                  <p>We implement future-proof, security-focused IT strategies.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">End-to-End IT Services</h3>
                  <p>From implementation to maintenance, we provide seamless IT solutions.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 mb-24 p-12 rounded-2xl bg-white/90 backdrop-blur-sm"
        >
          <h2 className="text-3xl font-bold mb-4">Interested in Our Services?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Let's discuss how BQI Tech can empower your business with advanced IT solutions.
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/contact-us">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#272055] hover:bg-[#31CDFF] text-white rounded-full px-12 py-4 
                         text-lg font-semibold inline-flex items-center gap-2 shadow-lg 
                         transition-all duration-300"
              >
                Contact Us Today
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </motion.main>
    </>
  )
}
