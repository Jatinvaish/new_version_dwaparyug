"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Package,
  Heart,
  Users,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Plus,
  BarChart2,
  ListTodo,
  TrendingUp,
  Clock,
  MessageSquare,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

// --- Dummy Data (replace with your actual data fetching logic) ---
const stats = [
  {
    title: "Total Donations",
    value: "$45,231",
    change: "+12.5%",
    changeType: "increase",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-100",
    link: "/admin/donations",
  },
  {
    title: "Active Campaigns",
    value: "12",
    change: "-3.1%",
    changeType: "decrease",
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    link: "/admin/causes",
  },
  {
    title: "New Users",
    value: "258",
    change: "+19.8%",
    changeType: "increase",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-100",
    link: "/admin/users",
  },
  {
    title: "Products in Stock",
    value: "5,123",
    change: "+5.2%",
    changeType: "increase",
    icon: Package,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    link: "/admin/products",
  },
]

const recentCampaigns = [
  {
    id: 1,
    title: "Clean Water Initiative",
    category: "Environmental",
    raised: "$15,000",
    goal: "$20,000",
    progress: 75,
    status: "Active",
    link: "/admin/causes/1",
  },
  {
    id: 2,
    title: "Education for All",
    category: "Education",
    raised: "$8,500",
    goal: "$10,000",
    progress: 85,
    status: "Active",
    link: "/admin/causes/2",
  },
  {
    id: 3,
    title: "Medical Supplies for Remote Areas",
    category: "Health",
    raised: "$25,000",
    goal: "$25,000",
    progress: 100,
    status: "Completed",
    link: "/admin/causes/3",
  },
]

const recentDonations = [
  {
    id: 1,
    donor: "John Doe",
    campaign: "Clean Water Initiative",
    amount: "$50",
    date: "Aug 4, 2025",
    status: "Completed",
  },
  {
    id: 2,
    donor: "Jane Smith",
    campaign: "Education for All",
    amount: "$100",
    date: "Aug 3, 2025",
    status: "Completed",
  },
  {
    id: 3,
    donor: "Anonymous",
    campaign: "Medical Supplies",
    amount: "$20",
    date: "Aug 2, 2025",
    status: "Completed",
  },
]

const recentActivities = [
  {
    id: 1,
    user: "Admin",
    action: "created new campaign 'Clean Water Initiative'",
    time: "2 hours ago",
    icon: Plus,
    color: "text-green-500",
  },
  {
    id: 2,
    user: "Jane Doe",
    action: "made a donation of $100 to 'Education for All'",
    time: "1 day ago",
    icon: Heart,
    color: "text-red-500",
  },
  {
    id: 3,
    user: "Admin",
    action: "updated product 'T-Shirt'",
    time: "2 days ago",
    icon: Edit,
    color: "text-blue-500",
  },
]

// --- The Dashboard Component ---
export default function AdminDashboard() {
  return (
    <div className="min-h-screen ">
      <div className=" mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-0">Dashboard</h1>
          <Button asChild>
            <Link href="/admin/causes/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Campaign
            </Link>
          </Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardContent className="p-6"  >
                  <Link href={stat.link}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          {stat.changeType === "increase" ? (
                            <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-600 mr-1" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500 ml-1 hidden md:block">from last month</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Campaigns (takes 2/3 of the width on large screens) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Campaigns</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/causes">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 mb-2 sm:mb-0">
                      <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                      <p className="text-sm text-gray-600">{campaign.category}</p>
                      <div className="flex items-center mt-2">
                        <Progress value={campaign.progress} className="w-32 h-2 mr-3" />
                        <span className="text-sm text-gray-600">{campaign.progress}%</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {campaign.raised} of {campaign.goal}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {campaign.status}
                      </span>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={campaign.link}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Donations (takes 1/3 of the width on large screens) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Donations</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/donations">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="font-semibold text-gray-900">{donation.donor}</h4>
                      <p className="text-sm text-gray-600">{donation.campaign}</p>
                      <p className="text-xs text-gray-500">{donation.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{donation.amount}</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          donation.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* New Section: Activity Feed & Pending Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <BarChart2 className="w-5 h-5 text-gray-400" />
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color} bg-opacity-10`}>
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-bold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Tasks (Example) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pending Tasks</CardTitle>
                <ListTodo className="w-5 h-5 text-gray-400" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-semibold text-gray-900">Review new user applications</h4>
                  <p className="text-sm text-gray-600 mt-1">2 applications pending review.</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <Link href="/admin/users">Review Now</Link>
                  </Button>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-semibold text-gray-900">Draft quarterly report</h4>
                  <p className="text-sm text-gray-600 mt-1">Due end of month.</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <Link href="/admin/reports">Go to Reports</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}