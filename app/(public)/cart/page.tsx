"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRight, Trash2, Plus, Minus, Gift, ShoppingCart, CreditCard, Shield, CheckCircle, Wallet } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useMemo, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Cart item interface to match the localStorage structure
interface CartItem {
  productId: number
  campaignId: number
  name: string
  price: number
  quantity: number
  unit?: string
  image?: string
  maxQty?: number
  description?: string
  impact?: string
  campaignTitle?: string
}

// Define tip options
const tipPercentages = [5, 10, 15];

// Cart management functions
const getCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const cart = localStorage.getItem('donationCart')
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    console.error('Error reading cart from localStorage:', error)
    return []
  }
}

const saveCartToStorage = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('donationCart', JSON.stringify(cart))
    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

const updateCartItemQuantity = (productId: number, campaignId: number, newQuantity: number) => {
  const cart = getCartFromStorage()
  const updatedCart = cart.map(item => {
    if (item.productId === productId && item.campaignId === campaignId) {
      const maxQty = item.maxQty || 999
      return { ...item, quantity: Math.min(Math.max(1, newQuantity), maxQty) }
    }
    return item
  }).filter(item => item.quantity > 0)
  
  saveCartToStorage(updatedCart)
  return updatedCart
}

const removeCartItem = (productId: number, campaignId: number) => {
  const cart = getCartFromStorage()
  const updatedCart = cart.filter(item => 
    !(item.productId === productId && item.campaignId === campaignId)
  )
  saveCartToStorage(updatedCart)
  return updatedCart
}

const clearCart = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('donationCart')
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }))
  }
}

// Function to get impact description based on product name
const getProductImpact = (name: string, quantity: number): string => {
  if (name.toLowerCase().includes('food')) {
    return `Feeds ${quantity} ${quantity === 1 ? 'family' : 'families'} for 2 weeks`
  } else if (name.toLowerCase().includes('shelter')) {
    return `Provides temporary housing for ${quantity} ${quantity === 1 ? 'family' : 'families'}`
  } else if (name.toLowerCase().includes('medical')) {
    return `Covers medical treatment for ${quantity * 10} people`
  } else if (name.toLowerCase().includes('water')) {
    return `Clean water for ${quantity} ${quantity === 1 ? 'family' : 'families'} for 1 month`
  } else if (name.toLowerCase().includes('education')) {
    return `School supplies for ${quantity * 5} children`
  } else {
    return `Essential supplies for ${quantity} ${quantity === 1 ? 'family' : 'families'} in need`
  }
}

export default function ProcessTodonationPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedTip, setSelectedTip] = useState<number | 'custom' | null>(5);
  const [customTipValue, setCustomTipValue] = useState("");
  const [tipType, setTipType] = useState<'percentage' | 'rupees'>('percentage');
  const [loading, setLoading] = useState(true);

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const cartItems = getCartFromStorage()
    setItems(cartItems)
    setLoading(false)
  }, [])

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      setItems(event.detail)
    }

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener)
    }
  }, [])

  const updateQuantity = (productId: number, campaignId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      const updatedCart = removeCartItem(productId, campaignId)
      setItems(updatedCart)
    } else {
      const updatedCart = updateCartItemQuantity(productId, campaignId, newQuantity)
      setItems(updatedCart)
    }
  };

  const removeItem = (productId: number, campaignId: number) => {
    const updatedCart = removeCartItem(productId, campaignId)
    setItems(updatedCart)
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTipAmount = useMemo(() => {
    const subtotal = getSubtotal();
    let tipValue = 0;

    if (selectedTip === 'custom' && customTipValue) {
      const value = parseFloat(customTipValue);
      if (!isNaN(value) && value > 0) {
        if (tipType === 'percentage') {
          // Cap percentage at 100%
          const percentage = Math.min(value, 100);
          tipValue = subtotal * (percentage / 100);
        } else {
          // Cap fixed rupee amount at subtotal
          tipValue = Math.min(value, subtotal);
        }
      }
    } else if (typeof selectedTip === 'number') {
      tipValue = subtotal * (selectedTip / 100);
    }
    
    return Math.floor(tipValue);
  }, [getSubtotal, selectedTip, customTipValue, tipType]);

  const handleCustomTipChange = (value: string) => {
    const subtotal = getSubtotal();
    let parsedValue = parseFloat(value);
    
    if (isNaN(parsedValue)) {
      setCustomTipValue("");
      return;
    }
    
    if (tipType === 'percentage') {
      if (parsedValue > 100) {
        parsedValue = 100;
      }
    } else {
      if (parsedValue > subtotal) {
        parsedValue = subtotal;
      }
    }
    
    setCustomTipValue(parsedValue.toString());
    setSelectedTip('custom');
  };

  const getTotal = () => {
    return getSubtotal() + getTipAmount;
  };

  const getTotalBeneficiaries = () => {
    return items.reduce((sum, item) => {
      if (item.name.toLowerCase().includes('food')) {
        return sum + item.quantity * 1 // 1 family per food package
      } else if (item.name.toLowerCase().includes('medical')) {
        return sum + item.quantity * 10 // 10 people per medical package
      } else if (item.name.toLowerCase().includes('education')) {
        return sum + item.quantity * 5 // 5 children per education package
      }
      return sum + item.quantity * 2 // Default 2 people per package
    }, 0)
  }

  const getTotalDays = () => {
    return items.reduce((sum, item) => {
      if (item.name.toLowerCase().includes('food')) {
        return sum + item.quantity * 14 // 14 days per food package
      } else if (item.name.toLowerCase().includes('water')) {
        return sum + item.quantity * 30 // 30 days per water package
      }
      return sum + item.quantity * 7 // Default 7 days per package
    }, 0)
  }

  // Group items by campaign
  const groupedItems = useMemo(() => {
    const groups: { [campaignId: number]: CartItem[] } = {}
    items.forEach(item => {
      if (!groups[item.campaignId]) {
        groups[item.campaignId] = []
      }
      groups[item.campaignId].push(item)
    })
    return groups
  }, [items])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Your Donation Cart</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Review your selected donation packages and proceed to make a difference in lives.
          </p>
          {items.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {Object.keys(groupedItems).length} {Object.keys(groupedItems).length === 1 ? 'campaign' : 'campaigns'}
              </span>
            </div>
          )}
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 px-4">Start making a difference by selecting donation packages</p>
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 sm:px-8 py-3 rounded-full font-semibold cursor-pointer text-sm sm:text-base"
              asChild
            >
              <Link href="/causes">
                <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Browse Campaigns
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Cart Items - Mobile First, Full Width */}
            <div className="order-1 lg:order-1 lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Group items by campaign */}
              {Object.entries(groupedItems).map(([campaignId, campaignItems]) => (
                <motion.div
                  key={campaignId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  {/* Campaign Header */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Campaign #{campaignId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {campaignItems.length} {campaignItems.length === 1 ? 'item' : 'items'} in this campaign
                    </p>
                  </div>

                  {/* Campaign Items */}
                  {campaignItems.map((item, index) => (
                    <motion.div
                      key={`${item.productId}-${item.campaignId}`}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                          <div className="w-full sm:w-24 md:w-28 lg:w-32 flex-shrink-0">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={100}
                              height={100}
                              className="w-full sm:w-24 md:w-28 lg:w-32 h-24 sm:h-24 md:h-28 lg:h-32 object-cover rounded-lg shadow-md"
                            />
                          </div>

                          <div className="flex-1 w-full">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 pr-2">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">{item.name}</h3>
                                {item.unit && (
                                  <p className="text-sm text-gray-500 mb-1">Unit: {item.unit}</p>
                                )}
                                {item.description && (
                                  <p className="text-sm sm:text-base text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                                )}
                                <div className="bg-green-50 px-2 sm:px-3 py-1 rounded-full inline-block">
                                  <span className="text-xs sm:text-sm font-medium text-green-700">
                                    Impact: {getProductImpact(item.name, item.quantity)}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.productId, item.campaignId)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer p-2 flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-3 sm:space-y-0">
                              <div className="flex items-center justify-center sm:justify-start space-x-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.productId, item.campaignId, item.quantity - 1)}
                                  className="cursor-pointer h-8 w-8 p-0"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <span className="font-semibold text-base sm:text-lg w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.productId, item.campaignId, item.quantity + 1)}
                                  className="cursor-pointer h-8 w-8 p-0"
                                  disabled={item.maxQty ? item.quantity >= item.maxQty : false}
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                              <div className="text-center sm:text-right">
                                <div className="text-xs sm:text-sm text-gray-600">₹{item.price.toLocaleString()} each</div>
                                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                  ₹{(item.price * item.quantity).toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {/* Stock limit warning */}
                            {item.maxQty && item.quantity >= item.maxQty && (
                              <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                Maximum quantity reached ({item.maxQty} available)
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ))}

              {/* Tipping Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="p-4 sm:p-6 shadow-lg">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Wallet className="w-4 h-4 mr-2" /> Add a Tip
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your tip helps us continue supporting more families in need and covers platform costs.
                  </p>
                  <div className="flex space-x-2 sm:space-x-3 mb-4">
                    {tipPercentages.map((tip) => (
                      <Button
                        key={tip}
                        variant={selectedTip === tip ? "default" : "outline"}
                        className={`flex-1 ${selectedTip === tip ? 'bg-green-600 text-white hover:bg-green-700' : 'text-gray-900 hover:bg-gray-100'}`}
                        onClick={() => {
                          setSelectedTip(tip);
                          setCustomTipValue("");
                        }}
                      >
                        {tip}%
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="number"
                      placeholder={`Enter custom tip in ${tipType === 'rupees' ? '₹' : '%'}`}
                      value={customTipValue}
                      onChange={(e) => handleCustomTipChange(e.target.value)}
                      className="flex-1 text-sm sm:text-base"
                      min="0"
                      max={tipType === 'percentage' ? 100 : getSubtotal()}
                    />
                    <Select onValueChange={(value) => setTipType(value as 'percentage' | 'rupees')} defaultValue={tipType}>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Tip Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="rupees">₹</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              </motion.div>

              {/* Clear Cart Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center"
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your entire cart?')) {
                      clearCart()
                      setItems([])
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="order-2 lg:order-2 lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:sticky lg:top-24"
              >
                <Card className="p-4 sm:p-6 shadow-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Donation Summary</h3>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">₹{getSubtotal().toLocaleString()}</span>
                    </div>

                    {getTipAmount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm sm:text-base">
                        <span className="text-gray-600">Tip</span>
                        <span className="font-semibold">+₹{getTipAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="border-t pt-3 sm:pt-4">
                      <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
                        <span>Total Donation</span>
                        <span>₹{getTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Your Impact</h4>
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                        <li>• Supports {getTotalBeneficiaries()} people</li>
                        <li>• Provides aid for {getTotalDays()} days</li>
                        <li>• Spans {Object.keys(groupedItems).length} {Object.keys(groupedItems).length === 1 ? 'campaign' : 'campaigns'}</li>
                        <li>• Includes medical aid and essential supplies</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span>100% Secure Payment</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span>Tax Deductible (80G Certificate)</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span>Instant donation receipt</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 sm:py-4 text-sm sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    asChild
                  >
                    <Link href="/checkout">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
                    </Link>
                  </Button>

                  <div className="mt-3 sm:mt-4 text-center">
                    <Link href="/causes" className="text-green-600 hover:text-green-700 font-medium cursor-pointer text-sm sm:text-base">
                      ← Continue donation
                    </Link>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}