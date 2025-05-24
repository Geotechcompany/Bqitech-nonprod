"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    quote: "BQI Tech's solutions have revolutionized our government operations. Their expertise and dedication are unmatched.",
    author: "Jane Doe",
    title: "Director of IT, Government Agency",
    image: "/testimonial-1.jpg",
  },
  {
    quote: "Working with BQI Tech has been a game-changer for our smart city project. Their innovative approach and technical prowess are impressive.",
    author: "John Smith",
    title: "Chief Technology Officer, City Council",
    image: "/testimonial-2.jpg",
  },
  {
    quote: "BQI Tech's custom software solutions have significantly improved our efficiency and data security. Highly recommended!",
    author: "Alice Johnson",
    title: "Head of Operations, Public Sector Organization",
    image: "/testimonial-3.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          What Our Clients Say
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <Image
                  src={testimonial.image}
                  alt={testimonial.author}
                  width={50}
                  height={50}
                  className="rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
