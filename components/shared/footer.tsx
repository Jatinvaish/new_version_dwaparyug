"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MapPin, Phone, Mail, Send, Facebook, Instagram, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <motion.div
        className="absolute right-20 top-20 text-yellow-400"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <div className="w-12 h-12 bg-yellow-400 rounded-lg transform rotate-45"></div>
      </motion.div>

      <motion.div
        className="absolute left-20 bottom-20 text-red-400"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <div className="w-8 h-8 bg-red-400 transform rotate-45"></div>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo and About */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mr-3">
                <Heart className="w-6 h-6 text-black fill-current" />
              </div>
              <div className="w-6 h-6 bg-yellow-400 transform rotate-45"></div>
            </div>

            <div className="mb-6">
              <div className="bg-black text-white px-3 py-2 text-sm font-bold inline-block">
                dwaparyug FOUNDATION
                <div className="text-xs text-gray-300">ON HIS PATH OF DHARMA</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-green-400 font-semibold">About Us</h4>
              <p className="text-gray-300 text-sm">We Believe It Has The Power To Supportive Things Together</p>
              <div className="text-yellow-400">support@dwaparyug.org</div>

              <div>
                <h5 className="font-semibold mb-2">Opening Hours</h5>
                <div className="text-sm text-gray-300">
                  <div>9:30am - 6:30pm</div>
                  <div>Monday To Friday</div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Posts */}
          <div>
            <h4 className="text-xl font-semibold mb-6">Latest Post</h4>
            <div className="space-y-4">
              {[
                { date: "24th May 2023", title: "This Place Really Place For Awesome" },
                { date: "24th May 2023", title: "This Place Really Place For Awesome" },
              ].map((post, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                    85x85
                  </div>
                  <div>
                    <div className="text-yellow-400 text-sm">📅 {post.date}</div>
                    <div className="text-sm">{post.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Get In Touch */}
          <div>
            <h4 className="text-xl font-semibold mb-6">Get In Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-yellow-400 mr-3 mt-1" />
                <div>
                  <div className="font-semibold">Address</div>
                  <div className="text-gray-300 text-sm">719 mehalla mohalla madanpur khadar</div>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-5 h-5 text-yellow-400 mr-3 mt-1" />
                <div>
                  <div className="font-semibold">Phone</div>
                  <div className="text-gray-300 text-sm">+91 99993 03166</div>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="w-5 h-5 text-yellow-400 mr-3 mt-1" />
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-gray-300 text-sm">support@dwaparyug.org</div>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xl font-semibold mb-6">Newsletter</h4>
            <p className="text-gray-300 text-sm mb-6">
              Indignation And Dislike Men Who Are So Beguiled And Demoralized By
            </p>

            <div className="flex mb-4">
              <Input placeholder="Enter Email" className="bg-gray-800 border-gray-700 text-white rounded-r-none" />
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-l-none cursor-pointer">
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center text-sm">
              <input type="checkbox" className="mr-2" />
              <span className="text-gray-300">I Agree All Your Terms &Policies</span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link href="#" className="text-gray-300 hover:text-white cursor-pointer">
              Support
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white cursor-pointer">
              Terms & Conditions
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white cursor-pointer">
              Privacy Policy
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link href="#" className="text-gray-300 hover:text-white cursor-pointer">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white cursor-pointer">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white cursor-pointer">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white cursor-pointer">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="text-center mt-8 pt-8 border-t border-gray-800">
          <div className="text-blue-400">Copyright © 2025 Dwaparyug Foundation. All Rights Reserved.</div>
        </div>
      </div>
    </footer>
  )
}
