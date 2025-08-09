"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Linkedin, Twitter, Mail, Award, Users, Heart, HandHeart, Calendar, MapPin, Clock, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { teamMembers } from "@/lib/utils"

// Volunteer opportunities data
const volunteerOpportunities = [
  {
    id: 1,
    title: "Community Kitchen Helper",
    description: "Help serve meals and assist in food preparation for our community kitchen program",
    image: "/volunteer-kitchen.jpg",
    location: "Downtown Community Center",
    timeCommitment: "4 hours/week",
    category: "Food Security",
    participants: 45,
    link: "/volunteer/kitchen-helper"
  },
  {
    id: 2,
    title: "Children's Education Support",
    description: "Tutor underprivileged children and help with homework and learning activities",
    image: "/volunteer-education.jpg",
    location: "Various Schools",
    timeCommitment: "2-3 hours/week",
    category: "Education",
    participants: 62,
    link: "/volunteer/education-support"
  },
  {
    id: 3,
    title: "Healthcare Outreach",
    description: "Assist medical professionals in health camps and awareness programs",
    image: "/volunteer-healthcare.jpg",
    location: "Rural Areas",
    timeCommitment: "1 day/month",
    category: "Healthcare",
    participants: 38,
    link: "/volunteer/healthcare-outreach"
  },
  {
    id: 4,
    title: "Environmental Clean-up",
    description: "Join our environmental initiatives and community clean-up drives",
    image: "/volunteer-environment.jpg",
    location: "City Parks & Rivers",
    timeCommitment: "Half day/month",
    category: "Environment",
    participants: 89,
    link: "/volunteer/environment"
  }
]

export function TeamSection() {
  return (
    <>
      {/* Team Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <motion.div
          className="absolute top-20 right-20 text-green-400 opacity-10"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Users className="w-32 h-32" />
        </motion.div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-green-100 px-6 py-3 rounded-full text-sm font-medium text-gray-700 mb-6">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              Meet Our Team • Dedicated Change-Makers
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                Heart & Soul
              </span>{" "}
              Behind Our Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our passionate team of social workers, doctors, and community leaders work tirelessly to create lasting
              positive change in the lives of those who need it most.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="h-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
                  <div className="relative overflow-hidden">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <div className="flex space-x-3">
                        <Link
                          href={member.social.linkedin}
                          className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                        >
                          <Linkedin className="w-5 h-5 text-blue-700" />
                        </Link>
                        <Link
                          href={member.social.twitter}
                          className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                        >
                          <Twitter className="w-5 h-5 text-blue-400" />
                        </Link>
                        <Link
                          href={`mailto:${member.social.email}`}
                          className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                        >
                          <Mail className="w-5 h-5 text-gray-700" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <div className="text-green-600 font-semibold mb-3">{member.role}</div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
                    <div className="space-y-2 mb-4">
                      {member.achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-center text-xs text-gray-500">
                          <Award className="w-3 h-3 mr-2 text-yellow-500" />
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white cursor-pointer bg-transparent"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <motion.div
          className="absolute top-10 left-10 text-pink-400 opacity-10"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <Heart className="w-24 h-24" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 right-10 text-blue-400 opacity-10"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <HandHeart className="w-28 h-28" />
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-3 rounded-full text-sm font-medium text-gray-700 mb-6">
              <HandHeart className="w-4 h-4 mr-2 text-pink-600" />
              Join Our Cause • Make a Difference
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Become a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                Volunteer
              </span>{" "}
              Today
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our community of dedicated volunteers and help us create meaningful change. Every hour you contribute 
              makes a lasting impact on someone's life.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {volunteerOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
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
                      src={opportunity.image || "/placeholder.svg"}
                      alt={opportunity.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                      {opportunity.category}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {opportunity.participants} volunteers
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{opportunity.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{opportunity.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2 text-green-500" />
                        <span>{opportunity.timeCommitment}</span>
                      </div>
                    </div>

                    {/* <Link href={opportunity.link}>
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 group transition-all duration-300">
                        <HandHeart className="w-4 h-4 mr-2" />
                        Volunteer Now
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link> */}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Can't find the right fit? We have more opportunities!
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                From one-time events to ongoing commitments, we have volunteer opportunities 
                that match your schedule, skills, and interests.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/volunteer/all-opportunities">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    View All Opportunities
                  </Button>
                </Link>
                <Link href="/volunteer/contact-us">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white px-8"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Volunteer Coordinator
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}