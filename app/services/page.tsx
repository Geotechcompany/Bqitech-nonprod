'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Briefcase, Code, CheckCircle, ArrowRight } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import Link from 'next/link'

const services = [
  {
    icon: Briefcase,
    title: 'Professional IT Implementation Services',
    description: `Our team of technical experts brings hands-on experience to tackle complex IT projects. We specialize in configuring enterprise platforms, ensuring smooth integration and optimized performance.`,
    details: [
      'Enterprise Platform Configuration – Our experts customize and configure your enterprise systems to enhance performance and usability.',
      'Advanced Report Writing – We simplify the process of generating custom reports using SSRS, Crystal Reports, and other reporting tools, helping you gain valuable business insights.'
    ],
    image: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=1600'
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
    image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=1600'
  }
]

export default function ServicesPage() {
  const breadcrumbItems = [
    { label: "Services" }
  ]

  return (
    <>
      {/* Simple gradient background instead of 3D */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
      
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
            <Image
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80"
              alt="Technology background"
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-700/80 via-indigo-600/80 to-cyan-600/80" />
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
          className="mb-16 p-8 rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl"
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-800 leading-relaxed font-medium">
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
            className="mb-24 group"
          >
            <div className="relative p-8 rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg
                            hover:bg-white/98 transition-all duration-500
                            before:absolute before:inset-0 before:rounded-2xl
                            before:bg-gradient-to-r before:from-violet-500/20 before:to-cyan-500/20
                            before:opacity-0 before:transition-opacity hover:before:opacity-100"
            >
              <div className="grid md:grid-cols-2 gap-12 items-center relative">
                <div className={`space-y-6 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">{service.title}</h2>
                  </div>
                  <p className="text-lg text-gray-800 font-medium">{service.description}</p>
                  <ul className="space-y-4">
                    {service.details.map((detail, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 text-gray-800"
                      >
                        <span className="mt-1.5 h-3 w-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex-shrink-0" />
                        <span className="font-medium">{detail}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className={`relative h-[400px] group ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full rounded-lg overflow-hidden shadow-xl"
                  >
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>
        ))}

        {/* Why Choose BQI Tech Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 p-8 rounded-2xl relative overflow-hidden"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-700/85 via-indigo-600/85 to-cyan-600/85 z-0" />
          <motion.div
            initial={{ backgroundPosition: "0% 0%" }}
            animate={{ backgroundPosition: "100% 100%" }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 bg-gradient-to-r from-violet-400/5 to-cyan-400/5 z-10"
          />
          
          <div className="max-w-4xl mx-auto relative z-20">
            <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
              <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </span>
              Why Choose BQI Tech?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Industry-Leading Expertise",
                  description: "Our team stays ahead of industry trends, delivering cutting-edge solutions."
                },
                {
                  title: "Scalable & Secure Solutions",
                  description: "We implement future-proof, security-focused IT strategies."
                },
                {
                  title: "End-to-End IT Services",
                  description: "From implementation to maintenance, we provide seamless IT solutions."
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/30 
                             transition-all duration-300 border border-white/30 hover:border-white/40
                             hover:shadow-lg hover:shadow-white/10"
                >
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-white/90 font-medium leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
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
                className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 
                           text-white rounded-full px-12 py-4 text-lg font-semibold inline-flex items-center gap-2 
                           shadow-lg shadow-violet-500/20 transition-all duration-300"
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