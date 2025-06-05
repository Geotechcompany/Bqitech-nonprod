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
      github: "#"
    }
  },
  {
    name: "Victor Ongeto",
    role: "Senior Configuration Analyst",

    image: "/Teams/Victor.jpg",
    social: {
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Lovell Oduor",
    role: "Configuration Analyst",
 
    image: "/Teams/Lovell.jpg",
    social: {
      linkedin: "#",
      github: "#"
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
      <motion.section className="mb-24 px-4">
        <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-[#31CDFF] to-purple-600 bg-clip-text text-transparent">
          Our Team
        </h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
          {team.map((member, index) => (
            <motion.div 
              key={member.name}
              className="group relative w-full sm:w-[45%] lg:w-[30%] xl:w-[22%] h-[480px] sm:h-[520px] md:h-[560px]"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ 
                delay: index * 0.1, 
                type: "spring", 
                stiffness: 120,
                damping: 20
              }}
            >
              {/* Card Container */}
              <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500">
                {/* Dynamic Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-400/20 animate-gradient-shift" />
                
                {/* Image Container */}
                <div className="relative h-3/4 w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top scale-100 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Profile Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 h-1/4 text-white z-20 bg-black/90 ">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold tracking-tighter text-white">
                        {member.name}
                      </h3>
                      <p className="text-sm text-[#31CDFF] font-medium mt-1">
                        {member.role}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={member.social.linkedin} className="p-2 bg-white/10 rounded-full hover:bg-[#31CDFF] transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                      <a href={member.social.github} className="p-2 bg-white/10 rounded-full hover:bg-[#31CDFF] transition-colors">
                        <Github className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
             
                </div>
              </div>

              {/* Floating Blob Element */}
              <div className="absolute -inset-4 -z-10 opacity-0 group-hover:opacity-40 transition-opacity duration-300">
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-500 rounded-[3rem] blur-xl" />
              </div>
            </motion.div>
          ))}
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
