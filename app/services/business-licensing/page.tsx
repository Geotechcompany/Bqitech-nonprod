"use client";

import { motion } from "framer-motion";
import { ServiceLayout } from "@/components/layouts/ServiceLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, FileCheck, Users, ArrowRight } from "lucide-react";

export default function BusinessLicensing() {
  const breadcrumbItems = [
    { label: "Services", href: "/services" },
    { label: "Business Licensing" },
  ];

  const features = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Company Formation",
      description: "Complete assistance with company registration and setup",
    },
    {
      icon: <FileCheck className="h-6 w-6" />,
      title: "License Processing",
      description: "Streamlined business license application and processing",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Compliance Support",
      description: "Ongoing compliance and regulatory support services",
    },
  ];

  return (
    <ServiceLayout
      title="Business Licensing"
      subtitle="Streamlined solutions for all your business licensing needs"
      breadcrumbItems={breadcrumbItems}
    >
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 text-[#31CDFF]">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Button className="bg-[#272055] hover:bg-[#31CDFF] text-white rounded-full px-8 py-6">
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </ServiceLayout>
  );
}
