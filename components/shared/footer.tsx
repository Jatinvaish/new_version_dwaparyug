"use client"

import Image from "next/image";
import logo from "@/public/images/logo/logo.png";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MapPin, Phone, Mail, Send, Facebook, Instagram, Twitter, Linkedin, Sparkles, Star } from "lucide-react"

export function Footer() {
  const [email, setEmail] = useState("")
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = () => {
    if (email && agreed) {
      console.log("Newsletter subscription:", email)
      setEmail("")
      setAgreed(false)
    }
  }

  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white py-16 px-6 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 right-16 animate-pulse">
          <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-24 left-32 animate-bounce" style={{ animationDelay: '1s' }}>
          <div className="w-2 h-2 bg-blue-400 rounded-full opacity-40"></div>
        </div>
        <div className="absolute bottom-16 right-40 animate-pulse" style={{ animationDelay: '2s' }}>
          <Star className="w-6 h-6 text-yellow-300 opacity-30" />
        </div>
        <div className="absolute bottom-24 left-16 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <Sparkles className="w-8 h-8 text-purple-400 opacity-20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white fill-current" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-500 transform rotate-45 opacity-80"></div>
              </div>
              <div className="bg-gradient-to-r from-slate-800 to-black px-4 py-2 rounded text-sm font-bold border border-slate-700 flex items-center">
                <Image
                  src={logo}
                  alt="Dwaparyug Foundation Logo"
                  height={50} // match your uploaded logo's height
                  width={199} // match aspect ratio
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-slate-300 text-base leading-relaxed">Empowering communities through dharma and compassion</p>
            <div className="text-yellow-400 text-sm font-medium">support@dwaparyug.org</div>
            <div className="text-sm text-slate-400">
              <div className="font-medium text-slate-300 text-base">Hours:</div>
              <div>Mon-Fri: 9:30am - 6:30pm</div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-3"></div>
              Contact
            </h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-slate-300 font-medium text-base">Address</div>
                  <div className="text-slate-400">719 Mehalla Mohalla, Madanpur Khadar</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-slate-300 font-medium text-base">Phone</div>
                  <div className="text-slate-400">+91 99993 03166</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-slate-300 font-medium text-base">Email</div>
                  <div className="text-slate-400">support@dwaparyug.org</div>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-3"></div>
              Newsletter
            </h4>
            <p className="text-slate-400 text-base leading-relaxed">Stay updated with our latest initiatives and community events</p>

            <div className="space-y-4">
              <div className="flex">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 rounded-r-none text-sm h-12 backdrop-blur-sm"
                />
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black rounded-l-none h-12 px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center text-sm">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mr-3 accent-yellow-400 scale-110"
                />
                <label htmlFor="agree" className="text-slate-400 cursor-pointer">I agree to Terms & Privacy Policy</label>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-3"></div>
              Connect
            </h4>
            <div className="flex space-x-3">
              {[
                { icon: Facebook, href: "#", color: "hover:text-blue-400" },
                { icon: Instagram, href: "https://www.instagram.com/dwaparyugfoundation/", color: "hover:text-pink-400" },
                { icon: Twitter, href: "https://x.com/Dwapar_yug_", color: "hover:text-blue-300" },
                { icon: Linkedin, href: "https://www.linkedin.com/company/dwaparyug-foundation/", color: "hover:text-blue-500" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`w-12 h-12 bg-slate-800/50 backdrop-blur-sm rounded-lg flex items-center justify-center text-slate-400 ${social.color} transition-all duration-300 hover:scale-110 hover:bg-slate-700/50 border border-slate-700/50`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors block">Support</a>
              <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors block">Terms & Conditions</a>
              <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors block">Privacy Policy</a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-800/50 pt-8 space-y-6">
          <div className="text-center text-sm text-slate-400">
            Copyright © 2025 Dwaparyug Foundation. All Rights Reserved.
          </div>

          {/* Developer Credits */}
          <div className="text-center text-sm">
            <span className="text-slate-500">Developed & Maintained by </span>
            <a
              href="https://ajprworld.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium hover:underline"
            >
              AJPR World
            </a>
            {/* <span className="text-slate-500"> & </span>
            <a 
              href="https://jatindevv.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text font-semibold hover:from-purple-300 hover:via-pink-400 hover:to-red-400 transition-all duration-300 hover:scale-105 inline-block hover:underline"
            >
              Jatin Vaishnav ✨
            </a>   */}
          </div>
        </div>
      </div>
    </footer>
  )
}
