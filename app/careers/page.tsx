"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useState, useEffect, useRef } from "react";
import Loader from "@/components/Loader";
import { useInView } from "framer-motion";

const recruitmentSteps = [
  {
    title: "HR Screening",
    description:
      "Initial 15-30 minute phone interview to discuss your background, aspirations, and answer your questions about the role.",
    icon: "👋",
    color: "from-blue-400 to-blue-600",
    duration: "15-30 mins"
  },
  {
    title: "Technical Discussion",
    description:
      "Deep dive into your technical expertise, past projects, and problem-solving approach with our engineering team.",
    icon: "💻",
    color: "from-purple-400 to-purple-600",
    duration: "45-60 mins"
  },
  {
    title: "Practical Assessment",
    description:
      "Complete a take-home project or live coding session to demonstrate your skills in a real-world scenario.",
    icon: "🛠️",
    color: "from-green-400 to-green-600",
    duration: "2-3 hours"
  },
  {
    title: "Final Interview",
    description:
      "Discussion with leadership about compensation, benefits, and next steps in your journey with us.",
    icon: "🎯",
    color: "from-pink-400 to-pink-600",
    duration: "30-45 mins"
  }
];

const sections = [
  {
    title: "Why Work at BQI Tech?",
    content: `At BQI Tech, we don't just build software—we drive digital transformation. Our teams work on cutting-edge projects that power businesses and governments worldwide. We believe in a culture of innovation, collaboration, and continuous learning, where every team member plays a crucial role in our success.`,
    points: [
      "Agility & Adaptability: We embrace change and stay ahead of industry trends.",
      "Impact-Driven Excellence: We deliver top-tier solutions that make a difference.",
      "Innovation at Our Core: We challenge the status quo and push boundaries.",
      "Stay Curious, Stay Hungry: Continuous learning fuels our growth.",
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

// Add this new animation helper
const staggerChildren = {
  animate: {
    transition: {
      delayChildren: 0.4,
      staggerChildren: 0.1,
    }
  }
};

const shimmerAnimation = {
  initial: { backgroundPosition: "-500px 0" },
  animate: { 
    backgroundPosition: ["500px 0", "-500px 0"],
    transition: {
      repeat: Infinity,
      duration: 3,
    }
  }
};

// Remove or comment out the morphTransitionVariants
// const morphTransitionVariants = {
//   hidden: { 
//     opacity: 0,
//     rotateX: 12, 
//     rotateY: -5,
//     rotateZ: 1,
//     scale: 0.92,
//     transformPerspective: 1400,
//     z: -100,
//     filter: "blur(6px)"
//   },
//   visible: { 
//     opacity: 1,
//     rotateX: 0, 
//     rotateY: 0,
//     rotateZ: 0,
//     scale: 1,
//     transformPerspective: 1400,
//     z: 0,
//     filter: "blur(0px)",
//     transition: { 
//       type: "spring", 
//       stiffness: 40, 
//       damping: 18,
//       mass: 1.2,
//       duration: 1.1
//     } 
//   }
// };

export default function CareersPage() {
  const [isLoading, setIsLoading] = useState(true);

  const processRef = useRef(null);
  const isProcessInView = useInView(processRef, { once: true, margin: "-100px" });

  useEffect(() => {
    // Create an array of promises for all images
    const imagesToLoad = [
      "/careers-hero-bg.jpg",
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

  const breadcrumbItems = [{ label: "Careers" }];

  return (
    <motion.main
      className="container mx-auto px-4 py-16 -mt-16 relative"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }}
      transition={{ duration: 0.8 }}
    >
      <Breadcrumb items={breadcrumbItems} />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative mb-16 py-32 overflow-hidden rounded-3xl"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/careers-hero-bg.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#272055]/95 to-[#31CDFF]/90 backdrop-blur-sm" />
          <div className="absolute inset-0  opacity-20 animate-float" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            variants={shimmerAnimation}
            initial="initial"
            animate="animate"
            className="mb-6 inline-block"
          >
            <span className="bg-gradient-to-r from-white/10 via-white/20 to-white/10 bg-[length:500px_100%] bg-no-repeat text-white px-6 py-3 rounded-full text-sm font-medium border border-white/20 backdrop-blur-sm">
              🚀 We're Hiring! Join Our Team
            </span>
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Careers at{" "}
            <span className="bg-gradient-to-r from-white to-blue-200 text-transparent bg-clip-text drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
              BQI Tech
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-white max-w-3xl mx-auto mb-6 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Join a team where innovation meets impact and shape the
            future of technology!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold 
                         transition-colors duration-300 mr-4 shadow-lg shadow-cyan-500/20"
              onClick={() => (window.location.href = "/careers/jobs")}
            >
              View Current Vacancies
            </Button>
            <Button
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold 
                         transition-colors duration-300 backdrop-blur-sm border border-white/30 
                         shadow-lg shadow-black/10"
              onClick={() => (window.location.href = "/contact-us")}
            >
              Contact Us
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        ref={processRef}
        className="mb-24 py-16 bg-white rounded-3xl shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/10 to-blue-50/30" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <motion.span 
              className="inline-block text-sm font-semibold text-cyan-600 mb-4 bg-cyan-50 px-4 py-1 rounded-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Our Hiring Process
            </motion.span>
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-[#272055] to-[#31CDFF] bg-clip-text text-transparent">
                Your Journey to Join Our Team
              </span>
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Our comprehensive hiring process is designed to be transparent, fair, and focused on finding the right fit for both candidates and our team.
            </p>
          </div>

          <div className="flex justify-center mb-16">
            <motion.img
              src="/recruitmentprocess.svg"
              alt="Recruitment Process"
              className="w-full max-w-4xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center"
          >
            <p className="text-gray-600 mb-6">
              Ready to start your journey with us? Check out our current openings!
            </p>
            <Button
              className="bg-gradient-to-r from-[#272055] to-[#31CDFF] text-white px-8 py-3 rounded-full 
                         hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
              onClick={() => (window.location.href = "/careers/jobs")}
            >
              View Open Positions →
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {sections.map((section, index) => (
        <motion.section
          key={section.title}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-24 bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl 
                     transition-all duration-500 transform hover:-translate-y-1"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center p-12">
            <motion.div
              className={`space-y-6 ${index % 2 === 0 ? "md:order-1" : "md:order-2"}`}
              variants={staggerChildren}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#272055] to-[#31CDFF] 
                           bg-clip-text text-transparent">{section.title}</h2>
              <p className="text-lg text-gray-600">{section.content}</p>
              
              <h3 className="text-xl font-semibold">Our Culture and Core Values:</h3>
              
              <ul className="space-y-4">
                {section.points.map((point, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center space-x-3 text-gray-600"
                  >
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#272055] to-[#31CDFF]" />
                    <span>{point}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              className={`relative h-[400px] ${index % 2 === 0 ? "md:order-2" : "md:order-1"}`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={section.image}
                alt={section.title}
                fill
                className="object-cover rounded-lg shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          </div>
        </motion.section>
      ))}

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mb-24 py-24 rounded-3xl overflow-hidden group"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
            alt="Team collaboration background"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#272055]/90 to-[#31CDFF]/90" />
          <div className="absolute inset-0 opacity-20 
                         group-hover:scale-110 transition-transform duration-700" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl text-white font-semibold mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join Us Today!
          </motion.h2>
          <motion.p
            className="text-lg text-white mb-6 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Are you ready to take your career to the next level? Explore our open positions and become
            part of a team that's redefining tech solutions.
          </motion.p>
          <Button
            className="bg-white text-[#272055] hover:bg-cyan-50 px-8 py-4 rounded-full font-semibold 
                     transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1
                     border border-white/20 backdrop-blur-sm"
            onClick={() => (window.location.href = "/careers/jobs")}
          >
            View Current Vacancies →
          </Button>
        </div>
      </motion.section>
    </motion.main>
  );
}