"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Gift, Heart, Clock, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

const festivalEvents = [
  {
    id: 1,
    title: "Diwali Joy Distribution",
    festival: "Diwali 2024",
    date: "2024-11-01",
    location: "Delhi & NCR",
    description:
      "Spread the light of Diwali by providing sweets, diyas, and new clothes to underprivileged families across Delhi slums.",
    image: "/placeholder.svg?height=300&width=400&text=Diwali+Celebration",
    raised: 125000,
    goal: 300000,
    percentage: 42,
    beneficiaries: 1500,
    urgency: "High",
    category: "Festival Celebration",
    daysLeft: 25,
    products: [
      { id: 1, name: "Diwali Sweet Box", price: 500, description: "Traditional sweets for 1 family" },
      { id: 2, name: "Diya & Decoration Kit", price: 300, description: "Diyas and rangoli materials" },
      { id: 3, name: "New Clothes for Children", price: 800, description: "Festival clothes for 2 children" },
    ],
  },
  {
    id: 2,
    title: "Christmas Miracle Drive",
    festival: "Christmas 2024",
    date: "2024-12-25",
    location: "Mumbai, Pune",
    description: "Bring Christmas joy to children in orphanages and slums with gifts, cakes, and warm meals.",
    image: "/placeholder.svg?height=300&width=400&text=Christmas+Celebration",
    raised: 89000,
    goal: 200000,
    percentage: 45,
    beneficiaries: 800,
    urgency: "Medium",
    category: "Festival Celebration",
    daysLeft: 55,
    products: [
      { id: 4, name: "Christmas Gift Box", price: 600, description: "Toys and books for 1 child" },
      { id: 5, name: "Christmas Cake", price: 400, description: "Celebration cake for 10 children" },
      { id: 6, name: "Winter Clothing Kit", price: 1000, description: "Warm clothes for winter season" },
    ],
  },
  {
    id: 3,
    title: "Holi Colors of Hope",
    festival: "Holi 2025",
    date: "2025-03-14",
    location: "Rajasthan Villages",
    description:
      "Celebrate Holi with rural communities by providing organic colors, sweets, and community feast arrangements.",
    image: "/placeholder.svg?height=300&width=400&text=Holi+Celebration",
    raised: 45000,
    goal: 150000,
    percentage: 30,
    beneficiaries: 600,
    urgency: "Low",
    category: "Festival Celebration",
    daysLeft: 125,
    products: [
      { id: 7, name: "Organic Color Pack", price: 200, description: "Safe colors for 5 families" },
      { id: 8, name: "Holi Sweet Distribution", price: 350, description: "Traditional sweets for celebration" },
      { id: 9, name: "Community Feast Sponsorship", price: 2000, description: "Meal for 50 people" },
    ],
  },
  {
    id: 4,
    title: "Eid Happiness Sharing",
    festival: "Eid 2025",
    date: "2025-04-10",
    location: "Hyderabad, Bangalore",
    description: "Share the joy of Eid by providing new clothes, special meals, and gifts to families in need.",
    image: "/placeholder.svg?height=300&width=400&text=Eid+Celebration",
    raised: 67000,
    goal: 180000,
    percentage: 37,
    beneficiaries: 900,
    urgency: "Medium",
    category: "Festival Celebration",
    daysLeft: 152,
    products: [
      { id: 10, name: "Eid Clothing Set", price: 700, description: "New clothes for entire family" },
      { id: 11, name: "Special Eid Meal", price: 450, description: "Traditional Eid feast for 1 family" },
      { id: 12, name: "Children's Eid Gift", price: 300, description: "Toys and sweets for children" },
    ],
  },
]

export function FestivalEventsSection() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0)

  const urgencyColors = {
    Critical: "bg-red-500 text-white",
    High: "bg-orange-500 text-white",
    Medium: "bg-yellow-500 text-black",
    Low: "bg-green-500 text-white",
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <motion.div
        className="absolute top-20 right-20 text-purple-400 opacity-20"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <Gift className="w-32 h-32" />
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full text-sm font-medium text-gray-700 mb-6">
            <Calendar className="w-4 h-4 mr-2 text-purple-600" />
            Festival Campaigns • Celebrate with Purpose
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Upcoming{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              Festival Events
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in spreading joy during festivals by supporting families in need. Every festival becomes more
            meaningful when we share happiness with those who need it most.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {festivalEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="cursor-pointer"
            >
              <Card className="h-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border-0">
                <div className="relative overflow-hidden">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    width={400}
                    height={300}
                    className="w-full h-56 object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <Badge className="bg-purple-500 text-white font-semibold">{event.festival}</Badge>
                    <Badge className={`font-semibold ${urgencyColors[event.urgency as keyof typeof urgencyColors]}`}>
                      {event.urgency}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {event.daysLeft} days
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{event.description}</p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold text-purple-600">{event.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${event.percentage}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹{event.raised.toLocaleString()}</span>
                      <span>₹{event.goal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{event.beneficiaries} people</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold cursor-pointer"
                      asChild
                    >
                      <Link href={`/festivals/${event.id}`}>
                        <Gift className="w-4 h-4 mr-2" />
                        Join Festival
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-gray-300 hover:border-purple-400 hover:text-purple-500 cursor-pointer bg-transparent"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Your Own Festival Campaign</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Want to organize a festival celebration for your community? We can help you create a custom campaign for
              any festival or special occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold cursor-pointer">
                <Star className="w-5 h-5 mr-2" />
                Create Campaign
              </Button>
              <Button
                variant="outline"
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-full font-semibold cursor-pointer bg-transparent"
                asChild
              >
                <Link href="/festivals">
                  <Calendar className="w-5 h-5 mr-2" />
                  View All Events
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
