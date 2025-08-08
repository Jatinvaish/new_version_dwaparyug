"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Heart,
  ArrowRight,
  Gift,
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ShoppingBag,
  X,
  Package,
  Zap
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDonationCart, useDonationForm } from "@/hooks/useDonationHooks"

export default function CartPage() {
  const router = useRouter()
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotals, 
    getItemsByCampaign 
  } = useDonationCart()
  
  const { updateFormData } = useDonationForm()
  
  const [customDonationAmount, setCustomDonationAmount] = useState("")
  const [selectedTip, setSelectedTip] = useState<number | 'custom' | null>(5)
  const [customTipValue, setCustomTipValue] = useState("")
  const [isClearing, setIsClearing] = useState(false)

  // Load custom donation amount from localStorage if set from cause detail page
  useEffect(() => {
    const savedAmount = localStorage.getItem('customDonationAmount')
    if (savedAmount) {
      setCustomDonationAmount(savedAmount)
      localStorage.removeItem('customDonationAmount') // Clear after use
    }
  }, [])

  const { subtotal, totalItems, uniqueCampaigns } = getCartTotals()
  const customAmount = parseFloat(customDonationAmount) || 0
  const totalDonationAmount = subtotal + customAmount

  // Calculate tip amount
  const getTipAmount = () => {
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
  }

  const tipAmount = getTipAmount()
  const grandTotal = totalDonationAmount + tipAmount

  const handleQuantityChange = (productId: number, campaignId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId, campaignId)
    } else {
      updateQuantity(productId, campaignId, newQuantity)
    }
  }

  const handleRemoveItem = (productId: number, campaignId: number) => {
    removeFromCart(productId, campaignId)
  }

  const handleClearCart = async () => {
    setIsClearing(true)
    await new Promise(resolve => setTimeout(resolve, 300)) // Small delay for UX
    clearCart()
    setCustomDonationAmount("")
    setSelectedTip(5)
    setCustomTipValue("")
    setIsClearing(false)
  }

  const handleProceedToDonate = () => {
    // Save cart data and custom amount to form data
    updateFormData({
      customAmount: customAmount > 0 ? customAmount : undefined,
      tipAmount: tipAmount,
      tipPercentage: typeof selectedTip === 'number' ? selectedTip : undefined
    })
    
    // Navigate to multi-step donation form
    router.push('/donate')
  }

  const itemsByCampaign = getItemsByCampaign()

  if (totalItems === 0 && customAmount === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-3 sm:px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Cart</h1>
            <p className="text-gray-600">Items you've selected for donation</p>
          </div>

          {/* Empty Cart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="mb-6">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600">Add some products or make a direct donation to get started.</p>
            </div>
            
            <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center">
              <Link href="/causes">
                <Button className="w-full sm:w-auto">
                  Browse Campaigns
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => router.push('/donate')}
                className="w-full sm:w-auto"
              >
                <Heart className="w-4 h-4 mr-2" />
                Make Direct Donation
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Donation Cart</h1>
          <p className="text-gray-600">
            Review your items and proceed to make a difference
          </p>
          
          {/* Cart Summary Pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {totalItems} Products
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {uniqueCampaigns} Campaign{uniqueCampaigns !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              ₹{grandTotal.toLocaleString()} Total
            </Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Direct Donation Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-red-500" />
                      Direct Donation
                    </div>
                    {customAmount > 0 && (
                      <Badge className="bg-red-50 text-red-700">
                        ₹{customAmount.toLocaleString()}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Make a direct donation to support campaigns of your choice. This amount will be distributed across active campaigns.
                    </p>
                    
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-3 text-gray-500">₹</span>
                        <Input
                          type="number"
                          placeholder="Enter donation amount"
                          value={customDonationAmount}
                          onChange={(e) => setCustomDonationAmount(e.target.value)}
                          className="pl-8"
                          min="1"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setCustomDonationAmount("")}
                        disabled={!customDonationAmount}
                      >
                        Clear
                      </Button>
                    </div>
                    
                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[500, 1000, 2500, 5000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setCustomDonationAmount(amount.toString())}
                          className={`text-xs ${customDonationAmount === amount.toString() ? 'border-blue-500 bg-blue-50' : ''}`}
                        >
                          ₹{amount.toLocaleString()}
                        </Button>
                      ))}
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
                            Direct donation of ₹{customAmount.toLocaleString()} added
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Product Items by Campaign */}
            <AnimatePresence>
              {Object.entries(itemsByCampaign).map(([campaignId, campaign], index) => (
                <motion.div
                  key={campaignId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 mr-2 text-blue-500" />
                          <div>
                            <h3 className="font-semibold">{campaign.campaignTitle}</h3>
                            <p className="text-sm text-gray-500 font-normal">
                              {campaign.items.length} item{campaign.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          ₹{campaign.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {campaign.items.map((item) => (
                        <motion.div
                          key={`${item.productId}-${item.campaignId}`}
                          layout
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-grow min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                            <p className="text-sm text-gray-500">
                              ₹{item.price.toLocaleString()}{item.unit && ` per ${item.unit}`}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-400 truncate mt-1">
                                {item.description}
                              </p>
                            )}
                            
                            {/* Stock Warning */}
                            {item.stock && item.quantity >= item.stock * 0.8 && (
                              <div className="flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 text-orange-500 mr-1" />
                                <span className="text-xs text-orange-600">
                                  Only {item.stock - item.quantity} left
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.campaignId, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1
                                handleQuantityChange(item.productId, item.campaignId, newQuantity)
                              }}
                              className="w-16 h-8 text-center text-sm"
                              min="1"
                              max={item.maxQty || item.stock || 999}
                            />
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.campaignId, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                              //@ts-ignore
                              disabled={
                                (item.maxQty && item.quantity >= item.maxQty) ||
                                (item.stock && item.quantity >= item.stock)
                              }
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right min-w-0">
                            <p className="font-semibold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId, item.campaignId)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Clear Cart Button */}
            {(totalItems > 0 || customAmount > 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  disabled={isClearing}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isClearing ? 'Clearing...' : 'Clear Cart'}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Donation Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Donation Breakdown */}
                  <div className="space-y-3">
                    {subtotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Products Total</span>
                        <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {customAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Direct Donation</span>
                        <span className="font-medium">₹{customAmount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {totalDonationAmount > 0 && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="font-medium">Subtotal</span>
                          <span className="font-medium">₹{totalDonationAmount.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tip Section */}
                  {totalDonationAmount > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Add a tip?</span>
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      </div>
                      
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
                      
                      {/* Clear Tip Button */}
                      {(selectedTip !== null || customTipValue) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTip(null)
                            setCustomTipValue("")
                          }}
                          className="w-full text-xs text-gray-500"
                        >
                          No tip
                        </Button>
                      )}
                      
                      {/* Tip Amount Display */}
                      {tipAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tip Amount</span>
                          <span className="font-medium text-green-600">₹{tipAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Final Total */}
                  {grandTotal > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-xl font-bold text-green-600">
                          ₹{grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Impact Preview */}
                  {totalDonationAmount > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-blue-700">
                          Estimated Impact
                        </span>
                      </div>
                      <p className="text-sm text-blue-600">
                        Your donation could help approximately{' '}
                        <span className="font-semibold">
                          {Math.floor(totalDonationAmount / 100)} people
                        </span>{' '}
                        in need
                      </p>
                    </div>
                  )}

                  {/* Proceed Button */}
                  <Button
                    onClick={handleProceedToDonate}
                    disabled={grandTotal <= 0}
                    className="w-full h-12 text-base font-medium"
                    size="lg"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Proceed to Donate
                    {grandTotal > 0 && (
                      <span className="ml-2">₹{grandTotal.toLocaleString()}</span>
                    )}
                  </Button>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
                    <Zap className="w-3 h-3 mr-1" />
                    Secured by Razorpay
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
