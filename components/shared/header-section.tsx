"use client";
import { scaleOnHover } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Sparkles, Facebook, Instagram, Twitter, Linkedin, Heart, ArrowRight, X, Menu, UserCircle } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import Link from "next/link";
import { useSession, signOut } from 'next-auth/react';
import { useMediaQuery } from 'react-responsive';
import Image from "next/image";
import logo from "@/public/images/logo/logo.png";

// Import Shadcn UI Dropdown components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const HeaderSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  // New: Use a hook to check for mobile screen size
  const isMobile = useMediaQuery({ maxWidth: 1023 }); // Adjust breakpoint as needed, lg breakpoint is 1024px

  // Conditional logic for the right side of the desktop nav
  const renderRightNav = () => {
    // If not logged in, show the Login button
    if (!session) {
      return (
        <Link href="/auth/login" className="hidden sm:inline text-gray-700 hover:text-green-600 font-medium cursor-pointer text-sm lg:text-base">
          Login
        </Link>
      );
    }

    // If logged in and NOT an admin, show the profile dropdown
    if (session && session.user && session.user?.role?.toLowerCase() !== 'admin') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
              {/* Profile Icon, you can replace with an Image if you have user avatars */}
              <UserCircle className="h-6 w-6 text-gray-700 hover:text-green-600 transition-colors" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem>
              <Link href="/profile">My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return null;
  };

  return (
    <section className='top-0 sticky z-50'>
      <motion.div
        className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-2 sm:py-3 px-2 sm:px-4 relative overflow-hidden"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/*
          Refactored: Conditionally render the expensive background animation.
          It's hidden on mobile to improve performance.
        */}
        {!isMobile && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-green-400/10"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        )}
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm relative z-10 gap-2 sm:gap-0">
          <motion.div
            className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 lg:space-x-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/*
              Refactored: Conditionally apply continuous animations.
              On desktop, we keep the fun icon animations. On mobile, we use a static icon for performance.
            */}
            <motion.span className="flex items-center group cursor-pointer" variants={fadeInUp}>
              {!isMobile ? (
                <motion.span
                  className="text-yellow-400 mr-1 sm:mr-2 text-base sm:text-lg"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  📞
                </motion.span>
              ) : (
                <span className="text-yellow-400 mr-1 sm:mr-2 text-base sm:text-lg">📞</span>
              )}
              <span className="group-hover:text-yellow-400 transition-colors text-xs sm:text-sm">
                24/7 Helpline: +91 99993 03166
              </span>
            </motion.span>

            <motion.span className="hidden sm:flex items-center group cursor-pointer" variants={fadeInUp}>
              {!isMobile ? (
                <motion.span
                  className="text-yellow-400 mr-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  ✉
                </motion.span>
              ) : (
                <span className="text-yellow-400 mr-2">✉</span>
              )}
              <span className="group-hover:text-yellow-400 transition-colors">support@dwaparyug.org</span>
            </motion.span>

            <motion.span className="hidden lg:flex items-center group cursor-pointer" variants={fadeInUp}>
              {!isMobile ? (
                <motion.span
                  className="text-yellow-400 mr-2"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  📍
                </motion.span>
              ) : (
                <span className="text-yellow-400 mr-2">📍</span>
              )}
              <span className="group-hover:text-yellow-400 transition-colors">
                719 Mehalla Mohalla, Madanpur Khadar, Delhi
              </span>
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="hidden lg:block"
          >
            <Button
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black text-xs px-4 lg:px-6 py-2 h-auto rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              {...scaleOnHover}
            >
              <Link href={'/causes/19'} className='flex' >
              <Sparkles className="w-3 lg:w-4 h-3 lg:h-4 mr-1 lg:mr-2" />
              🚨 URGENT: Relief for Flood-Affected Families For Uttrrakashi
            </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Navigation with Mobile Menu */}
      <motion.nav
        className="bg-white/95 backdrop-blur-md shadow-lg py-3 sm:py-4 px-4 sticky top-0 z-50 border-b border-gray-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* todo */}
            <div className="from-gray-800 to-gray-900 px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg">
              <Image
                src={logo}
                alt="Dwaparyug Logo"
                width={160} // adjust to fit your design
                height={90} // adjust to fit your design
                priority
              />
            </div>
          </motion.div>

          <div className="hidden lg:flex items-center space-x-8">
            {["Home", "About Us", "How It Works", "Causes", "Contact Us"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link
                  href={item === "Home" ? "/" : `/${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-gray-700 hover:text-green-600 font-medium relative group cursor-pointer transition-colors duration-300"
                >
                  {item}
                  <motion.div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-600 to-yellow-500 group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>


          {/* Mobile and Desktop Right Section */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Social Icons - Hidden on mobile */}
            <motion.div
              className="hidden sm:flex items-center space-x-2 lg:space-x-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                { Icon: Facebook, color: "hover:text-blue-600", href: "#" },
                { Icon: Instagram, color: "hover:text-pink-600", href: "#" },
                { Icon: Twitter, color: "hover:text-blue-400", href: "#" },
                { Icon: Linkedin, color: "hover:text-blue-700", href: "#" },
              ].map(({ Icon, color, href }, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Link
                    href={href}
                    className={`text-gray-600 ${color} transition-all duration-300 cursor-pointer`}
                    {...scaleOnHover}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Conditionally rendered Login button or Profile dropdown */}
            {renderRightNav()}

            {/* Donate Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            >
              <Button
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-xs sm:text-sm lg:text-base"
                {...scaleOnHover}
                asChild
              >
                <Link href="/donate">
                  <Heart className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 fill-current" />
                  Donate
                  <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 ml-1 sm:ml-2 hidden sm:inline" />
                </Link>
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="lg:hidden mt-4 py-4 border-t border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col space-y-4">
              {["Home", "About Us", "How It Works", "Causes", "Contact Us"].map((item) => (
                <Link
                  key={item}
                  href={item === "Home" ? "/" : `/${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-gray-700 hover:text-green-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}

              {/* Conditionally rendered Login link or Logout link in mobile menu */}
              {session ? (
                <>
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-green-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-green-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors justify-start"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                      
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-green-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}

              <div className="flex justify-center space-x-4 px-4 pt-2">
                {[
                  { Icon: Facebook, color: "hover:text-blue-600", href: "#" },
                  { Icon: Instagram, color: "hover:text-pink-600", href: "#" },
                  { Icon: Twitter, color: "hover:text-blue-400", href: "#" },
                  { Icon: Linkedin, color: "hover:text-blue-700", href: "#" },
                ].map(({ Icon, color, href }, index) => (
                  <Link
                    key={index}
                    href={href}
                    className={`text-gray-600 ${color} transition-all duration-300`}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

    </section>
  )
}

export default HeaderSection