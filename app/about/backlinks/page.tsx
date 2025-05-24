"use client"

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { LinkExchange } from '@/components/LinkExchange'
import Head from 'next/head'

// Move metadata to a separate file
import { metadata } from './metadata'

const partners = [
  {
    name: "Microsoft",
    logo: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&auto=format&fit=crop&q=80",
    description: "Cloud Solutions Partner",
    link: "#",
    bgColor: "bg-gradient-to-br from-[#f3f3f3] to-[#e1e1e1]"
  },
  {
    name: "AWS",
    logo: "https://images.unsplash.com/photo-1549605659-32d82da3a059?w=800&auto=format&fit=crop&q=80",
    description: "Infrastructure Partner",
    link: "#",
    bgColor: "bg-gradient-to-br from-[#232f3e] to-[#1a242f]"
  },
  {
    name: "Oracle",
    logo: "https://images.unsplash.com/photo-1607743386760-88ac62b89b8a?w=800&auto=format&fit=crop&q=80",
    description: "Database Solutions Partner",
    link: "#",
    bgColor: "bg-gradient-to-br from-[#f80000] to-[#c00000]"
  }
]

const benefits = [
  {
    title: "Enhanced Visibility",
    description: "Gain exposure to government and enterprise clients through our network",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
    gradient: "from-blue-500 to-purple-500",
    bgColor: "bg-indigo-100"
  },
  {
    title: "Technical Integration",
    description: "Access our API and technical resources for seamless integration",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
    gradient: "from-[#31CDFF] to-blue-500",
    bgColor: "bg-cyan-100"
  },
  {
    title: "Market Access",
    description: "Enter the government technology market with an established partner",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
    gradient: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-100"
  }
]

export default function BacklinksPage() {
  return (
    <>
      <Head>
        <meta name="robots" content="index,follow" />
      </Head>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-16">
          <Image
            src="/images/partnership-hero.jpg"
            alt="Partnership Hero"
            width={2000}
            height={600}
            className="object-cover h-[400px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#272055]/90 to-[#31CDFF]/80 flex items-center">
            <div className="max-w-3xl mx-auto text-center px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Partner with BQI Tech
              </h1>
              <p className="text-xl text-gray-100">
                Join our ecosystem of technology partners and help shape the future of government digital transformation
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Benefits Grid */}
          <section className="mb-24">
            <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-[#272055] to-[#31CDFF] bg-clip-text text-transparent">
              Partnership Benefits
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {benefits.map((benefit) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  <div className={`relative h-48 mb-8 rounded-2xl ${benefit.bgColor} overflow-hidden group`}>
                    <Image
                      src={benefit.image}
                      alt={benefit.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} opacity-20`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#272055] to-[#31CDFF] bg-clip-text text-transparent">
                    {benefit.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Featured Partners */}
          <section className="mb-24">
            <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-[#272055] to-[#31CDFF] bg-clip-text text-transparent">
              Featured Partners
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {partners.map((partner) => (
                <Link 
                  key={partner.name}
                  href={partner.link}
                  className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  <div className={`relative h-64 ${partner.bgColor}`}>
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-[#31CDFF] transition-colors duration-300">
                      {partner.name}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      {partner.description}
                    </p>
                    <div className="mt-6 flex items-center text-[#31CDFF] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Learn More</span>
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Link Exchange Program */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Link Exchange Program</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Join our link exchange program to establish mutually beneficial partnerships 
                  in the government technology sector. We carefully select partners who share 
                  our commitment to innovation and excellence.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="text-[#31CDFF]">✓</span>
                    High-authority backlinks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#31CDFF]">✓</span>
                    Relevant industry connections
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#31CDFF]">✓</span>
                    Enhanced SEO benefits
                  </li>
                </ul>
              </div>
              <LinkExchange />
            </div>
          </section>

          {/* CTA Section */}
          <section>
            <div className="bg-gradient-to-r from-[#272055] to-[#31CDFF] p-8 rounded-2xl text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Partner?</h2>
              <p className="text-xl mb-8">
                Let's explore how we can create value together in the government technology sector.
              </p>
              <Link 
                href="/contact-us?type=partnership" 
                className="inline-block bg-white text-[#31CDFF] px-8 py-4 rounded-full font-semibold hover:bg-opacity-90 transition-colors"
              >
                Start the Conversation
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  )
} 