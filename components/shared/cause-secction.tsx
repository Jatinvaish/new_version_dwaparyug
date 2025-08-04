import { Progress } from '@radix-ui/react-progress'
import { motion } from 'framer-motion'
import { HandHeart, ChevronLeft, ChevronRight, Calendar, Users, MapPin, Gift, Heart, ArrowRight, Target } from 'lucide-react'
import React, { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import Image from "next/image"
import { scaleOnHover, causes, urgencyColors } from '@/lib/utils'
import { Button } from '../ui/button'
import Link from "next/link"

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

        {/* Mobile: Show single cause card, Desktop: Show multiple */}
        <div className="block sm:hidden">
          {causes.slice(currentCauseIndex, currentCauseIndex + 1).map((cause, index) => (
            <motion.div
              key={cause.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white border-0 shadow-lg">
                <div className="relative overflow-hidden">
                  <Image
                    src={cause.image || "/placeholder.svg"}
                    alt={cause.title}
                    width={400}
                    height={300}
                    className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 flex flex-col space-y-2">
                    <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold">
                      {cause.category}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${urgencyColors[cause.urgency as keyof typeof urgencyColors]}`}
                    >
                      {cause.urgency}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-700">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(cause.endDate).toLocaleDateString()}
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{cause.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{cause.description}</p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold text-green-600">{cause.percentage}%</span>
                    </div>
                    <Progress value={cause.percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Raised: ₹{cause.raised.toLocaleString()}</span>
                      <span>Goal: ₹{cause.goal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-600 pt-2 border-t">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{cause.beneficiaries} beneficiaries</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{cause.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <Button
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold text-sm cursor-pointer"
                      {...scaleOnHover}
                      asChild
                    >
                      <Link href={`/causes/${cause.id}`}>
                        <Gift className="w-4 h-4 mr-2" />
                        Donate Now
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-gray-300 hover:border-red-400 hover:text-red-500 cursor-pointer bg-transparent w-10 h-10"
                      {...scaleOnHover}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tablet and Desktop: Show grid of causes */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {causes.slice(currentCauseIndex, currentCauseIndex + 4).map((cause, index) => (
            <motion.div
              key={cause.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white border-0 shadow-lg h-full">
                <div className="relative overflow-hidden">
                  <Image
                    src={cause.image || "/placeholder.svg"}
                    alt={cause.title}
                    width={400}
                    height={300}
                    className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                      {cause.category}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${urgencyColors[cause.urgency as keyof typeof urgencyColors]}`}
                    >
                      {cause.urgency}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(cause.endDate).toLocaleDateString()}
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6"
                    whileHover={{ opacity: 1 }}
                  >
                    <Button
                      className="bg-white text-black hover:bg-gray-100 px-6 py-2 rounded-full font-semibold cursor-pointer"
                      asChild
                    >
                      <Link href={`/causes/${cause.id}`}>
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
                <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2">{cause.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm sm:text-base flex-1">{cause.description}</p>

                  <div className="space-y-4 mt-auto">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold text-green-600">{cause.percentage}%</span>
                    </div>
                    <Progress value={cause.percentage} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Raised: ₹{cause.raised.toLocaleString()}</span>
                      <span>Goal: ₹{cause.goal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{cause.beneficiaries} beneficiaries</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{cause.location}</span>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <Button
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold cursor-pointer"
                        {...scaleOnHover}
                        asChild
                      >
                        <Link href={`/causes/${cause.id}`}>
                          <Gift className="w-4 h-4 mr-2" />
                          Donate Now
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-gray-300 hover:border-red-400 hover:text-red-500 cursor-pointer bg-transparent"
                        {...scaleOnHover}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

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