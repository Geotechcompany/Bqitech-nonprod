"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useState, useEffect } from "react";
import Loader from "@/components/Loader";

const recruitmentSteps = [
  {
    title: "HR Screening",
    description:
      "Candidates are invited to a phone interview. Interviews typically run for 15-30 minutes, and you'll have time to ask questions throughout the process.",
  },
  {
    title: "1st Stage Interview",
    description:
      "Candidates who pass the HR screening are invited to a 1st interview stage. This interview is an opportunity for the team to learn more about your skills and experiences.",
  },
  {
    title: "Practical Assessment",
    description:
      "Expect to complete at least one practical exercise that tests your technical skills. The test will help you understand the job and help us learn how you'd perform in the role.",
  },
  {
    title: "Final Interview",
    description:
      "This is an in-person interview with members of our leadership team. We look at your communication, problem-solving, innovation, and emotional intelligence.",
  },
];

export default function CareersPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create an array of promises for all images
    const imagesToLoad = [
      "/images/careers-hero-bg.jpg",
      "/culture10.jpg", 
      "/software.png", 
      "/benefits1.jpg", 
      "/footerbg.gif"
    ].map(src => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = reject;
      });
    });

    // Wait for all images to load
    Promise.all(imagesToLoad)
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false)); // Still show content if images fail to load
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  const sections = [
    {
      title: "Our Culture and Values",
      content: `Fostering company culture is a journey and is a vital component in achieving our mission. The goal of developing an inclusive and diverse company culture is to help our employees and customers do extraordinary things. We believe that it's our ability to work together that makes our dreams believable and achievable. We will build on the ideas of others and collaborate across boundaries to bring our best to our customers.`,
      points: [
        "Agility and Adaptability",
        "Impact Drive Excellence",
        "Stay Curious, Stay Hungry",
        "Innovation is our DNA",
      ],
      image: "/culture10.jpg",
    },
    {
      title: "What We Look For",
      content: `We seek talented, driven professionals who thrive in a fast-paced, tech-focused environment.
While our team comes from diverse backgrounds, we all share key qualities:`,
      points: [
        "Diverse Experiences & Perspectives - We value different viewpoints and ideas.",
        "Problem-Solving Mindset - We seek proactive thinkers who embrace challenges.",
        "Clear & Effective Communication - Collaboration is key to our success.",
      ],
      image: "/software.png",
    },
    {
      title: "Benefits",
      content: `Our benefits include:`,
      points: [
        "Competitive compensation",
        "Private Medical Insurance",
        "Group Pension Scheme",
        "Generous holiday allowances + Birtholiday",
        "Professional development days",
        "Employee Assistance Program",
        "Amazing Office Space",
      ],
      image: "/benefits1.jpg",
    },
  ];

  const breadcrumbItems = [{ label: "Careers" }];

  return (
    <motion.main
      className="container mx-auto px-4 py-16 -mt-16 relative"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
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
            src="/images/careers-hero-bg.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#272055]/90 to-[#31CDFF]/80" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Careers at{" "}
            <span className="bg-gradient-to-r from-[#31CDFF] to-purple-600 text-transparent bg-clip-text">
              BQI Tech
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-100 max-w-3xl mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
Join a team where innovation meets impact and shape the
future of technology!          </motion.p>
          <Button
            className="bg-teal-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-600 transition-colors duration-300 mr-4"
            onClick={() => (window.location.href = "/careers/jobs")}
          >
            View Current 
            Vacancies
          </Button>
          <Button
            className="bg-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-600 transition-colors duration-300"
            onClick={() => (window.location.href = "/contact-us")}
          >
            Contact Us
          </Button>
        </div>
      </motion.section>

      {/* Floating SVG Skeletons */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <svg
          className="absolute w-32 h-32 opacity-20 animate-float"
          style={{ top: "15%", left: "10%" }}
        >
          <circle cx="50%" cy="50%" r="50%" fill="#31CDFF" />
        </svg>
      
        <svg
          className="absolute w-28 h-28 opacity-20 animate-float"
          style={{ bottom: "25%", left: "20%" }}
        >
          <polygon points="0,100 50,0 100,100" fill="#FF6B6B" />
        </svg>
        <svg
          className="absolute w-20 h-20 opacity-20 animate-float"
          style={{ top: "60%", left: "5%" }}
        >
          <ellipse cx="50%" cy="50%" rx="50%" ry="30%" fill="#FFD700" />
        </svg>
        <svg
          className="absolute w-36 h-36 opacity-20 animate-float"
          style={{ bottom: "10%", right: "10%" }}
        >
          <path d="M50 0 L100 100 L0 100 Z" fill="#00FF7F" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translatey(0px);
          }
          50% {
            transform: translatey(-10px);
          }
          100% {
            transform: translatey(0px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {sections.map((section, index) => {
        if (index === 0) {
          return (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 * index }}
              className="mb-24"
            >
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  className="space-y-6 md:order-1"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 * index }}
                >
                  <h2 className="text-3xl font-bold text-gray-800">
                    Why Work at BQI Tech?
                  </h2>
                  <p className="text-lg text-gray-600">
                    At BQI Tech, we don't just build software-we drive digital transformation. Our teams work on cutting-edge projects that power
                    businesses and governments worldwide. We believe in a culture of innovation, collaboration, and continuous learning, where every
                    team member plays a crucial role in our success.
                  </p>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Our Culture and Core Values:</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li>
                        <span className="font-semibold">Agility & Adaptability:</span>{" "}
                        We embrace change and stay ahead of industry trends.
                      </li>
                      <li>
                        <span className="font-semibold">Impact-Driven Excellence:</span>{" "}
                        We deliver top-tier solutions that make a difference.
                      </li>
                      <li>
                        <span className="font-semibold">Innovation at Our Core:</span>{" "}
                        We challenge the status quo and push boundaries.
                      </li>
                      <li>
                        <span className="font-semibold">Stay Curious, Stay Hungry:</span>{" "}
                        Continuous learning fuels our growth.
                      </li>
                    </ul>
                  </div>
                </motion.div>
                <motion.div
                  className="relative h-[400px] md:order-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 * index }}
                >
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover rounded-lg shadow-xl"
                  />
                </motion.div>
              </div>
            </motion.section>
          )
        }

        return (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 * index }}
            className="mb-24"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                className={`space-y-6 ${
                  index % 2 === 0 ? "md:order-1" : "md:order-2"
                }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
              >
                <h2 className="text-3xl font-bold text-gray-800">
                  {section.title}
                </h2>
                <p className="text-lg text-gray-600">{section.content}</p>
                <ul className="list-disc pl-5 text-gray-600">
                  {section.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                className={`relative h-[400px] ${
                  index % 2 === 0 ? "md:order-2" : "md:order-1"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
              >
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  className="object-cover rounded-lg shadow-xl"
                />
              </motion.div>
            </div>
          </motion.section>
        )
      })}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mb-24 py-16 bg-white rounded-2xl"
      >
        <div className="flex justify-center">
          <motion.img
            src="/recruitmentprocess.svg"
            alt="Recruitment Process"
            className="w-full max-w-4xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative mb-24 py-16 bg-gray-50 rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="/footerbg.gif"
            alt="Background GIF"
            className="w-full h-full object-cover opacity-90"
          />
        </div>

        <div className="relative z-10 text-center">
          <motion.h2
            className="text-3xl text-white font-semibold mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join Us Today!
          </motion.h2>
          <motion.p
            className="text-lg text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
Are you ready to take your career to the next level? Explore our open positions and become
part of a team that's redefining tech solutions.
          </motion.p>
          <Button
            className="bg-teal-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-600 transition-colors duration-300"
            onClick={() => (window.location.href = "/careers/jobs")}
          >
            View Current Vacancies
          </Button>
        </div>
      </motion.section>
    </motion.main>
  );
}
