// "use client"

// import { useState, useEffect } from 'react'
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { Progress } from "@/components/ui/progress"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {
//   ArrowLeft,
//   ArrowRight,
//   Upload,
//   X,
//   User,
//   Heart,
//   CreditCard,
//   CheckCircle,
//   AlertCircle,
//   Package,
//   Gift,
//   Globe,
//   Phone,
//   MessageSquare,
//   Camera,
//   Loader2
// } from "lucide-react"
// import { motion, AnimatePresence } from "framer-motion"
// import { useRouter } from "next/navigation"
// import { useDonationCart, useDonationForm, usePayment } from "@/hooks/useDonationHooks"
// import Image from "next/image"

// // Country options
// const countries = [
//   { value: "IN", label: "India" },
//   { value: "US", label: "United States" },
//   { value: "UK", label: "United Kingdom" },
//   { value: "CA", label: "Canada" },
//   { value: "AU", label: "Australia" },
//   // Add more countries as needed
// ]

// export default function MultiStepDonationForm() {
//   const router = useRouter()
//   const { cartItems, getCartTotals, getItemsByCampaign, clearCart } = useDonationCart()
//   const { formData, updateFormData, getTipAmount, clearFormData } = useDonationForm()
//   const { createPaymentOrder, processPaymentSuccess, isProcessing, paymentError } = usePayment()
  
//   const [currentStep, setCurrentStep] = useState(1)
//   const [imagePreview, setImagePreview] = useState<string | null>(null)
//   const [errors, setErrors] = useState<Record<string, string>>({})
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const totalSteps = 4
//   const { subtotal, totalItems } = getCartTotals()
//   const customAmount = formData.customAmount || 0
//   const totalDonationAmount = subtotal + customAmount
//   const tipAmount = getTipAmount(totalDonationAmount)
//   const grandTotal = totalDonationAmount + tipAmount
  
//   const itemsByCampaign = getItemsByCampaign()

//   // Redirect if no items and no custom amount
//   useEffect(() => {
//     if (totalItems === 0 && !customAmount) {
//       router.push('/cart')
//     }
//   }, [totalItems, customAmount, router])

//   // Load Razorpay script
//   useEffect(() => {
//     const script = document.createElement('script')
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js'
//     script.async = true
//     document.body.appendChild(script)
    
//     return () => {
//       document.body.removeChild(script)
//     }
//   }, [])

//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         setErrors({ ...errors, customImage: 'Image size should be less than 5MB' })
//         return
//       }
      
//       updateFormData({ customImage: file })
      
//       const reader = new FileReader()
//       reader.onload = (e) => {
//         setImagePreview(e.target?.result as string)
//       }
//       reader.readAsDataURL(file)
      
//       // Clear error
//       const newErrors = { ...errors }
//       delete newErrors.customImage
//       setErrors(newErrors)
//     }
//   }

//   const removeImage = () => {
//     updateFormData({ customImage: undefined })
//     setImagePreview(null)
//     const newErrors = { ...errors }
//     delete newErrors.customImage
//     setErrors(newErrors)
//   }

//   const validateStep = (step: number): boolean => {
//     const newErrors: Record<string, string> = {}
    
//     if (step === 1) {
//       if (!formData.donorCountry) {
//         newErrors.donorCountry = 'Country is required'
//       }
//       if (!formData.mobileNumber) {
//         newErrors.mobileNumber = 'Mobile number is required'
//       } else if (!/^\+?[\d\s-()]+$/.test(formData.mobileNumber)) {
//         newErrors.mobileNumber = 'Please enter a valid mobile number'
//       }
//     }
    
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleNext = () => {
//     if (validateStep(currentStep)) {
//       setCurrentStep(currentStep + 1)
//     }
//   }

//   const handleBack = () => {
//     setCurrentStep(currentStep - 1)
//   }

//   const handlePayment = async () => {
//     if (!validateStep(3)) return
    
//     setIsSubmitting(true)
    
//     try {
//       // Create payment order
//       const orderData = await createPaymentOrder({
//         cartItems,
//         formData,
//         totalAmount: grandTotal,
//         donationAmount: totalDonationAmount,
//         tipAmount: tipAmount
//       })

//       // Configure Razorpay options
//       const options = {
//         key: orderData.key,
//         amount: orderData.amount * 100,
//         currency: orderData.currency,
//         name: "Your NGO Name",
//         description: "Donation Payment",
//         order_id: orderData.orderId,
//         handler: async function (response: any) {
//           try {
//             // Process successful payment
//             await processPaymentSuccess({
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_signature: response.razorpay_signature
//             })
            
//             // Clear cart and form data
//             clearCart()
//             clearFormData()
            
//             // Move to success step
//             setCurrentStep(4)
            
//           } catch (error) {
//             console.error('Payment processing failed:', error)
//             setCurrentStep(4) // Go to step 4 but show error
//           }
//         },
//         prefill: {
//           name: formData.donorName || '',
//           contact: formData.mobileNumber || '',
//         },
//         theme: {
//           color: '#3B82F6'
//         },
//         modal: {
//           ondismiss: function() {
//             setIsSubmitting(false)
//           }
//         }
//       }

//       // Open Razorpay checkout
//       const razorpay = new (window as any).Razorpay(options)
//       razorpay.open()
      
//     } catch (error) {
//       console.error('Payment initiation failed:', error)
//       setIsSubmitting(false)
//     }
//   }

//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return <PersonalInfoStep />
//       case 2:
//         return <ReviewCartStep />
//       case 3:
//         return <PaymentStep />
//       case 4:
//         return <SuccessStep />
//       default:
//         return <PersonalInfoStep />
//     }
//   }

//   // Step 1: Personal Information
//   const PersonalInfoStep = () => (
//     <motion.div
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: -20 }}
//       className="space-y-6"
//     >
//       <div className="text-center mb-6">
//         <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
//         <p className="text-gray-600">Tell us a bit about yourself</p>
//       </div>

//       <div className="grid md:grid-cols-2 gap-4">
//         <div>
//           <Label htmlFor="donorName">Full Name (Optional)</Label>
//           <Input
//             id="donorName"
//             placeholder="Enter your full name"
//             value={formData.donorName || ''}
//             onChange={(e) => updateFormData({ donorName: e.target.value })}
//           />
//         </div>
        
//         <div>
//           <Label htmlFor="donorCountry">Country *</Label>
//           <Select 
//             value={formData.donorCountry} 
//             onValueChange={(value) => updateFormData({ donorCountry: value })}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select your country" />
//             </SelectTrigger>
//             <SelectContent>
//               {countries.map((country) => (
//                 <SelectItem key={country.value} value={country.value}>
//                   {country.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           {errors.donorCountry && (
//             <p className="text-red-500 text-sm mt-1">{errors.donorCountry}</p>
//           )}
//         </div>
//       </div>

//       <div>
//         <Label htmlFor="mobileNumber">Mobile Number *</Label>
//         <Input
//           id="mobileNumber"
//           placeholder="Enter your mobile number"
//           value={formData.mobileNumber || ''}
//           onChange={(e) => updateFormData({ mobileNumber: e.target.value })}
//         />
//         {errors.mobileNumber && (
//           <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
//         )}
//       </div>

//       <div>
//         <Label htmlFor="donatedOnBehalfOf">Donating on behalf of someone? (Optional)</Label>
//         <Input
//           id="donatedOnBehalfOf"
//           placeholder="Enter name if donating on someone's behalf"
//           value={formData.donatedOnBehalfOf || ''}
//           onChange={(e) => updateFormData({ donatedOnBehalfOf: e.target.value })}
//         />
//       </div>

//       <div className="space-y-4">
//         <Label>Custom Image (Optional)</Label>
//         <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//           {imagePreview ? (
//             <div className="relative">
//               <Image
//                 src={imagePreview}
//                 alt="Custom upload"
//                 width={200}
//                 height={150}
//                 className="mx-auto rounded-lg object-cover"
//               />
//               <Button
//                 variant="destructive"
//                 size="sm"
//                 onClick={removeImage}
//                 className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
//               >
//                 <X className="w-4 h-4" />
//               </Button>
//             </div>
//           ) : (
//             <div>
//               <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500 mb-4">Upload a custom image for personalization</p>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 className="hidden"
//                 id="image-upload"
//               />
//               <Button
//                 variant="outline"
//                 onClick={() => document.getElementById('image-upload')?.click()}
//                 className="mx-auto"
//               >
//                 <Upload className="w-4 h-4 mr-2" />
//                 Choose Image
//               </Button>
//             </div>
//           )}
//         </div>
//         {errors.customImage && (
//           <p className="text-red-500 text-sm">{errors.customImage}</p>
//         )}
//       </div>

//       <div className="grid md:grid-cols-2 gap-4">
//         <div className="flex items-center space-x-2">
//           <Checkbox
//             id="isPublic"
//             checked={formData.isPublic || false}
//             onCheckedChange={(checked) => updateFormData({ isPublic: !!checked })}
//           />
//           <Label htmlFor="isPublic">Make my donation public</Label>
//         </div>
        
//         <div className="flex items-center space-x-2">
//           <Checkbox
//             id="isAnonymous"
//             checked={formData.isAnonymous || false}
//             onCheckedChange={(checked) => updateFormData({ isAnonymous: !!checked })}
//           />
//           <Label htmlFor="isAnonymous">Donate anonymously</Label>
//         </div>
//       </div>
//     </motion.div>
//   )

//   // Step 2: Review Cart
//   const ReviewCartStep = () => (
//     <motion.div
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: -20 }}
//       className="space-y-6"
//     >
//       <div className="text-center mb-6">
//         <Package className="w-12 h-12 text-green-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-900">Review Your Donation</h2>
//         <p className="text-gray-600">Confirm your items and amounts</p>
//       </div>

//       {/* Direct Donation */}
//       {customAmount > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <Heart className="w-5 h-5 mr-2 text-red-500" />
//               Direct Donation
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex justify-between items-center">
//               <span>Direct contribution to campaigns</span>
//               <Badge className="bg-red-50 text-red-700">
//                 ₹{customAmount.toLocaleString()}
//               </Badge>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Product Items */}
//       {Object.entries(itemsByCampaign).map(([campaignId, campaign]) => (
//         <Card key={campaignId}>
//           <CardHeader>
//             <CardTitle className="text-lg">{campaign.campaignTitle}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {campaign.items.map((item) => (
//               <div key={`${item.productId}-${item.campaignId}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   {item.image && (
//                     <Image
//                       src={item.image}
//                       alt={item.name}
//                       width={40}
//                       height={40}
//                       className="rounded object-cover"
//                     />
//                   )}
//                   <div>
//                     <p className="font-medium">{item.name}</p>
//                     <p className="text-sm text-gray-500">
//                       ₹{item.price.toLocaleString()} × {item.quantity}
//                     </p>
//                   </div>
//                 </div>
//                 <span className="font-semibold">
//                   ₹{(item.price * item.quantity).toLocaleString()}
//                 </span>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       ))}

//       {/* Optional Messages */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
//             Add Personal Touch (Optional)
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="customMessage">Custom Message</Label>
//             <Textarea
//               id="customMessage"
//               placeholder="Add a personal message..."
//               value={formData.customMessage || ''}
//               onChange={(e) => updateFormData({ customMessage: e.target.value })}
//               rows={3}
//             />
//           </div>
          
//           <div>
//             <Label htmlFor="donationPurpose">Purpose of Donation</Label>
//             <Input
//               id="donationPurpose"
//               placeholder="e.g., Birthday celebration, In memory of..."
//               value={formData.donationPurpose || ''}
//               onChange={(e) => updateFormData({ donationPurpose: e.target.value })}
//             />
//           </div>
          
//           <div>
//             <Label htmlFor="specialInstructions">Special Instructions</Label>
//             <Textarea
//               id="specialInstructions"
//               placeholder="Any special instructions for the delivery..."
//               value={formData.specialInstructions || ''}
//               onChange={(e) => updateFormData({ specialInstructions: e.target.value })}
//               rows={2}
//             />
//           </div>
          
//           <div>
//             <Label htmlFor="donorMessage">Public Message (Optional)</Label>
//             <Textarea
//               id="donorMessage"
//               placeholder="This message will be visible to others if you make your donation public..."
//               value={formData.donorMessage || ''}
//               onChange={(e) => updateFormData({ donorMessage: e.target.value })}
//               rows={2}
//             />
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   )

//   // Step 3: Payment Summary
//   const PaymentStep = () => (
//     <motion.div
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: -20 }}
//       className="space-y-6"
//     >
//       <div className="text-center mb-6">
//         <CreditCard className="w-12 h-12 text-purple-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-900">Payment Summary</h2>
//         <p className="text-gray-600">Review and confirm your donation</p>
//       </div>

//       {/* Payment Summary */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Donation Summary</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {subtotal > 0 && (
//             <div className="flex justify-between">
//               <span>Products Total</span>
//               <span>₹{subtotal.toLocaleString()}</span>
//             </div>
//           )}
          
//           {customAmount > 0 && (
//             <div className="flex justify-between">
//               <span>Direct Donation</span>
//               <span>₹{customAmount.toLocaleString()}</span>
//             </div>
//           )}
          
//           <Separator />
          
//           <div className="flex justify-between font-medium">
//             <span>Subtotal</span>
//             <span>₹{totalDonationAmount.toLocaleString()}</span>
//           </div>
          
//           {tipAmount > 0 && (
//             <div className="flex justify-between text-green-600">
//               <span>Platform Tip</span>
//               <span>₹{tipAmount.toLocaleString()}</span>
//             </div>
//           )}
          
//           <Separator />
          
//           <div className="flex justify-between text-lg font-bold">
//             <span>Total Amount</span>
//             <span className="text-green-600">₹{grandTotal.toLocaleString()}</span>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Donor Information Summary */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Donor Information</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-2">
//           <div className="grid md:grid-cols-2 gap-4 text-sm">
//             <div>
//               <span className="font-medium">Name:</span> {formData.donorName || 'Anonymous'}
//             </div>
//             <div>
//               <span className="font-medium">Country:</span> {countries.find(c => c.value === formData.donorCountry)?.label}
//             </div>
//             <div>
//               <span className="font-medium">Mobile:</span> {formData.mobileNumber}
//             </div>
//             {formData.donatedOnBehalfOf && (
//               <div>
//                 <span className="font-medium">On behalf of:</span> {formData.donatedOnBehalfOf}
//               </div>
//             )}
//           </div>
          
//           {formData.customMessage && (
//             <div className="mt-3 p-3 bg-blue-50 rounded-lg">
//               <span className="font-medium text-blue-700">Message:</span>
//               <p className="text-blue-600 mt-1">{formData.customMessage}</p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Payment Error */}
//       {paymentError && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
//             <span className="text-red-700">{paymentError}</span>
//           </div>
//         </div>
//       )}

//       {/* Impact Preview */}
//       <Card className="bg-gradient-to-r from-green-50 to-blue-50">
//         <CardContent className="p-6">
//           <div className="text-center">
//             <Gift className="w-8 h-8 text-green-500 mx-auto mb-2" />
//             <h3 className="font-semibold text-gray-900 mb-2">Your Impact</h3>
//             <p className="text-gray-600 text-sm">
//               Your generous donation of ₹{grandTotal.toLocaleString()} can help approximately{' '}
//               <span className="font-bold text-green-600">
//                 {Math.floor(totalDonationAmount / 100)} people
//               </span>{' '}
//               in need. Thank you for making a difference!
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   )

//   // Step 4: Success/Failure
//   const SuccessStep = () => (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className="text-center space-y-6"
//     >
//       {paymentError ? (
//         // Payment Failed
//         <div className="space-y-4">
//           <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
//           <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
//           <p className="text-gray-600 max-w-md mx-auto">
//             Unfortunately, your payment could not be processed. Please try again or contact support.
//           </p>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
//             <p className="text-red-700 text-sm">{paymentError}</p>
//           </div>
//           <div className="space-x-4">
//             <Button onClick={() => setCurrentStep(3)} variant="outline">
//               Try Again
//             </Button>
//             <Button onClick={() => router.push('/cart')}>
//               Back to Cart
//             </Button>
//           </div>
//         </div>
//       ) : (
//         // Payment Success
//         <div className="space-y-4">
//           <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
//           <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
//           <p className="text-gray-600 max-w-md mx-auto">
//             Your donation has been successfully processed. You'll receive a confirmation email shortly.
//           </p>
          
//           <Card className="max-w-md mx-auto">
//             <CardContent className="p-6">
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Donation Amount:</span>
//                   <span className="font-medium">₹{totalDonationAmount.toLocaleString()}</span>
//                 </div>
//                 {tipAmount > 0 && (
//                   <div className="flex justify-between">
//                     <span>Platform Tip:</span>
//                     <span className="font-medium">₹{tipAmount.toLocaleString()}</span>
//                   </div>
//                 )}
//                 <Separator />
//                 <div className="flex justify-between font-bold">
//                   <span>Total Paid:</span>
//                   <span>₹{grandTotal.toLocaleString()}</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 max-w-md mx-auto">
//             <h3 className="font-semibold text-gray-900 mb-2">Your Impact</h3>
//             <p className="text-gray-600 text-sm">
//               Your donation will help approximately{' '}
//               <span className="font-bold text-green-600">
//                 {Math.floor(totalDonationAmount / 100)} people
//               </span>{' '}
//               in need. Updates on your impact will be shared with you soon!
//             </p>
//           </div>

//           <div className="space-x-4">
//             <Button onClick={() => router.push('/causes')}>
//               Donate More
//             </Button>
//             <Button onClick={() => router.push('/')} variant="outline">
//               Go Home
//             </Button>
//           </div>
//         </div>
//       )}
//     </motion.div>
//   )

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4">
//         {/* Progress Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <h1 className="text-2xl font-bold text-gray-900">Complete Your Donation</h1>
//             <Badge variant="outline" className="text-sm">
//               Step {currentStep} of {totalSteps}
//             </Badge>
//           </div>
          
//           <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          
//           <div className="flex justify-between mt-2 text-xs text-gray-500">
//             <span>Personal Info</span>
//             <span>Review</span>
//             <span>Payment</span>
//             <span>Complete</span>
//           </div>
//         </div>

//         {/* Main Content */}
//         <Card className="mb-8">
//           <CardContent className="p-6 md:p-8">
//             <AnimatePresence mode="wait">
//               {renderStep()}
//             </AnimatePresence>
//           </CardContent>
//         </Card>

//         {/* Navigation */}
//         {currentStep !== 4 && (
//           <div className="flex justify-between items-center">
//             <Button
//               variant="outline"
//               onClick={currentStep === 1 ? () => router.push('/cart') : handleBack}
//               disabled={isSubmitting}
//             >
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               {currentStep === 1 ? 'Back to Cart' : 'Previous'}
//             </Button>

//             <div className="flex space-x-4">
//               {currentStep < 3 && (
//                 <Button onClick={handleNext}>
//                   Next
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </Button>
//               )}
              
//               {currentStep === 3 && (
//                 <Button
//                   onClick={handlePayment}
//                   disabled={isSubmitting || isProcessing}
//                   className="min-w-[150px]"
//                 >
//                   {isSubmitting || isProcessing ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       Pay ₹{grandTotal.toLocaleString()}
//                       <CreditCard className="w-4 h-4 ml-2" />
//                     </>
//                   )}
//                 </Button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


/// 2nd 



// "use client"
// import { useState, useEffect, useCallback, useMemo, memo } from 'react'
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { Progress } from "@/components/ui/progress"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {
//   ArrowLeft,
//   ArrowRight,
//   Upload,
//   X,
//   User,
//   Heart,
//   CreditCard,
//   CheckCircle,
//   AlertCircle,
//   Package,
//   Gift,
//   MessageSquare,
//   Camera,
//   Loader2
// } from "lucide-react"
// import { motion, AnimatePresence } from "framer-motion"
// import { useRouter } from "next/navigation"
// import { useDonationCart, useDonationForm, usePayment } from "@/hooks/useDonationHooks"
// import Image from "next/image"

// // Country options - Move outside component to prevent recreation
// const countries = [
//   { value: "IN", label: "India" },
//   { value: "US", label: "United States" },
//   { value: "UK", label: "United Kingdom" },
//   { value: "CA", label: "Canada" },
//   { value: "AU", label: "Australia" },
//   // Add more countries as needed
// ]

// // Memoized form steps to prevent unnecessary re-renders
// const PersonalInfoStep = memo(({ 
//   formData, 
//   updateFormData, 
//   errors, 
//   imagePreview, 
//   handleImageUpload, 
//   removeImage 
// }: {
//   formData: any
//   updateFormData: (data: any) => void
//   errors: Record<string, string>
//   imagePreview: string | null
//   handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
//   removeImage: () => void
// }) => (
//   <motion.div
//     initial={{ opacity: 0, x: 20 }}
//     animate={{ opacity: 1, x: 0 }}
//     exit={{ opacity: 0, x: -20 }}
//     className="space-y-6"
//   >
//     <div className="text-center mb-6">
//       <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
//       <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
//       <p className="text-gray-600">Tell us a bit about yourself</p>
//     </div>

//     <div className="grid md:grid-cols-2 gap-4">
//       <div>
//         <Label htmlFor="donorName">Full Name (Optional)</Label>
//         <Input
//           id="donorName"
//           placeholder="Enter your full name"
//           value={formData.donorName || ''}
//           onChange={(e) => updateFormData({ donorName: e.target.value })}
//         />
//       </div>
      
//       <div>
//         <Label htmlFor="donorCountry">Country *</Label>
//         <Select 
//           value={formData.donorCountry} 
//           onValueChange={(value) => updateFormData({ donorCountry: value })}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select your country" />
//           </SelectTrigger>
//           <SelectContent>
//             {countries.map((country) => (
//               <SelectItem key={country.value} value={country.value}>
//                 {country.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {errors.donorCountry && (
//           <p className="text-red-500 text-sm mt-1">{errors.donorCountry}</p>
//         )}
//       </div>
//     </div>

//     <div>
//       <Label htmlFor="mobileNumber">Mobile Number *</Label>
//       <Input
//         id="mobileNumber"
//         placeholder="Enter your mobile number"
//         value={formData.mobileNumber || ''}
//         onChange={(e) => updateFormData({ mobileNumber: e.target.value })}
//       />
//       {errors.mobileNumber && (
//         <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
//       )}
//     </div>

//     <div>
//       <Label htmlFor="donatedOnBehalfOf">Donating on behalf of someone? (Optional)</Label>
//       <Input
//         id="donatedOnBehalfOf"
//         placeholder="Enter name if donating on someone's behalf"
//         value={formData.donatedOnBehalfOf || ''}
//         onChange={(e) => updateFormData({ donatedOnBehalfOf: e.target.value })}
//       />
//     </div>

//     <div className="space-y-4">
//       <Label>Custom Image (Optional)</Label>
//       <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//         {imagePreview ? (
//           <div className="relative">
//             <Image
//               src={imagePreview}
//               alt="Custom upload"
//               width={200}
//               height={150}
//               className="mx-auto rounded-lg object-cover"
//             />
//             <Button
//               variant="destructive"
//               size="sm"
//               onClick={removeImage}
//               className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
//             >
//               <X className="w-4 h-4" />
//             </Button>
//           </div>
//         ) : (
//           <div>
//             <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500 mb-4">Upload a custom image for personalization</p>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               className="hidden"
//               id="image-upload"
//             />
//             <Button
//               variant="outline"
//               onClick={() => document.getElementById('image-upload')?.click()}
//               className="mx-auto"
//             >
//               <Upload className="w-4 h-4 mr-2" />
//               Choose Image
//             </Button>
//           </div>
//         )}
//       </div>
//       {errors.customImage && (
//         <p className="text-red-500 text-sm">{errors.customImage}</p>
//       )}
//     </div>

//     <div className="grid md:grid-cols-2 gap-4">
//       <div className="flex items-center space-x-2">
//         <Checkbox
//           id="isPublic"
//           checked={formData.isPublic || false}
//           onCheckedChange={(checked) => updateFormData({ isPublic: !!checked })}
//         />
//         <Label htmlFor="isPublic">Make my donation public</Label>
//       </div>
      
//       <div className="flex items-center space-x-2">
//         <Checkbox
//           id="isAnonymous"
//           checked={formData.isAnonymous || false}
//           onCheckedChange={(checked) => updateFormData({ isAnonymous: !!checked })}
//         />
//         <Label htmlFor="isAnonymous">Donate anonymously</Label>
//       </div>
//     </div>
//   </motion.div>
// ))

// const ReviewCartStep = memo(({ 
//   customAmount, 
//   itemsByCampaign, 
//   formData, 
//   updateFormData 
// }: {
//   customAmount: number
//   itemsByCampaign: any
//   formData: any
//   updateFormData: (data: any) => void
// }) => (
//   <motion.div
//     initial={{ opacity: 0, x: 20 }}
//     animate={{ opacity: 1, x: 0 }}
//     exit={{ opacity: 0, x: -20 }}
//     className="space-y-6"
//   >
//     <div className="text-center mb-6">
//       <Package className="w-12 h-12 text-green-500 mx-auto mb-4" />
//       <h2 className="text-2xl font-bold text-gray-900">Review Your Donation</h2>
//       <p className="text-gray-600">Confirm your items and amounts</p>
//     </div>

//     {/* Direct Donation */}
//     {customAmount > 0 && (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Heart className="w-5 h-5 mr-2 text-red-500" />
//             Direct Donation
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex justify-between items-center">
//             <span>Direct contribution to campaigns</span>
//             <Badge className="bg-red-50 text-red-700">
//               ₹{customAmount.toLocaleString()}
//             </Badge>
//           </div>
//         </CardContent>
//       </Card>
//     )}

//     {/* Product Items */}
//     {Object.entries(itemsByCampaign).map(([campaignId, campaign]: [string, any]) => (
//       <Card key={campaignId}>
//         <CardHeader>
//           <CardTitle className="text-lg">{campaign.campaignTitle}</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {campaign.items.map((item: any) => (
//             <div key={`${item.productId}-${item.campaignId}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//               <div className="flex items-center space-x-3">
//                 {item.image && (
//                   <Image
//                     src={item.image}
//                     alt={item.name}
//                     width={40}
//                     height={40}
//                     className="rounded object-cover"
//                   />
//                 )}
//                 <div>
//                   <p className="font-medium">{item.name}</p>
//                   <p className="text-sm text-gray-500">
//                     ₹{item.price.toLocaleString()} × {item.quantity}
//                   </p>
//                 </div>
//               </div>
//               <span className="font-semibold">
//                 ₹{(item.price * item.quantity).toLocaleString()}
//               </span>
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     ))}

//     {/* Optional Messages */}
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center">
//           <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
//           Add Personal Touch (Optional)
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div>
//           <Label htmlFor="customMessage">Custom Message</Label>
//           <Textarea
//             id="customMessage"
//             placeholder="Add a personal message..."
//             value={formData.customMessage || ''}
//             onChange={(e) => updateFormData({ customMessage: e.target.value })}
//             rows={3}
//           />
//         </div>
        
//         <div>
//           <Label htmlFor="donationPurpose">Purpose of Donation</Label>
//           <Input
//             id="donationPurpose"
//             placeholder="e.g., Birthday celebration, In memory of..."
//             value={formData.donationPurpose || ''}
//             onChange={(e) => updateFormData({ donationPurpose: e.target.value })}
//           />
//         </div>
        
//         <div>
//           <Label htmlFor="specialInstructions">Special Instructions</Label>
//           <Textarea
//             id="specialInstructions"
//             placeholder="Any special instructions for the delivery..."
//             value={formData.specialInstructions || ''}
//             onChange={(e) => updateFormData({ specialInstructions: e.target.value })}
//             rows={2}
//           />
//         </div>
        
//         <div>
//           <Label htmlFor="donorMessage">Public Message (Optional)</Label>
//           <Textarea
//             id="donorMessage"
//             placeholder="This message will be visible to others if you make your donation public..."
//             value={formData.donorMessage || ''}
//             onChange={(e) => updateFormData({ donorMessage: e.target.value })}
//             rows={2}
//           />
//         </div>
//       </CardContent>
//     </Card>
//   </motion.div>
// ))

// const PaymentStep = memo(({ 
//   subtotal, 
//   customAmount, 
//   totalDonationAmount, 
//   tipAmount, 
//   grandTotal, 
//   formData, 
//   paymentError 
// }: {
//   subtotal: number
//   customAmount: number
//   totalDonationAmount: number
//   tipAmount: number
//   grandTotal: number
//   formData: any
//   paymentError: string | null
// }) => (
//   <motion.div
//     initial={{ opacity: 0, x: 20 }}
//     animate={{ opacity: 1, x: 0 }}
//     exit={{ opacity: 0, x: -20 }}
//     className="space-y-6"
//   >
//     <div className="text-center mb-6">
//       <CreditCard className="w-12 h-12 text-purple-500 mx-auto mb-4" />
//       <h2 className="text-2xl font-bold text-gray-900">Payment Summary</h2>
//       <p className="text-gray-600">Review and confirm your donation</p>
//     </div>

//     {/* Payment Summary */}
//     <Card>
//       <CardHeader>
//         <CardTitle>Donation Summary</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-3">
//         {subtotal > 0 && (
//           <div className="flex justify-between">
//             <span>Products Total</span>
//             <span>₹{subtotal.toLocaleString()}</span>
//           </div>
//         )}
        
//         {customAmount > 0 && (
//           <div className="flex justify-between">
//             <span>Direct Donation</span>
//             <span>₹{customAmount.toLocaleString()}</span>
//           </div>
//         )}
        
//         <Separator />
        
//         <div className="flex justify-between font-medium">
//           <span>Subtotal</span>
//           <span>₹{totalDonationAmount.toLocaleString()}</span>
//         </div>
        
//         {tipAmount > 0 && (
//           <div className="flex justify-between text-green-600">
//             <span>Platform Tip</span>
//             <span>₹{tipAmount.toLocaleString()}</span>
//           </div>
//         )}
        
//         <Separator />
        
//         <div className="flex justify-between text-lg font-bold">
//           <span>Total Amount</span>
//           <span className="text-green-600">₹{grandTotal.toLocaleString()}</span>
//         </div>
//       </CardContent>
//     </Card>

//     {/* Donor Information Summary */}
//     <Card>
//       <CardHeader>
//         <CardTitle>Donor Information</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-2">
//         <div className="grid md:grid-cols-2 gap-4 text-sm">
//           <div>
//             <span className="font-medium">Name:</span> {formData.donorName || 'Anonymous'}
//           </div>
//           <div>
//             <span className="font-medium">Country:</span> {countries.find(c => c.value === formData.donorCountry)?.label}
//           </div>
//           <div>
//             <span className="font-medium">Mobile:</span> {formData.mobileNumber}
//           </div>
//           {formData.donatedOnBehalfOf && (
//             <div>
//               <span className="font-medium">On behalf of:</span> {formData.donatedOnBehalfOf}
//             </div>
//           )}
//         </div>
        
//         {formData.customMessage && (
//           <div className="mt-3 p-3 bg-blue-50 rounded-lg">
//             <span className="font-medium text-blue-700">Message:</span>
//             <p className="text-blue-600 mt-1">{formData.customMessage}</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>

//     {/* Payment Error */}
//     {paymentError && (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//         <div className="flex items-center">
//           <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
//           <span className="text-red-700">{paymentError}</span>
//         </div>
//       </div>
//     )}

//     {/* Impact Preview */}
//     <Card className="bg-gradient-to-r from-green-50 to-blue-50">
//       <CardContent className="p-6">
//         <div className="text-center">
//           <Gift className="w-8 h-8 text-green-500 mx-auto mb-2" />
//           <h3 className="font-semibold text-gray-900 mb-2">Your Impact</h3>
//           <p className="text-gray-600 text-sm">
//             Your generous donation of ₹{grandTotal.toLocaleString()} can help approximately{' '}
//             <span className="font-bold text-green-600">
//               {Math.floor(totalDonationAmount / 100)} people
//             </span>{' '}
//             in need. Thank you for making a difference!
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   </motion.div>
// ))

// const SuccessStep = memo(({ 
//   paymentError, 
//   totalDonationAmount, 
//   tipAmount, 
//   grandTotal, 
//   setCurrentStep, 
//   router 
// }: {
//   paymentError: string | null
//   totalDonationAmount: number
//   tipAmount: number
//   grandTotal: number
//   setCurrentStep: (step: number) => void
//   router: any
// }) => (
//   <motion.div
//     initial={{ opacity: 0, scale: 0.95 }}
//     animate={{ opacity: 1, scale: 1 }}
//     className="text-center space-y-6"
//   >
//     {paymentError ? (
//       // Payment Failed
//       <div className="space-y-4">
//         <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
//         <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
//         <p className="text-gray-600 max-w-md mx-auto">
//           Unfortunately, your payment could not be processed. Please try again or contact support.
//         </p>
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
//           <p className="text-red-700 text-sm">{paymentError}</p>
//         </div>
//         <div className="space-x-4">
//           <Button onClick={() => setCurrentStep(3)} variant="outline">
//             Try Again
//           </Button>
//           <Button onClick={() => router.push('/cart')}>
//             Back to Cart
//           </Button>
//         </div>
//       </div>
//     ) : (
//       // Payment Success
//       <div className="space-y-4">
//         <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
//         <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
//         <p className="text-gray-600 max-w-md mx-auto">
//           Your donation has been successfully processed. You'll receive a confirmation email shortly.
//         </p>
        
//         <Card className="max-w-md mx-auto">
//           <CardContent className="p-6">
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span>Donation Amount:</span>
//                 <span className="font-medium">₹{totalDonationAmount.toLocaleString()}</span>
//               </div>
//               {tipAmount > 0 && (
//                 <div className="flex justify-between">
//                   <span>Platform Tip:</span>
//                   <span className="font-medium">₹{tipAmount.toLocaleString()}</span>
//                 </div>
//               )}
//               <Separator />
//               <div className="flex justify-between font-bold">
//                 <span>Total Paid:</span>
//                 <span>₹{grandTotal.toLocaleString()}</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 max-w-md mx-auto">
//           <h3 className="font-semibold text-gray-900 mb-2">Your Impact</h3>
//           <p className="text-gray-600 text-sm">
//             Your donation will help approximately{' '}
//             <span className="font-bold text-green-600">
//               {Math.floor(totalDonationAmount / 100)} people
//             </span>{' '}
//             in need. Updates on your impact will be shared with you soon!
//           </p>
//         </div>

//         <div className="space-x-4">
//           <Button onClick={() => router.push('/causes')}>
//             Donate More
//           </Button>
//           <Button onClick={() => router.push('/')} variant="outline">
//             Go Home
//           </Button>
//         </div>
//       </div>
//     )}
//   </motion.div>
// ))

// // Add display names for better debugging
// PersonalInfoStep.displayName = 'PersonalInfoStep'
// ReviewCartStep.displayName = 'ReviewCartStep'
// PaymentStep.displayName = 'PaymentStep'
// SuccessStep.displayName = 'SuccessStep'

// export default function MultiStepDonationForm() {
//   const router = useRouter()
//   const { cartItems, getCartTotals, getItemsByCampaign, clearCart } = useDonationCart()
//   const { formData, updateFormData, getTipAmount, clearFormData } = useDonationForm()
//   const { createPaymentOrder, processPaymentSuccess, isProcessing, paymentError } = usePayment()
  
//   const [currentStep, setCurrentStep] = useState(1)
//   const [imagePreview, setImagePreview] = useState<string | null>(null)
//   const [errors, setErrors] = useState<Record<string, string>>({})
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const totalSteps = 4

//   // Memoize expensive calculations
//   const { subtotal, totalItems } = useMemo(() => getCartTotals(), [getCartTotals])
//   const customAmount = useMemo(() => formData.customAmount || 0, [formData.customAmount])
//   const totalDonationAmount = useMemo(() => subtotal + customAmount, [subtotal, customAmount])
//   const tipAmount = useMemo(() => getTipAmount(totalDonationAmount), [getTipAmount, totalDonationAmount])
//   const grandTotal = useMemo(() => totalDonationAmount + tipAmount, [totalDonationAmount, tipAmount])
//   const itemsByCampaign = useMemo(() => getItemsByCampaign(), [getItemsByCampaign])

//   // Memoize callbacks to prevent unnecessary re-renders
//   const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         setErrors(prev => ({ ...prev, customImage: 'Image size should be less than 5MB' }))
//         return
//       }
      
//       updateFormData({ customImage: file })
      
//       const reader = new FileReader()
//       reader.onload = (e) => {
//         setImagePreview(e.target?.result as string)
//       }
//       reader.readAsDataURL(file)
      
//       // Clear error
//       setErrors(prev => {
//         const newErrors = { ...prev }
//         delete newErrors.customImage
//         return newErrors
//       })
//     }
//   }, [updateFormData])

//   const removeImage = useCallback(() => {
//     updateFormData({ customImage: undefined })
//     setImagePreview(null)
//     setErrors(prev => {
//       const newErrors = { ...prev }
//       delete newErrors.customImage
//       return newErrors
//     })
//   }, [updateFormData])

//   const validateStep = useCallback((step: number): boolean => {
//     const newErrors: Record<string, string> = {}
    
//     if (step === 1) {
//       if (!formData.donorCountry) {
//         newErrors.donorCountry = 'Country is required'
//       }
//       if (!formData.mobileNumber) {
//         newErrors.mobileNumber = 'Mobile number is required'
//       } else if (!/^\+?[\d\s-()]+$/.test(formData.mobileNumber)) {
//         newErrors.mobileNumber = 'Please enter a valid mobile number'
//       }
//     }
    
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }, [formData.donorCountry, formData.mobileNumber])

//   const handleNext = useCallback(() => {
//     if (validateStep(currentStep)) {
//       setCurrentStep(prev => prev + 1)
//     }
//   }, [currentStep, validateStep])

//   const handleBack = useCallback(() => {
//     setCurrentStep(prev => prev - 1)
//   }, [])

//   const handlePayment = useCallback(async () => {
//     if (!validateStep(3)) return
    
//     setIsSubmitting(true)
    
//     try {
//       // Create payment order
//       const orderData = await createPaymentOrder({
//         cartItems,
//         //@ts-ignore
//         formData,
//         totalAmount: grandTotal,
//         donationAmount: totalDonationAmount,
//         tipAmount: tipAmount
//       })

//       // Configure Razorpay options
//       const options = {
//         key: orderData.key,
//         amount: orderData.amount * 100,
//         currency: orderData.currency,
//         name: "Your NGO Name",
//         description: "Donation Payment",
//         order_id: orderData.orderId,
//         handler: async function (response: any) {
//           try {
//             // Process successful payment
//             await processPaymentSuccess({
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_signature: response.razorpay_signature
//             })
            
//             // Clear cart and form data
//             clearCart()
//             clearFormData()
            
//             // Move to success step
//             setCurrentStep(4)
            
//           } catch (error) {
//             console.error('Payment processing failed:', error)
//             setCurrentStep(4) // Go to step 4 but show error
//           }
//         },
//         prefill: {
//           name: formData.donorName || '',
//           contact: formData.mobileNumber || '',
//         },
//         theme: {
//           color: '#3B82F6'
//         },
//         modal: {
//           ondismiss: function() {
//             setIsSubmitting(false)
//           }
//         }
//       }

//       // Open Razorpay checkout
//       const razorpay = new (window as any).Razorpay(options)
//       razorpay.open()
      
//     } catch (error) {
//       console.error('Payment initiation failed:', error)
//       setIsSubmitting(false)
//     }
//   }, [validateStep, createPaymentOrder, cartItems, formData, grandTotal, totalDonationAmount, tipAmount, processPaymentSuccess, clearCart, clearFormData])

//   // Redirect if no items and no custom amount
//   useEffect(() => {
//     // if (totalItems === 0 && !customAmount) {
//     //   router.push('/cart')
//     // }
//   }, [totalItems, customAmount, router])

//   // Load Razorpay script
//   useEffect(() => {
//     const script = document.createElement('script')
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js'
//     script.async = true
//     document.body.appendChild(script)
    
//     return () => {
//       if (document.body.contains(script)) {
//         document.body.removeChild(script)
//       }
//     }
//   }, [])

//   // Memoize step rendering to prevent unnecessary re-renders
//   const renderStep = useMemo(() => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <PersonalInfoStep 
//             formData={formData}
//             updateFormData={updateFormData}
//             errors={errors}
//             imagePreview={imagePreview}
//             handleImageUpload={handleImageUpload}
//             removeImage={removeImage}
//           />
//         )
//       case 2:
//         return (
//           <ReviewCartStep 
//             customAmount={customAmount}
//             itemsByCampaign={itemsByCampaign}
//             formData={formData}
//             updateFormData={updateFormData}
//           />
//         )
//       case 3:
//         return (
//           <PaymentStep 
//             subtotal={subtotal}
//             customAmount={customAmount}
//             totalDonationAmount={totalDonationAmount}
//             tipAmount={tipAmount}
//             grandTotal={grandTotal}
//             formData={formData}
//             paymentError={paymentError}
//           />
//         )
//       case 4:
//         return (
//           <SuccessStep 
//             paymentError={paymentError}
//             totalDonationAmount={totalDonationAmount}
//             tipAmount={tipAmount}
//             grandTotal={grandTotal}
//             setCurrentStep={setCurrentStep}
//             router={router}
//           />
//         )
//       default:
//         return (
//           <PersonalInfoStep 
//             formData={formData}
//             updateFormData={updateFormData}
//             errors={errors}
//             imagePreview={imagePreview}
//             handleImageUpload={handleImageUpload}
//             removeImage={removeImage}
//           />
//         )
//     }
//   }, [currentStep, formData, updateFormData, errors, imagePreview, handleImageUpload, removeImage, customAmount, itemsByCampaign, subtotal, totalDonationAmount, tipAmount, grandTotal, paymentError, router])

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4">
//         {/* Progress Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <h1 className="text-2xl font-bold text-gray-900">Complete Your Donation</h1>
//             <Badge variant="outline" className="text-sm">
//               Step {currentStep} of {totalSteps}
//             </Badge>
//           </div>
          
//           <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          
//           <div className="flex justify-between mt-2 text-xs text-gray-500">
//             <span>Personal Info</span>
//             <span>Review</span>
//             <span>Payment</span>
//             <span>Complete</span>
//           </div>
//         </div>

//         {/* Main Content */}
//         <Card className="mb-8">
//           <CardContent className="p-6 md:p-8">
//             <AnimatePresence mode="wait">
//               {renderStep}
//             </AnimatePresence>
//           </CardContent>
//         </Card>

//         {/* Navigation */}
//         {currentStep !== 4 && (
//           <div className="flex justify-between items-center">
//             <Button
//               variant="outline"
//               onClick={currentStep === 1 ? () => router.push('/cart') : handleBack}
//               disabled={isSubmitting}
//             >
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               {currentStep === 1 ? 'Back to Cart' : 'Previous'}
//             </Button>

//             <div className="flex space-x-4">
//               {currentStep < 3 && (
//                 <Button onClick={handleNext}>
//                   Next
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </Button>
//               )}
              
//               {currentStep === 3 && (
//                 <Button
//                   onClick={handlePayment}
//                   disabled={isSubmitting || isProcessing}
//                   className="min-w-[150px]"
//                 >
//                   {isSubmitting || isProcessing ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       Pay ₹{grandTotal.toLocaleString()}
//                       <CreditCard className="w-4 h-4 ml-2" />
//                     </>
//                   )}
//                 </Button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }



"use client"
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
  Plus,
  Minus
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useDonationCart, useDonationForm, usePayment } from "@/hooks/useDonationHooks"
import Image from "next/image"

// Country options - Move outside component to prevent recreation
const countries = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  // Add more countries as needed
]

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
        <Label htmlFor="donorName">Full Name (Optional)</Label>
        <Input
          id="donorName"
          placeholder="Enter your full name"
          value={formData.donorName || ''}
          onChange={(e) => updateFormData({ donorName: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="donorCountry">Country *</Label>
        <Select 
          value={formData.donorCountry} 
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
        onChange={(e) => updateFormData({ mobileNumber: e.target.value })}
      />
      {errors.mobileNumber && (
        <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
      )}
    </div>

    <div>
      <Label htmlFor="donatedOnBehalfOf">Donating on behalf of someone? (Optional)</Label>
      <Input
        id="donatedOnBehalfOf"
        placeholder="Enter name if donating on someone's behalf"
        value={formData.donatedOnBehalfOf || ''}
        onChange={(e) => updateFormData({ donatedOnBehalfOf: e.target.value })}
      />
    </div>

    <div className="space-y-4">
      <Label>Custom Image (Optional)</Label>
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
          id="isPublic"
          checked={formData.isPublic || false}
          onCheckedChange={(checked) => updateFormData({ isPublic: !!checked })}
        />
        <Label htmlFor="isPublic">Make my donation public</Label>
      </div>
      
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
          <CardTitle className="text-lg">{campaign.campaignTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
          Add Personal Touch (Optional)
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
                setCustomTipValue("")
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

      {/* Impact Preview */}
      {totalDonationAmount > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="text-center">
              <Gift className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-2">Your Impact</h3>
              <p className="text-gray-600 text-sm">
                Your generous donation of ₹{grandTotal.toLocaleString()} can help approximately{' '}
                <span className="font-bold text-green-600">
                  {Math.floor(totalDonationAmount / 100)} people
                </span>{' '}
                in need. Thank you for making a difference!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
})

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
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center space-y-6"
  >
    {paymentError ? (
      // Payment Failed
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
    ) : (
      // Payment Success
      <div className="space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Your donation has been successfully processed. You'll receive a confirmation email shortly.
        </p>
        
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Donation Amount:</span>
                <span className="font-medium">₹{totalDonationAmount.toLocaleString()}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between">
                  <span>Platform Tip:</span>
                  <span className="font-medium">₹{tipAmount.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Paid:</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="font-semibold text-gray-900 mb-2">Your Impact</h3>
          <p className="text-gray-600 text-sm">
            Your donation will help approximately{' '}
            <span className="font-bold text-green-600">
              {Math.floor(totalDonationAmount / 100)} people
            </span>{' '}
            in need. Updates on your impact will be shared with you soon!
          </p>
        </div>

        <div className="space-x-4">
          <Button onClick={() => router.push('/causes')}>
            Donate More
          </Button>
          <Button onClick={() => router.push('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    )}
  </motion.div>
))

// Add display names for better debugging
PersonalInfoStep.displayName = 'PersonalInfoStep'
ReviewCartStep.displayName = 'ReviewCartStep'
PaymentStep.displayName = 'PaymentStep'
SuccessStep.displayName = 'SuccessStep'

export default function MultiStepDonationForm() {
  const router = useRouter()
  const { cartItems, getCartTotals, getItemsByCampaign, clearCart } = useDonationCart()
  const { formData, updateFormData, getTipAmount, clearFormData } = useDonationForm()
  const { createPaymentOrder, processPaymentSuccess, isProcessing, paymentError } = usePayment()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Direct donation and tip state
  const [customDonationAmount, setCustomDonationAmount] = useState("")
  const [selectedTip, setSelectedTip] = useState<number | 'custom' | null>(5)
  const [customTipValue, setCustomTipValue] = useState("")

  const totalSteps = 4

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
  const grandTotal = useMemo(() => totalDonationAmount + tipAmount, [totalDonationAmount, tipAmount])
  const itemsByCampaign = useMemo(() => getItemsByCampaign(), [getItemsByCampaign])

  // Memoize callbacks to prevent unnecessary re-renders
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, customImage: 'Image size should be less than 5MB' }))
        return
      }
      
      updateFormData({ customImage: file })
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Clear error
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.customImage
        return newErrors
      })
    }
  }, [updateFormData])

  const removeImage = useCallback(() => {
    updateFormData({ customImage: undefined })
    setImagePreview(null)
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
        newErrors.donorCountry = 'Country is required'
      }
      if (!formData.mobileNumber) {
        newErrors.mobileNumber = 'Mobile number is required'
      } else if (!/^\+?[\d\s-()]+$/.test(formData.mobileNumber)) {
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
  }, [formData.donorCountry, formData.mobileNumber, totalDonationAmount])

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, validateStep])

  const handleBack = useCallback(() => {
    setCurrentStep(prev => prev - 1)
  }, [])

  const handlePayment = useCallback(async () => {
    if (!validateStep(3)) return
    
    setIsSubmitting(true)
    
    try {
      // Create payment order
      const orderData = await createPaymentOrder({
        cartItems,
        formData: {
          ...formData,
          customAmount: customAmount,
          tipAmount: tipAmount
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
        name: "Your NGO Name",
        description: "Donation Payment",
        order_id: orderData.orderId,
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
            clearFormData()
            
            // Clear local state
            setCustomDonationAmount("")
            setSelectedTip(5)
            setCustomTipValue("")
            
            // Move to success step
            setCurrentStep(4)
            
          } catch (error) {
            console.error('Payment processing failed:', error)
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
          ondismiss: function() {
            setIsSubmitting(false)
          }
        }
      }

      // Check if Razorpay is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay SDK not loaded')
      }

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
      
    } catch (error) {
      console.error('Payment initiation failed:', error)
      setIsSubmitting(false)
    }
  }, [validateStep, createPaymentOrder, cartItems, formData, grandTotal, totalDonationAmount, tipAmount, processPaymentSuccess, clearCart, clearFormData, customAmount])

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      console.log('Razorpay script loaded successfully')
    }
    script.onerror = () => {
      console.error('Failed to load Razorpay script')
    }
    document.body.appendChild(script)
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

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
            totalDonationAmount={totalDonationAmount}
            tipAmount={tipAmount}
            grandTotal={grandTotal}
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
  }, [currentStep, formData, updateFormData, errors, imagePreview, handleImageUpload, removeImage, customAmount, itemsByCampaign, subtotal, totalDonationAmount, tipAmount, grandTotal, paymentError, router, selectedTip, setSelectedTip, customTipValue, setCustomTipValue, customDonationAmount, setCustomDonationAmount])

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Progress Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Complete Your Donation</h1>
            <Badge variant="outline" className="text-sm">
              Step {currentStep} of {totalSteps}
            </Badge>
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
          <CardContent className="p-4 sm:p-6 md:p-8">
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
                  disabled={isSubmitting || isProcessing || grandTotal <= 0}
                  className="min-w-[150px] w-full sm:w-auto"
                >
                  {isSubmitting || isProcessing ? (
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
      </div>
    </div>
  )
}