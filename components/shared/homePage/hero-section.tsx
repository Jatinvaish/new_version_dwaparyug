'use client';

import { scaleOnHover } from '@/lib/utils';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Heart, Sparkles,   Gift, ArrowRight, HandHeart, CheckCircle, Clock, Users } from 'lucide-react';
import React from 'react'
import { CountUpAnimation } from './counter-up';
import { Button } from '@/components/ui/button';
import Image from "next/image"
import Link from "next/link"

const HeroSection = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, 50])

  return (
    <section className="relative py-10 sm:py-16 lg:py-20 px-4 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* Animated Background Elements - Scaled down for mobile */}
      <motion.div
        className="absolute top-10 sm:top-20 right-10 sm:right-20 text-green-600 opacity-20"
        style={{ y: y1 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <Heart className="w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 fill-current" />
      </motion.div>

      <motion.div
        className="absolute top-20 sm:top-40 right-20 sm:right-40 text-yellow-400 opacity-30"
        style={{ y: y2 }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <div className="w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 bg-yellow-400 transform rotate-45 rounded-lg"></div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 text-blue-400 opacity-20"
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
      >
        <Sparkles className="w-12 sm:w-18 lg:w-24 h-12 sm:h-18 lg:h-24" />
      </motion.div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
        {/* Mobile-first: Text content comes first */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-6 lg:space-y-8 order-2 lg:order-1"
        >
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-100 to-green-100 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-gray-700 mb-4 sm:mb-6">
              <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-yellow-600" />
              Transforming Lives Since 2015 • 50,000+ Lives Impacted
            </div>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Give Support To{" "}
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-500"
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              Fight Hunger
            </motion.span>{" "}
            & Save Lives
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Dwaparyug Foundation is India's most trusted humanitarian nonprofit organization. We serve underprivileged
            communities across 1,200+ villages, providing food security, healthcare access, quality education, and
            women empowerment programs that create lasting positive change.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
              {...scaleOnHover}
              asChild
            >
              <Link href="/donate">
                <Gift className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                Start Donating Now
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 sm:ml-3" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 cursor-pointer bg-transparent"
              {...scaleOnHover}
              asChild
            >
              <Link href="/volunteer">
                <HandHeart className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                Become a Volunteer
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                <CountUpAnimation end={50000} />+
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Lives Transformed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                <CountUpAnimation end={1200} />+
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Villages Reached</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                <CountUpAnimation end={25000} />+
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Children Educated</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Image section - optimized for mobile */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="relative order-1 lg:order-2"
        >
          <motion.div
            className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-green-400 to-yellow-400 rounded-xl sm:rounded-2xl opacity-20 blur-xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          />
          <Image
            src="/placeholder.svg?height=600&width=700&text=Children+Smiling+Together"
            alt="Happy children receiving education and care"
            width={700}
            height={600}
            className="rounded-xl sm:rounded-2xl shadow-2xl relative z-10 w-full h-auto"
          />
          <motion.div
            className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 sm:w-12 h-8 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 sm:w-6 h-4 sm:h-6 text-green-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm sm:text-base">Impact Verified</div>
                <div className="text-xs sm:text-sm text-gray-600">100% Transparency</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Fundraising Progress Section - Mobile Optimized */}
      <motion.div
        className="max-w-7xl mx-auto mt-12 sm:mt-16 lg:mt-20"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="grid lg:grid-cols-2 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
          <motion.div
            className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-6 sm:p-8 lg:p-10 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute top-0 right-0 w-20 sm:w-24 lg:w-32 h-20 sm:h-24 lg:h-32 bg-white/10 rounded-full -mr-10 sm:-mr-12 lg:-mr-16 -mt-10 sm:-mt-12 lg:-mt-16"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-4 sm:mb-6">Current Campaign Progress</h3>
            <motion.div
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-3 sm:mb-4"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              57%
            </motion.div>
            <div className="w-full bg-black/20 rounded-full h-3 sm:h-4 mb-6 sm:mb-8">
              <motion.div
                className="bg-black h-3 sm:h-4 rounded-full relative"
                initial={{ width: 0 }}
                whileInView={{ width: "57%" }}
                transition={{ duration: 2, delay: 0.5 }}
              >
                <motion.div
                  className="absolute right-0 top-0 w-5 sm:w-6 h-5 sm:h-6 bg-black rounded-full -mt-1 -mr-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>
            </div>
            <div className="flex justify-between">
              <div>
                <div className="text-xs sm:text-sm text-black/80 font-medium">Amount Raised</div>
                <motion.div
                  className="text-lg sm:text-xl lg:text-2xl font-bold text-black"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  ₹28,50,000
                </motion.div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-black/80 font-medium">Target Goal</div>
                <motion.div
                  className="text-lg sm:text-xl lg:text-2xl font-bold text-black"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  ₹50,00,000
                </motion.div>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="bg-gradient-to-br from-green-600 to-green-700 p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute bottom-0 left-0 w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 bg-white/10 rounded-full -ml-8 sm:-ml-10 lg:-ml-12 -mb-8 sm:-mb-10 lg:-mb-12"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            />
            <div className="inline-block bg-green-500 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              🍽️ Emergency Food Relief
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Winter Food Distribution Drive</h3>
            <p className="text-green-100 text-sm sm:text-base lg:text-lg leading-relaxed">
              Providing nutritious meals, warm clothing, and essential supplies to 10,000+ families across Delhi's
              slums during harsh winter months. Every donation directly feeds a family for a week.
            </p>
            <motion.div
              className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center text-xs sm:text-sm">
                <Clock className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                <span>45 days remaining</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm">
                <Users className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                <span>2,847 donors</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection