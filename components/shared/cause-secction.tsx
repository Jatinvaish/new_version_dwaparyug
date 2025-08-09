import { Progress } from '@radix-ui/react-progress'
import { motion } from 'framer-motion'
import { HandHeart, ChevronLeft, ChevronRight, Calendar, Users, MapPin, Gift, Heart, ArrowRight, Target } from 'lucide-react'
import React, { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import Image from "next/image"
import { scaleOnHover, causes, urgencyColors } from '@/lib/utils'
import { Button } from '../ui/button'
import Link from "next/link"
import CampaignList from '@/app/(public)/causes/page'

const CauseSection = () => {
  const [currentCauseIndex, setCurrentCauseIndex] = useState(0)
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col lg:flex-row items-center justify-between mb-12 sm:mb-16 space-y-6 lg:space-y-0"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-green-100 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium text-gray-700 mb-4 sm:mb-6">
              <HandHeart className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
              Active Campaigns • Make a Direct Impact
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
              Help &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                Donate
              </span>{" "}
              When They Need It Most
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Choose from our urgent campaigns and see exactly how your donation creates immediate, measurable impact
              in communities across India.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-green-700 text-white border-green-700 hover:bg-green-800 w-10 sm:w-12 h-10 sm:h-12 cursor-pointer"
              onClick={() => setCurrentCauseIndex(Math.max(0, currentCauseIndex - 1))}
              {...scaleOnHover}
            >
              <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-500 w-10 sm:w-12 h-10 sm:h-12 cursor-pointer"
              onClick={() => setCurrentCauseIndex(Math.min(causes.length - 4, currentCauseIndex + 1))}
              {...scaleOnHover}
            >
              <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6" />
            </Button>
          </div>
        </motion.div>

        <CampaignList
          title="" // Don't show title since we have our custom header
          showHeader={false}
          showCategoryFilter={false}
          showSearch={false}
          showPagination={false} // Don't show pagination for festival section
          showViewToggle={false} // Don't show view toggle, keep it as grid
          defaultViewMode="grid"
          maxItems={8} // Show only 8 campaigns in festival section
          className=" "
          cate
        />


        <motion.div
          className="text-center mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
        >
          <Button
            variant="outline"
            className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 cursor-pointer bg-transparent text-sm sm:text-base"
            {...scaleOnHover}
            asChild
          >
            <Link href="/causes">
              <Target className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
              View All Active Campaigns
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-1 sm:ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default CauseSection