"use client"

import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const socialLinks = [
  { name: "Facebook", icon: Facebook, color: "text-blue-600", href: "#" },
  { name: "Twitter", icon: Twitter, color: "text-blue-400", href: "#" },
  { name: "Instagram", icon: Instagram, color: "text-pink-600", href: "#" },
  { name: "Youtube", icon: Youtube, color: "text-red-600", href: "#" },
  { name: "Pinterest", icon: "📌", color: "text-red-500", href: "#" },
  { name: "Linkedin", icon: Linkedin, color: "text-blue-700", href: "#" },
]

export function SocialLinksBar() {
  return (
    <div className="border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-6 gap-4 px-4">
        {socialLinks.map((social, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer"
          >
            <Link
              href={social.href}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 bg-white"
            >
              <div className={`${social.color} mb-2 flex justify-center`}>
                {typeof social.icon === "string" ? (
                  <span className="text-2xl">{social.icon}</span>
                ) : (
                  <social.icon className="w-6 h-6" />
                )}
              </div>
              <div className="font-semibold text-gray-900 text-sm">{social.name}</div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
