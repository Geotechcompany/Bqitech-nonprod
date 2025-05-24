"use client"

import { motion } from "framer-motion"
import { ServiceLayout } from "@/components/layouts/ServiceLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Globe, Headphones } from "lucide-react"

export default function OtherServices() {
  const breadcrumbItems = [
    { label: "Services", href: "/services" },
    { label: "Other Services" }
  ]

  const services = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "International Services",
      description: "Global business expansion and compliance support"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Documentation Services",
      description: "Professional document preparation and management"
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "Support Services",
      description: "Ongoing technical and business support solutions"
    }
  ]

  return (
    <ServiceLayout
      title="Other Services"
      subtitle="Additional business support services to help you succeed"
      breadcrumbItems={breadcrumbItems}
    >
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center text-center"
      >
        <h2 className="text-2xl font-semibold mb-4">Need a Custom Solution?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl">
          We offer customized services to meet your specific business requirements. 
          Contact us to discuss your needs.
        </p>
        <Button 
          className="bg-[#272055] hover:bg-[#31CDFF] text-white rounded-full px-8"
        >
          Contact Us
        </Button>
      </motion.div>
    </ServiceLayout>
  )
} 