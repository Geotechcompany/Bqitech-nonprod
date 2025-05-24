"use client"

import { motion } from "framer-motion"
import { ServiceLayout } from "@/components/layouts/ServiceLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, LineChart, Shield } from "lucide-react"

export default function ProfessionalServices() {
  const breadcrumbItems = [
    { label: "Services", href: "/services" },
    { label: "Professional Services" }
  ]

  const services = [
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Business Consulting",
      description: "Strategic guidance for business growth and optimization"
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Performance Analysis",
      description: "In-depth analysis and performance improvement strategies"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Risk Management",
      description: "Comprehensive risk assessment and mitigation services"
    }
  ]

  return (
    <ServiceLayout
      title="Professional Services"
      subtitle="Expert consulting and implementation services"
      breadcrumbItems={breadcrumbItems}
    >
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 text-[#31CDFF]">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 p-8 rounded-2xl"
      >
        <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
        <p className="text-gray-600 mb-6">
          Contact our team of experts to discuss your business needs and how we can help.
        </p>
        <Button 
          className="bg-[#272055] hover:bg-[#31CDFF] text-white rounded-full px-8"
        >
          Schedule Consultation
        </Button>
      </motion.div>
    </ServiceLayout>
  )
} 