"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, Heart, ArrowRight, Facebook, ChromeIcon as Google } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login attempt:", formData)
    // Handle login logic here
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <motion.div
        className="absolute top-20 left-20 text-green-400 opacity-20"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <Heart className="w-32 h-32 fill-current" />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-20 text-yellow-400 opacity-20"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="w-24 h-24 bg-yellow-400 transform rotate-45 rounded-lg"></div>
      </motion.div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <div className="mb-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white px-6 py-4 text-lg font-bold rounded-lg shadow-lg inline-block">
              dwaparyug
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome Back to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-500">
              Change-Making
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-lg">
            Continue your journey of creating positive impact. Access your donation history, track your contributions,
            and join our community of change-makers.
          </p>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">50K+</div>
              <div className="text-sm text-gray-600">Lives Transformed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">1200+</div>
              <div className="text-sm text-gray-600">Villages Reached</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">25K+</div>
              <div className="text-sm text-gray-600">Children Educated</div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="p-8 shadow-2xl bg-white/95 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Access your account to continue making a difference</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => updateFormData("rememberMe", checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-700">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700 cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 text-lg font-semibold cursor-pointer"
              >
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <div className=" text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-green-600 hover:text-green-700 font-semibold cursor-pointer">
                  Sign up here
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
