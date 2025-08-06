"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRight, Trash2, Plus, Minus, Gift, ShoppingCart, CreditCard, Shield, CheckCircle, Wallet } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useMemo } from "react"
import { ContactSection } from "@/components/shared/contact-section"
import { Footer } from "@/components/shared/footer"
import { cartItems } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


// Define tip options
const tipPercentages = [5, 10, 15];

export default function CartPage() {
  const [items, setItems] = useState(cartItems);
  const [selectedTip, setSelectedTip] = useState<number | 'custom' | null>(null);
  const [customTipValue, setCustomTipValue] = useState("");
  const [tipType, setTipType] = useState<'percentage' | 'rupees'>('percentage');

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      setItems(items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
    }
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}

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
                Browse Causes
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Cart Items - Mobile First, Full Width */}
            <div className="order-1 lg:order-1 lg:col-span-2 space-y-4 sm:space-y-6">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
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
                          alt={item.title}
                          width={100}
                          height={100}
                          className="w-full sm:w-24 md:w-28 lg:w-32 h-24 sm:h-24 md:h-28 lg:h-32 object-cover rounded-lg shadow-md"
                        />
                      </div>

                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-2">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">{item.title}</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                            <div className="bg-green-50 px-2 sm:px-3 py-1 rounded-full inline-block">
                              <span className="text-xs sm:text-sm font-medium text-green-700">Impact: {item.impact}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
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
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="cursor-pointer h-8 w-8 p-0"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <span className="font-semibold text-base sm:text-lg w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="cursor-pointer h-8 w-8 p-0"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                          <div className="text-center sm:text-right">
                            <div className="text-xs sm:text-sm text-gray-600">₹{item.price} each</div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
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

                    <div className="flex justify-between text-green-600 text-sm sm:text-base">
                      <span className="text-gray-600">Tip</span>
                      <span className="font-semibold">+₹{getTipAmount.toLocaleString()}</span>
                    </div>

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
                        <li>• Supports {items.reduce((sum, item) => sum + item.quantity, 0) * 2} families</li>
                        <li>• Provides meals for {items.reduce((sum, item) => sum + item.quantity, 0) * 14} days</li>
                        <li>• Includes medical aid and warm clothing</li>
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