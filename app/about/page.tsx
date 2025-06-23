"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Shield, Lightbulb, Code, Users, Target, Award, Linkedin, Github } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const expertise = [
  { 
    icon: Code, 
    title: 'Custom Software Development', 
    description: 'We design and develop high-performance, scalable software solutions tailored to meet the unique needs of government agencies and enterprises.',
    features: [
      'Web & Mobile Application Development - Secure, responsive, and user-friendly digital solutions.',
      'Legacy System Modernization - Transform outdated systems into modern, cloud-based platforms.',
      'Cloud-Native Solutions - Scalable, secure cloud applications to improve operational efficiency.',
      'API Development & Integration - Seamless data connectivity between systems.'
    ]
  },
  { 
    icon: Lightbulb, 
    title: 'Enterprise Platform & IT Consulting', 
    description: 'We provide comprehensive IT consulting and enterprise platform optimization services to help organizations implement and manage large-scale systems.',
    features: [
      'Enterprise Platform Setup - Full-scale implementation and configuration for government IT solutions.',
      'System Optimization & Performance Tuning - Enhancing speed, security, and efficiency.',
      'Workflow Automation - Streamlining processes with AI-powered automation.',
      'Custom Configuration Services - Tailored adjustments to maximize your system\'s capabilities.'
    ]
  },
]

const leadership = [
 
  {
    title: "Our Community",
    description: "We actively participate in technology conferences and government innovation forums to stay at the forefront of public sector solutions.",
    image: "/community.jpg",
    link: "Join our Community"
  }
]

const team = [
  {
    name: "Lynn Sugut",
    role: "Chief Technology Officer",
 
    image: "/Teams/lynn 2 1.jpg",
    social: {
      linkedin: "#",
     
    }
  },
  {
    name: "Victor Ongeto",
    role: "Senior Configuration Analyst",

    image: "/Teams/Victor.jpg",
    social: {
      linkedin: "#",
     
    }
  },
  {
    name: "Lovell Oduor",
    role: "Configuration Analyst",
 
    image: "/Teams/Lovell.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/lovelloduor/",
   
    }
  },
  {
    name: "Geoffrey Audia",
    role: "Configuration Analyst",
    image: "/Teams/Geo1.jpg",
    social: {
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Ian Mosonik",
    role: "Configuration Analyst",
    image: "/Teams/Ian 1.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/ian-mosonik-a18089225/",
      github: "#"
    }
  },
  {
    name: "Gloria Onyancha",
    role: "Configuration Analyst",
    image: "/Teams/Gloria 2.jpg",
    social: {
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Geoffrey Nyakundi",
    role: "Software Engineer",
    image: "/Teams/Geoffrey Nyakundi.jpg",
    social: {
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Felix Ronoh",
    role: "Software Engineer",
    image: "/Teams/Felix.jpg",
    social: {
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Nigel Watunu",
    role: "Operations",
    image: "/Teams/Nigel.jpg",
    social: {
      linkedin: "#",
      github: "#"
    }
  }
]

export default function AboutPage() {
  const breadcrumbItems = [
    { label: "About" }
  ]

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const router = useRouter()

  return (
    <motion.main 
      className="container mx-auto px-4 py-16 -mt-16"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative mb-16 py-24 overflow-hidden rounded-2xl"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 clip-path-blob animate-float">
            <Image
              src="/images/about-hero-bg.jpg"
              alt=""
              fill
              className="object-cover"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#272055]/90 to-[#31CDFF]/80" />
          </div>
        </div>

      

        {/* Content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
            About{" "}
            <span className="bg-gradient-to-r from-[#31CDFF] to-purple-600 text-transparent bg-clip-text">
              BQI Tech
            </span>
          </h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">
          BQI Tech is a leading software development and IT consulting firm specializing in custom technology solutions for government agencies and businesses. We combine cutting-edge innovation, security-first approaches, and enterprise-level expertise to help organizations streamline operations, modernize legacy systems, and enhance digital transformation.          </p>
        </div>
      </motion.section>

    

      {/* Our Mission Section */}
      <motion.section 
        className="mb-16 bg-gradient-to-br from-[#31CDFF]/10 to-blue-500/10 p-8 rounded-2xl border border-[#31CDFF]/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="flex items-start gap-6">
          <div className="bg-gradient-to-br from-[#31CDFF] to-purple-600 p-4 rounded-xl">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold mb-4 bg-gradient-to-r from-[#31CDFF] to-purple-600 bg-clip-text text-transparent">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              We empower organizations with tailor-made technology solutions designed to improve efficiency, 
              security, and scalability. Our mission is to bridge the gap between technology and government 
              operations, ensuring that agencies can deliver better public services through digital innovation.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Expertise Section */}
      <motion.section className="mb-24">
        <h2 className="text-3xl font-semibold mb-8 text-center bg-gradient-to-r from-[#31CDFF] to-purple-600 bg-clip-text text-transparent">
          Our Expertise
        </h2>
        <div className="grid md:grid-cols-2 gap-8 px-4">
          {expertise.map((item, index) => (
            <motion.div
              key={item.title}
              className="group relative bg-gradient-to-br from-[#31CDFF]/10 to-purple-600/10 via-blue-200/10 p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300
                         border-2 border-[#31CDFF]/20 hover:border-[#31CDFF]/40 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Animated background element */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -right-20 -top-20 h-64 w-64 bg-[#31CDFF]/10 rounded-full blur-3xl group-hover:bg-purple-600/10 transition-colors duration-300" />
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-[#31CDFF] to-purple-600 p-4 rounded-2xl mb-6 shadow-lg">
                  <item.icon className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#31CDFF] to-purple-600 bg-clip-text text-transparent">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                  {item.description}
                </p>
                
                {/* Features List */}
                <div className="w-full space-y-4 mt-4">
                  {item.features.map((feature, i) => (
                    <motion.div
                      key={feature}
                      className="flex items-start gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                    >
                      <div className="bg-[#31CDFF]/10 p-2 rounded-full">
                        <ChevronRight className="w-5 h-5 text-[#31CDFF]" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-base">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section className="mb-24 px-4 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-[#31CDFF]/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-purple-600/10 to-[#31CDFF]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#31CDFF] to-purple-600 bg-clip-text text-transparent">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Our diverse team of experts brings together years of experience in technology, innovation, and client success.
            </p>
          </motion.div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {team.map((member, index) => (
              <motion.div 
                key={member.name}
                className={`group relative ${index === team.length - 1 && team.length % 4 !== 0 ? 'xl:col-start-2 xl:col-end-4 xl:justify-self-center xl:w-full xl:max-w-[280px]' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.6,
                  ease: [0.21, 0.47, 0.32, 0.98]
                }}
              >
                {/* Main Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#31CDFF] via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10 scale-105"></div>
                  
                  {/* Image Container */}
                  <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Social Links Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      <div className="flex gap-3">
                        {member.social.linkedin && (
                          <motion.a
                            href={member.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-[#31CDFF] transition-all duration-300 hover:scale-110"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Linkedin className="w-5 h-5 text-white" />
                          </motion.a>
                        )}
                        {member.social.github && (
                          <motion.a
                            href={member.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-purple-600 transition-all duration-300 hover:scale-110"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Github className="w-5 h-5 text-white" />
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 relative">
                    {/* Decorative Element */}
                    <div className="absolute top-0 left-4 w-8 h-1 bg-gradient-to-r from-[#31CDFF] to-purple-600 transform -translate-y-1/2 rounded-full"></div>
                    
                    <div className="pt-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#31CDFF] transition-colors duration-300">
                        {member.name}
                      </h3>
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wider">
                        {member.role}
                      </p>
                      
                      {/* Animated Underline */}
                      <div className="w-0 h-0.5 bg-gradient-to-r from-[#31CDFF] to-purple-600 group-hover:w-full transition-all duration-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#31CDFF] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse delay-150"></div>
                </div>

                {/* Glowing Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#31CDFF]/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-20 scale-110"></div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="text-base text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
              Ready to work with our exceptional team? Let's discuss how we can help transform your business.
            </p>
            <motion.button
              className="bg-gradient-to-r from-[#31CDFF] to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-[#31CDFF]/25 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/contact-us')}
            >
              Get In Touch
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Leadership & Community Sections */}
      {leadership.map((section, index) => (
        <motion.section
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 * index }}
          className="mb-24"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`space-y-6 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
              <h2 className="text-3xl font-bold text-gray-800">{section.title}</h2>
              <p className="text-lg text-gray-600">{section.description}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-teal-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-600 transition-colors duration-300"
                onClick={() => router.push('https://www.linkedin.com/company/bqi-technologies')}
              >
                {section.link}
              </motion.button>
            </div>
            <div className={`relative h-[400px] ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
              <div className="absolute inset-0 clip-path-blob-3 animate-float-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#31CDFF]/30 to-purple-600/20 mix-blend-soft-light" />
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  className="object-cover"
                  style={{ transform: 'scale(1.05)' }}
                />
              </div>
            </div>
          </div>
        </motion.section>
      ))}

    

      {/* Commitment Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-16 px-4 rounded-lg"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">Our Commitment to Innovation</h2>
          <p className="text-lg mb-6">
          We are actively engaged in technology conferences, government innovation forums, and research
initiatives to stay at the forefront of public sector technology advancements. By continuously adapting to
emerging trends, we help clients future-proof their IT infrastructure and stay ahead in an evolving digital
landscapе  </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-teal-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300"
            onClick={() => router.push('/services')}
          >
            Learn More About Our Services
          </motion.button>
        </div>
      </motion.section>
    </motion.main>
  )
}
