"use client";
import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  User,
  Heart,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Package,
  Gift,
  MessageSquare,
  Camera,
  Loader2,
  AlertTriangle,
  Info,
  Crown,
  HandHeart,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useDonationCart, useDonationForm, usePayment } from "@/hooks/useDonationHooks"
import Image from "next/image"
import toast from "react-hot-toast";
import Link from 'next/link';
import { fileToBase64, createPreviewUrl, LocalImage, uploadImages } from '@/lib/helper-function';

// Country options - Move outside component to prevent recreation
const countries = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  // Add more countries as needed
]

// Update PaymentStep to remove authentication requirements
const PaymentStep = memo(({
  subtotal,
  customAmount,
  totalDonationAmount,
  tipAmount,
  grandTotal,
  formData,
  updateFormData,
  paymentError,
  errors,
  selectedTip,
  setSelectedTip,
  customTipValue,
  setCustomTipValue,
  customDonationAmount,
  setCustomDonationAmount
}: {
  subtotal: number
  customAmount: number
  totalDonationAmount: number
  tipAmount: number
  grandTotal: number
  formData: any
  updateFormData: (data: any) => void
  paymentError: string | null
  errors: Record<string, string>
  selectedTip: number | 'custom' | null
  setSelectedTip: (tip: number | 'custom' | null) => void
  customTipValue: string
  setCustomTipValue: (value: string) => void
  customDonationAmount: string
  setCustomDonationAmount: (value: string) => void
}) => {
  // Show direct donation section if there are no products or current donation is 0
  const showDirectDonation = subtotal === 0 || totalDonationAmount === 0
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <CreditCard className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">
          {showDirectDonation ? 'Make Your Donation' : 'Payment Summary'}
        </h2>
        <p className="text-gray-600">
          {showDirectDonation ? 'Enter donation amount and proceed to payment' : 'Review and confirm your donation'}
        </p>
      </div>

      {/* Direct Donation Section (when no products or amount is 0) */}
      {showDirectDonation && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Direct Donation Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              {subtotal === 0 ?
                'No products in cart. Please enter a donation amount to proceed.' :
                'Your current donation amount is ₹0. Please add a donation amount.'
              }
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="directDonation">Donation Amount *</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <Input
                    id="directDonation"
                    type="number"
                    placeholder="Enter donation amount"
                    value={customDonationAmount}
                    onChange={(e) => {
                      setCustomDonationAmount(e.target.value)
                      updateFormData({ customAmount: parseFloat(e.target.value) || 0 })
                    }}
                    className="pl-8"
                    min="1"
                  />
                </div>
                {errors.customAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.customAmount}</p>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Quick Select:</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[500, 1000, 2500, 5000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCustomDonationAmount(amount.toString())
                        updateFormData({ customAmount: amount })
                      }}
                      className={`text-xs ${customDonationAmount === amount.toString() ? 'border-blue-500 bg-blue-100' : ''}`}
                    >
                      ₹{amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              {customAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-700 font-medium">
                      Donation amount: ₹{customAmount.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary (only show if there's a donation amount) */}
      {totalDonationAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Donation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subtotal > 0 && (
              <div className="flex justify-between">
                <span>Products Total</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
            )}

            {customAmount > 0 && (
              <div className="flex justify-between">
                <span>Direct Donation</span>
                <span>₹{customAmount.toLocaleString()}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>₹{totalDonationAmount.toLocaleString()}</span>
            </div>

            {tipAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Platform Tip</span>
                <span>₹{tipAmount.toLocaleString()}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-green-600">₹{grandTotal.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tip Section (only show if there's a donation amount) */}
      {totalDonationAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add a tip?</span>
              <Badge variant="secondary" className="text-xs">
                Optional
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Support our platform to help more people in need
            </p>

            {/* Tip Options */}
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15].map((percentage) => (
                <Button
                  key={percentage}
                  variant={selectedTip === percentage ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedTip(percentage)
                    setCustomTipValue("")
                  }}
                  className="text-xs"
                >
                  {percentage}%
                </Button>
              ))}
              <Button
                variant={selectedTip === 'custom' ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedTip('custom')
                  setCustomTipValue("")
                }}
                className="text-xs"
              >
                Custom
              </Button>
            </div>

            {/* Custom Tip Input */}
            {selectedTip === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="relative"
              >
                <span className="absolute left-3 top-3 text-gray-500 text-sm">₹</span>
                <Input
                  type="number"
                  placeholder="Enter tip amount"
                  value={customTipValue}
                  onChange={(e) => setCustomTipValue(e.target.value)}
                  className="pl-8"
                  min="0"
                  max={totalDonationAmount}
                />
              </motion.div>
            )}

            {/* No tip button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTip(null)
                setCustomTipValue("0")
              }}
              className="w-full text-xs text-gray-500"
            >
              {selectedTip !== null || customTipValue ? 'Remove tip' : 'No tip'}
            </Button>

            {/* Tip Amount Display */}
            {tipAmount > 0 && (
              <div className="flex justify-between text-sm bg-green-50 p-2 rounded">
                <span className="text-gray-600">Tip Amount</span>
                <span className="font-medium text-green-600">₹{tipAmount.toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Donor Information Summary */}
      {totalDonationAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Donor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {formData.donorName || 'Anonymous'}
              </div>
              <div>
                <span className="font-medium">Country:</span> {countries.find(c => c.value === formData.donorCountry)?.label}
              </div>
              <div>
                <span className="font-medium">Mobile:</span> {formData.mobileNumber}
              </div>
              {formData.donatedOnBehalfOf && (
                <div>
                  <span className="font-medium">On behalf of:</span> {formData.donatedOnBehalfOf}
                </div>
              )}
            </div>

            {formData.customMessage && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-700">Message:</span>
                <p className="text-blue-600 mt-1">{formData.customMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Error */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{paymentError}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
})

// Memoized form steps to prevent unnecessary re-renders
const PersonalInfoStep = memo(({
  formData,
  updateFormData,
  errors,
  imagePreview,
  handleImageUpload,
  removeImage
}: {
  formData: any
  updateFormData: (data: any) => void
  errors: Record<string, string>
  imagePreview: string | null
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="text-center mb-6">
      <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
      <p className="text-gray-600">Tell us a bit about yourself</p>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="donorName">Full Name *</Label>
        <Input
          id="donorName"
          placeholder="Enter your full name"
          required
          value={formData.donorName || ''}
          onChange={(e) => updateFormData({ donorName: e.target.value })}
        />
        {errors.donorName && (
          <p className="text-red-500 text-sm mt-1">{errors.donorName}</p>
        )}
      </div>

      <div>
        <Label htmlFor="donorCountry">Country *</Label>
        <Select
          value={formData.donorCountry || 'IN'}
          onValueChange={(value) => updateFormData({ donorCountry: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.donorCountry && (
          <p className="text-red-500 text-sm mt-1">{errors.donorCountry}</p>
        )}
      </div>
    </div>

    <div>
      <Label htmlFor="mobileNumber">Mobile Number *</Label>
      <Input
        id="mobileNumber"
        placeholder="Enter your mobile number"
        value={formData.mobileNumber || ''}
        maxLength={15}
        onChange={(e) => {
          const input = e.target.value;
          // Allow digits, +, and - for international numbers
          if (/^[\d+\-\s()]*$/.test(input)) {
            updateFormData({ mobileNumber: input });
          }
        }}
      />
      {errors.mobileNumber && (
        <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
      )}
    </div>

    <div>
      <Label htmlFor="donatedOnBehalfOf">Donating on behalf of someone?</Label>
      <Input
        id="donatedOnBehalfOf"
        placeholder="Enter name if donating on someone's behalf"
        value={formData.donatedOnBehalfOf || ''}
        onChange={(e) => updateFormData({ donatedOnBehalfOf: e.target.value })}
      />
    </div>

    <div className="space-y-4">
      <Label>Get a photograph printed</Label>
      <br />
      <span className='text-[10px] '>
        Personalize your product by adding a custom image, whether it's an image of your loved ones or your organization's logo, the choice is yours
      </span>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {imagePreview ? (
          <div className="relative">
            <Image
              src={imagePreview}
              alt="Custom upload"
              width={200}
              height={150}
              className="mx-auto rounded-lg object-cover"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={removeImage}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div>
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Upload a custom image for personalization</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
              className="mx-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
          </div>
        )}
      </div>
      {errors.customImage && (
        <p className="text-red-500 text-sm">{errors.customImage}</p>
      )}
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isAnonymous"
          checked={formData.isAnonymous || false}
          onCheckedChange={(checked) => updateFormData({ isAnonymous: !!checked })}
        />
        <Label htmlFor="isAnonymous">Donate anonymously</Label>
      </div>
    </div>
  </motion.div>
))

const ReviewCartStep = memo(({
  customAmount,
  itemsByCampaign,
  formData,
  updateFormData
}: {
  customAmount: number
  itemsByCampaign: any
  formData: any
  updateFormData: (data: any) => void
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="text-center mb-6">
      <Package className="w-12 h-12 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900">Review Your Donation</h2>
      <p className="text-gray-600">Confirm your items and amounts</p>
    </div>

    {/* Direct Donation */}
    {customAmount > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Direct Donation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span>Direct contribution to campaigns</span>
            <Badge className="bg-red-50 text-red-700">
              ₹{customAmount.toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )}

    {/* Product Items */}
    {Object.entries(itemsByCampaign).map(([campaignId, campaign]: [string, any]) => (
      <Card key={campaignId}>
        <CardHeader>
          <Link className='text-blue-700 border-b-2' href={'/cart'}>
            <CardTitle className="text-lg">{campaign.campaignTitle}</CardTitle>
          </Link>
        </CardHeader>
        <CardContent className="space-y-1">
          {campaign.items.map((item: any) => (
            <div key={`${item.productId}-${item.campaignId}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    ₹{item.price.toLocaleString()} × {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-semibold">
                ₹{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    ))}

    {/* Optional Messages */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
          Add Personal Touch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="customMessage">Custom Message</Label>
          <Textarea
            id="customMessage"
            placeholder="Add a personal message..."
            value={formData.customMessage || ''}
            onChange={(e) => updateFormData({ customMessage: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="donationPurpose">Purpose of Donation</Label>
          <Input
            id="donationPurpose"
            placeholder="e.g., Birthday celebration, In memory of..."
            value={formData.donationPurpose || ''}
            onChange={(e) => updateFormData({ donationPurpose: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="specialInstructions">Special Instructions</Label>
          <Textarea
            id="specialInstructions"
            placeholder="Any special instructions for the delivery..."
            value={formData.specialInstructions || ''}
            onChange={(e) => updateFormData({ specialInstructions: e.target.value })}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="donorMessage">Public Message (Optional)</Label>
          <Textarea
            id="donorMessage"
            placeholder="This message will be visible to others if you make your donation public..."
            value={formData.donorMessage || ''}
            onChange={(e) => updateFormData({ donorMessage: e.target.value })}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  </motion.div>
))

const SuccessStep = memo(({
  paymentError,
  totalDonationAmount,
  tipAmount,
  grandTotal,
  setCurrentStep,
  router
}: {
  paymentError: string | null
  totalDonationAmount: number
  tipAmount: number
  grandTotal: number
  setCurrentStep: (step: number) => void
  router: any
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const impactMessages = [
    "You just changed someone's life forever",
    "Your kindness will echo through generations",
    "You are the hero someone was praying for",
    "This moment makes you part of something beautiful"
  ];

  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 5)]
  }));

  useEffect(() => {
    if (!paymentError) {
      setShowConfetti(true);
      const messageInterval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % impactMessages.length);
      }, 3000);

      return () => clearInterval(messageInterval);
    }
  }, [paymentError]);

  if (paymentError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Unfortunately, your payment could not be processed. Please try again or contact support.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-700 text-sm">{paymentError}</p>
          </div>
          <div className="space-x-4">
            <Button onClick={() => setCurrentStep(3)} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => router.push('/cart')}>
              Back to Cart
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 overflow-hidden -m-8">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-40 w-64 h-64 bg-gradient-to-r from-blue-300 to-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && confettiParticles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
            animate={{
              y: '110vh',
              rotate: 360,
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeOut"
            }}
            className="absolute w-3 h-3 rounded-full z-10"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl w-full"
        >
          {/* Main Success Icon with Pulse Effect */}
          <motion.div
            className="text-center mb-8 relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <div className="relative inline-block">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],

                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto  "
              >
                <CheckCircle className="w-16 h-16 text-white" />
              </motion.div>

              {/* Floating Icons Around Main Icon */}
              {[Heart, Star, Gift, Crown].map((Icon, index) => (
                <motion.div
                  key={index}
                  className="absolute"
                  style={{
                    top: index === 0 ? '-10px' : index === 1 ? '20px' : index === 2 ? '60px' : '40px',
                    left: index === 0 ? '20px' : index === 1 ? '-20px' : index === 2 ? '-15px' : '100px'
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                    scale: [0.8, 1.1, 0.8]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-purple-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Dynamic Headline */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-6"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              You're a Hero!
            </h1>

            <motion.div
              className="text-xl md:text-2xl text-gray-700 font-medium min-h-[2.5rem] flex items-center justify-center"
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
            >
              {impactMessages[currentMessageIndex]}
            </motion.div>
          </motion.div>

          {/* Impact Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {[
              { icon: Users, number: "50+", label: "Lives Touched", color: "from-blue-500 to-cyan-500" },
              { icon: Heart, number: "∞", label: "Love Shared", color: "from-red-500 to-pink-500" },
              { icon: Sparkles, number: "1st", label: "In Our Hearts", color: "from-yellow-500 to-orange-500" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1 + index * 0.2, type: "spring" }}
                className="text-center"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl mx-auto mb-2 flex items-center justify-center `}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Donation Summary Card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
              <h3 className="text-2xl font-bold text-gray-800">Your Incredible Impact</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="text-lg text-gray-700 flex items-center">
                  <HandHeart className="w-5 h-5 mr-2 text-green-600" />
                  Donation Amount
                </span>
                <span className="text-2xl font-bold text-green-600">₹{totalDonationAmount.toLocaleString()}</span>
              </div>

              {tipAmount > 0 && (
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                  <span className="text-lg text-gray-700 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-600" />
                    Platform Support
                  </span>
                  <span className="text-xl font-bold text-purple-600">₹{tipAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t-2 border-dashed border-gray-200 pt-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <span className="text-xl font-bold text-gray-800 flex items-center">
                    <Crown className="w-6 h-6 mr-2 text-yellow-600" />
                    Total Blessing Given
                  </span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Emotional Message */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mb-8"
          >
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white  ">
              <p className="text-lg leading-relaxed">
                <strong>You didn't just donate money today.</strong><br />
                You gave hope to someone who needed it most. You became part of their story of survival, growth, and dreams coming true.
                <br /><br />
                <span className="text-yellow-200 font-semibold">Somewhere, someone is smiling because of you.</span>
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={() => router?.push('/causes')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center"
            >
              <Heart className="w-6 h-6 mr-2" />
              Spread More Love
            </motion.button>

            <motion.button
              onClick={() => router?.push('/')}
              className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 border-2 border-gray-200"
            >
              Return Home
            </motion.button>
          </motion.div>

          {/* Certificate Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 2, type: "spring", stiffness: 100 }}
            className="text-center mt-12"
          >
            <div className="inline-block bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 px-6 py-3 rounded-full font-bold text-sm  ">
              🏆 CERTIFIED CHANGEMAKER 🏆
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
})

// Add display names for better debugging
PersonalInfoStep.displayName = 'PersonalInfoStep'
ReviewCartStep.displayName = 'ReviewCartStep'
SuccessStep.displayName = 'SuccessStep'
PaymentStep.displayName = 'PaymentStep'

export default function MultiStepDonationForm() {

  const router = useRouter()
  const { cartItems, getCartTotals, getItemsByCampaign, clearCart } = useDonationCart()
  const { formData, updateFormData, getTipAmount, clearFormData } = useDonationForm()
  const { createPaymentOrder, processPaymentSuccess, isProcessing, paymentError } = usePayment()

  const [currentStep, setCurrentStep] = useState(1)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)

  // Direct donation and tip state
  const [customDonationAmount, setCustomDonationAmount] = useState("")
  const [selectedTip, setSelectedTip] = useState<number | 'custom' | null>(5)
  const [customTipValue, setCustomTipValue] = useState("")
  const [grandTotalAfterPayment, setGrandTotalAfterPayment] = useState(0)

  // Warning dialog states
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [warningType, setWarningType] = useState<'campaign' | 'direct'>('direct')

  const totalSteps = 4

  // Load Razorpay script with proper loading state management
  useEffect(() => {
    // Check if script is already loaded
    if (typeof (window as any).Razorpay !== 'undefined') {
      setIsRazorpayLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      console.log('Razorpay script loaded successfully')
      setIsRazorpayLoaded(true)
    }
    script.onerror = () => {
      console.error('Failed to load Razorpay script')
      setIsRazorpayLoaded(false)
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Load custom donation amount from localStorage if set from cause detail page
  useEffect(() => {
    const savedAmount = localStorage.getItem('customDonationAmount')
    if (savedAmount) {
      setCustomDonationAmount(savedAmount)
      updateFormData({ customAmount: parseFloat(savedAmount) || 0 })
      localStorage.removeItem('customDonationAmount') // Clear after use
    }
  }, [updateFormData])

  // Memoize expensive calculations
  const { subtotal, totalItems } = useMemo(() => getCartTotals(), [getCartTotals])
  const customAmount = useMemo(() => parseFloat(customDonationAmount) || 0, [customDonationAmount])
  const totalDonationAmount = useMemo(() => subtotal + customAmount, [subtotal, customAmount])
  const [bannerImage, setBannerImage] = useState<LocalImage | null>(null);

  // Calculate tip amount
  const calculateTipAmount = useCallback(() => {
    let tipValue = 0
    if (selectedTip === 'custom' && customTipValue) { 
      const value = parseFloat(customTipValue)
      if (!isNaN(value) && value > 0) {
        tipValue = Math.min(value, totalDonationAmount)
      }
    } else if (typeof selectedTip === 'number') {
      tipValue = totalDonationAmount * (selectedTip / 100)
    }
    return Math.floor(tipValue)
  }, [selectedTip, customTipValue, totalDonationAmount])
  const tipAmount = useMemo(() => calculateTipAmount(), [calculateTipAmount])
  console.log("🚀 ~ MultiStepDonationForm ~ tipAmount:", tipAmount)
  const grandTotal = useMemo(() => totalDonationAmount + tipAmount, [totalDonationAmount, tipAmount])
  const itemsByCampaign = useMemo(() => getItemsByCampaign(), [getItemsByCampaign])

  // Memoize callbacks to prevent unnecessary re-renders
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const previewUrl = createPreviewUrl(file);

      setBannerImage({
        file,
        base64,
        url: previewUrl,
        isExisting: false
      });
      setImagePreview(previewUrl)
      updateFormData({ customImage: undefined })
    } catch (error) {
      console.error('Error processing banner image:', error);
      toast.error('Error processing image. Please try again.');
    }
  };

  const removeImage = useCallback(() => {
    updateFormData({ customImage: undefined })
    setImagePreview(null)
    setBannerImage(null)
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.customImage
      return newErrors
    })
  }, [updateFormData])

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.donorCountry) {
        formData.donorCountry = 'IN'
      }
      if (!formData.donorName || formData?.donorName?.trim() == '') {
        newErrors.donorName = 'Full name is required'
      }
      if (!formData.mobileNumber) {
        newErrors.mobileNumber = 'Mobile number is required'
      } else if (!/^[\d+\-\s()]*$/.test(formData.mobileNumber)) {
        newErrors.mobileNumber = 'Please enter a valid mobile number'
      }
    }

    if (step === 3) {
      // Validate that there's a donation amount > 0
      if (totalDonationAmount <= 0) {
        newErrors.customAmount = 'Please enter a donation amount greater than ₹0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData.donorName, formData.donorCountry, formData.mobileNumber, totalDonationAmount])

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, validateStep])

  const handleBack = useCallback(() => {
    setCurrentStep(prev => prev - 1)
  }, [])

  // Check donation type and show appropriate warning
  const checkDonationTypeAndShowWarning = useCallback(() => {
    const custDonationId: any = localStorage.getItem('customDonationId')
    const isCartEmpty = cartItems.length === 0
    const hasCustomDonationId = custDonationId && Number(JSON.parse(custDonationId)) > 0

    if (isCartEmpty && hasCustomDonationId) {
      // Cart is empty but has customDonationId - campaign donation without products
      setWarningType('campaign')
      setShowWarningDialog(true)
    } else if (isCartEmpty && !hasCustomDonationId) {
      // Both cart is empty and no customDonationId - direct donation
      setWarningType('direct')
      setShowWarningDialog(true)
    } else {
      // Has products in cart, proceed directly
      handlePaymentAfterWarning()
    }
  }, [cartItems.length])

  const handlePaymentAfterWarning = useCallback(async () => {
    // Close dialog first
    setShowWarningDialog(false)

    if (!validateStep(3)) return

    // Check if Razorpay is loaded
    // if (!isRazorpayLoaded || typeof (window as any).Razorpay === 'undefined') {
    //   setErrors({ payment: 'Payment system is loading. Please wait a moment and try again.' })
    //   return
    // }

    setIsSubmitting(true)
    setErrors({}) // Clear previous errors

    try {
      // Upload banner image if exists
      if (bannerImage) {
        if (bannerImage.file) {
          // New file upload
          const uploadedUrls = await uploadImages([bannerImage.file]);
          //@ts-ignore
          formData.customImage = uploadedUrls[0];
        } else if (bannerImage.base64) {
          // Base64 upload
          const uploadedUrls = await uploadImages([bannerImage.base64]);
          //@ts-ignore
          formData.customImage = uploadedUrls[0];
        } else if (bannerImage.isExisting) {
          // Existing image, use as is
          //@ts-ignore
          formData.customImage = bannerImage.url;
        }
      }

      const custDonationId: any = localStorage.getItem('customDonationId')

      // Create payment order - API will handle user creation/lookup internally
      const orderData = await createPaymentOrder({
        cartItems,
        customDonationId: Number(JSON.parse(custDonationId) || 0),
        //@ts-ignore
        formData: {
          ...formData,
          customAmount: customAmount,
          tipAmount: tipAmount,
        },
        totalAmount: grandTotal,
        donationAmount: totalDonationAmount,
        tipAmount: tipAmount
      })

      // Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Dwaparyug Foundation",
        description: "Donation Payment",
        order_id: orderData.orderId,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        },
        handler: async function (response: any) {
          try {
            // Process successful payment
            await processPaymentSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })

            // Clear cart and form data
            clearCart()
            setCustomDonationAmount("")
            setSelectedTip(5)
            setCustomTipValue("")
            setBannerImage(null)
            setImagePreview(null)
            setIsSubmitting(false)

            // Move to success step
            setCurrentStep(4)
            setGrandTotalAfterPayment(grandTotal)
          } catch (error) {
            console.error('Payment processing failed:', error)
            setIsSubmitting(false)
            setCurrentStep(4) // Go to step 4 but show error
          }
        },
        prefill: {
          name: formData.donorName || '',
          contact: formData.mobileNumber || '',
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false)
          }
        }
      }

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Payment initiation failed:', error)
      setErrors({ payment: 'Failed to initiate payment. Please try again.' })
      setIsSubmitting(false)
    }
  }, [validateStep, isRazorpayLoaded, createPaymentOrder, cartItems, formData, grandTotal, totalDonationAmount, tipAmount, processPaymentSuccess, clearCart, customAmount, bannerImage])

  const handlePayment = useCallback(async () => {
    // Check donation type and show warning if needed
    checkDonationTypeAndShowWarning()
  }, [checkDonationTypeAndShowWarning])

  // Memoize step rendering to prevent unnecessary re-renders
  const renderStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            imagePreview={imagePreview}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
          />
        )
      case 2:
        return (
          <ReviewCartStep
            customAmount={customAmount}
            itemsByCampaign={itemsByCampaign}
            formData={formData}
            updateFormData={updateFormData}
          />
        )
      case 3:
        return (
          <PaymentStep
            subtotal={subtotal}
            customAmount={customAmount}
            totalDonationAmount={totalDonationAmount}
            tipAmount={tipAmount}
            grandTotal={grandTotal}
            formData={formData}
            updateFormData={updateFormData}
            paymentError={paymentError}
            errors={errors}
            selectedTip={selectedTip}
            setSelectedTip={setSelectedTip}
            customTipValue={customTipValue}
            setCustomTipValue={setCustomTipValue}
            customDonationAmount={customDonationAmount}
            setCustomDonationAmount={setCustomDonationAmount}
          />
        )
      case 4:
        return (
          <SuccessStep
            paymentError={paymentError}
            totalDonationAmount={grandTotalAfterPayment - tipAmount}
            tipAmount={tipAmount}
            grandTotal={grandTotalAfterPayment}
            setCurrentStep={setCurrentStep}
            router={router}
          />
        )
      default:
        return (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            imagePreview={imagePreview}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
          />
        )
    }
  }, [currentStep, formData, updateFormData, errors, imagePreview, handleImageUpload, removeImage, customAmount, itemsByCampaign, subtotal, totalDonationAmount, tipAmount, grandTotal, paymentError, router, selectedTip, setSelectedTip, customTipValue, setCustomTipValue, customDonationAmount, setCustomDonationAmount, grandTotalAfterPayment])

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Warning Dialog */}
        <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {warningType === 'campaign' ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                    Campaign Donation Notice
                  </>
                ) : (
                  <>
                    <Info className="w-5 h-5 text-blue-500 mr-2" />
                    Direct Donation Notice
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-left space-y-2">
                {warningType === 'campaign' ? (
                  <>
                    <p>
                      You didn't select any campaign products. You are making a direct donation which will be counted towards this campaign but not associated with any specific product.
                    </p>
                    <p className="text-sm text-gray-600">
                      Your donation will still help the campaign reach its goal and support the cause.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      You are making a direct donation. This will go to the NGO's welfare fund to help with children's education and other necessary support.
                    </p>
                    <p className="text-sm text-gray-600">
                      Your contribution will be used where it's needed most to make the maximum impact.
                    </p>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowWarningDialog(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentAfterWarning}
                className={`w-full sm:w-auto ${warningType === 'campaign' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={isSubmitting || isProcessing}
              >
                {isSubmitting || isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue with Payment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Progress Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Complete Your Donation</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
          </div>

          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />

          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Personal Info</span>
            <span>Review</span>
            <span>Payment</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Main Content */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 !pt-0 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              {renderStep}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep !== 4 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? () => router.push('/cart') : handleBack}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Back to Cart' : 'Previous'}
            </Button>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto order-1 sm:order-2">
              {currentStep < 3 && (
                <Button
                  onClick={handleNext}
                  className="w-full sm:w-auto"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {currentStep === 3 && (
                <Button
                  onClick={handlePayment}
                  disabled={isSubmitting || isProcessing || grandTotal <= 0 || !isRazorpayLoaded}
                  className="min-w-[150px] w-full sm:w-auto"
                >
                  {!isRazorpayLoaded ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading Payment...
                    </>
                  ) : isSubmitting || isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ₹{grandTotal.toLocaleString()}
                      <CreditCard className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Help text for mobile */}
        {currentStep === 3 && grandTotal <= 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
              <span className="text-sm text-amber-700">
                Please enter a donation amount to proceed with payment.
              </span>
            </div>
          </div>
        )}

        {/* Payment system loading indicator */}
        {!isRazorpayLoaded && currentStep === 3 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Loader2 className="w-4 h-4 text-blue-500 mr-2 animate-spin" />
              <span className="text-sm text-blue-700">
                Loading payment system... Please wait.
              </span>
            </div>
          </div>
        )}

        {/* Payment error display */}
        {errors.payment && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">
                {errors.payment}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}