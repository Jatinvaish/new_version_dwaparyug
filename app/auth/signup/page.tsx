"use client"

import React from "react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Mail, Lock, Phone, MapPin, Heart, ArrowRight, } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import toast from "react-hot-toast";
import { countries } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios.config";
import OTPVerificationPage from "@/components/OTPVerificationPage";

// Define Zod validation schema
const schema = z.object({
  first_name: z.string().min(2, { message: "First name is required." }),
  last_name: z.string().min(2, { message: "Last name is required." }),
  mobile_no: z.string().min(10, { message: "Mobile number is required and must be at least 10 digits." }),
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirm_password: z.string().min(6, { message: "Confirm Password must be at least 6 characters." }),
  country: z.string().min(1, { message: "Country is required." }),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Terms & Privacy." }),
  }),
  newsletter: z.boolean().default(false).optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match.",
  path: ["confirm_password"],
});

export default function SignupPage() {
  const [isPending, startTransition] = React.useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      first_name: "",
      last_name: "",
      mobile_no: "",
      email: "",
      password: "",
      confirm_password: "",
      country: "India",
      agreeTerms: true,
      newsletter: true,
    }
  });

  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        // Step 1: Register user
        const registerResponse = await api.post("/user/register", data);

        console.log("🚀 ~ onSubmit ~ assaasasas:", registerResponse.status)
        if (registerResponse.status === 201) {
          // toast.success("Account created successfully!");
          console.log("🚀 ~ onSubmit ~ otpResponse:")

          // Step 2: Send OTP for email verification
          try {
            const otpResponse = await api.post("/auth/send-otp", {
              email: data.email
            });
            console.log("🚀 ~ onSubmit ~ otpResponse:", otpResponse)

            if (otpResponse.status === 200) {
              setRegisteredEmail(data.email);
              setShowOTPVerification(true);
              toast.success("Verification code sent to your email!");
            }
          } catch (otpError: any) {
            console.error("Error sending OTP:", otpError);
            toast.error("Account created but failed to send verification email. Please contact support.");
          }

        } else {
          toast.error(registerResponse.data.message || "Registration failed");
        }
      } catch (error: any) {
        console.error("Registration error:", error);
        toast.error(error.response?.data?.message || "An error occurred during registration.");
      }
    });
  };

  // If OTP verification is shown, render the OTP component
  if (showOTPVerification) {
    return <OTPVerificationPage email={registeredEmail} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <motion.div
        className="absolute top-20 right-20 text-blue-400 opacity-20"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <Heart className="w-28 h-28 fill-current" />
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-20 text-purple-400 opacity-20"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="w-20 h-20 bg-purple-400 transform rotate-45 rounded-lg"></div>
      </motion.div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left hidden md:block"
        >
          <div className="mb-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white px-6 py-4 text-lg font-bold rounded-lg shadow-lg inline-block">
              dwaparyug
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500">
              Community
            </span>{" "}
            of Change-Makers
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-lg">
            Create your account to start making a difference. Track your donations, receive impact updates, and connect
            with like-minded individuals working towards positive change.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <span className="text-gray-700">Track your donation impact in real-time</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <span className="text-gray-700">Receive regular updates on campaigns</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">✓</span>
              </div>
              <span className="text-gray-700">Join exclusive volunteer opportunities</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Signup Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="p-4 shadow-2xl bg-white/95 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Join thousands of donors making a difference</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    placeholder="John"
                    {...register("first_name")}
                    className="mt-2"
                  />
                  {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message as string}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register("last_name")}
                    className="mt-2"
                  />
                  {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message as string}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  className="mt-2"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message as string}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+91 9999999999"
                    {...register("mobile_no")}
                    className="mt-2"
                  />
                  {errors.mobile_no && <p className="text-red-500 text-xs mt-1">{errors.mobile_no.message as string}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Country
                  </Label>
                  <Select
                    value={watch("country")}
                    onValueChange={(val) => setValue("country", val)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message as string}</p>}
                </div>
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
                    placeholder="Create a strong password"
                    {...register("password")}

                    className="pr-10"

                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message as string}</p>}

              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Confirm Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...register("confirm_password")}
                    className="pr-10"

                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-red-500 text-sm">
                  {errors?.confirm_password?.message as string}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    {...register("agreeTerms")}
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.agreeTerms && (
                  <p className="text-red-500 text-sm">{errors.agreeTerms.message as string}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Creating..." : "Create Account"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                  Sign in here
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 