// hooks/useDonationHooks.ts
"use client"

import { useState, useEffect, useCallback } from 'react'

export interface CartItem {
  productId: number
  campaignId: number
  campaignTitle: string
  name: string
  price: number
  quantity: number
  unit?: string
  image?: string
  maxQty?: number
  stock?: number
  description?: string
}

export interface DonationFormData {
  // Personal Information
  donorName?: string
  donorCountry: string
  mobileNumber: string
  customMessage?: string
  donationPurpose?: string
  specialInstructions?: string
  donatedOnBehalfOf?: string
  donorMessage?: string
  isPublic: boolean
  isAnonymous: boolean
  
  // Custom donation amount (for direct donations)
  customAmount?: number
  
  // Tip amount
  tipAmount: number
  tipPercentage?: number
  
  // Image
  customImage?: File
}

const CART_STORAGE_KEY = 'donationCart'
const FORM_DATA_STORAGE_KEY = 'donationFormData'

// Cart management functions
const getCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY)
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    console.error('Error reading cart from localStorage:', error)
    return []
  }
}

const saveCartToStorage = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

const getFormDataFromStorage = (): Partial<DonationFormData> => {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(FORM_DATA_STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Error reading form data from localStorage:', error)
    return {}
  }
}

const saveFormDataToStorage = (formData: Partial<DonationFormData>) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(formData))
  } catch (error) {
    console.error('Error saving form data to localStorage:', error)
  }
}

export const useDonationCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    setCartItems(getCartFromStorage())

    // Listen for cart updates from other components
    const handleCartUpdate = (event: CustomEvent) => {
      setCartItems(event.detail)
    }

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener)
    }
  }, [])

  // Add item to cart
  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    const cart = getCartFromStorage()
    const existingIndex = cart.findIndex(
      cartItem => cartItem.productId === item.productId && cartItem.campaignId === item.campaignId
    )
    
    if (existingIndex > -1) {
      const maxQty = item.maxQty || item.stock || 999
      if (cart[existingIndex].quantity < maxQty) {
        cart[existingIndex].quantity += 1
      }
    } else {
      cart.push({ ...item, quantity: 1 })
    }
    
    saveCartToStorage(cart)
    setCartItems(cart)
    return cart
  }, [])

  // Remove item from cart
  const removeFromCart = useCallback((productId: number, campaignId: number) => {
    const cart = getCartFromStorage()
    const existingIndex = cart.findIndex(
      cartItem => cartItem.productId === productId && cartItem.campaignId === campaignId
    )
    
    if (existingIndex > -1) {
      if (cart[existingIndex].quantity > 1) {
        cart[existingIndex].quantity -= 1
      } else {
        cart.splice(existingIndex, 1)
      }
    }
    
    saveCartToStorage(cart)
    setCartItems(cart)
    return cart
  }, [])

  // Update item quantity
  const updateQuantity = useCallback((productId: number, campaignId: number, newQuantity: number) => {
    const cart = getCartFromStorage()
    const existingIndex = cart.findIndex(
      cartItem => cartItem.productId === productId && cartItem.campaignId === campaignId
    )
    
    if (existingIndex > -1) {
      if (newQuantity <= 0) {
        cart.splice(existingIndex, 1)
      } else {
        const maxQty = cart[existingIndex].maxQty || cart[existingIndex].stock || 999
        cart[existingIndex].quantity = Math.min(newQuantity, maxQty)
      }
    }
    
    saveCartToStorage(cart)
    setCartItems(cart)
    return cart
  }, [])

  // Clear entire cart
  const clearCart = useCallback(() => {
    saveCartToStorage([])
    setCartItems([])
  }, [])

  // Clear cart for specific campaign
  const clearCampaignCart = useCallback((campaignId: number) => {
    const cart = getCartFromStorage()
    const filteredCart = cart.filter(item => item.campaignId !== campaignId)
    saveCartToStorage(filteredCart)
    setCartItems(filteredCart)
    return filteredCart
  }, [])

  // Get item quantity
  const getItemQuantity = useCallback((productId: number, campaignId: number): number => {
    const item = cartItems.find(
      cartItem => cartItem.productId === productId && cartItem.campaignId === campaignId
    )
    return item ? item.quantity : 0
  }, [cartItems])

  // Get cart totals
  const getCartTotals = useCallback(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const uniqueCampaigns = new Set(cartItems.map(item => item.campaignId)).size
    
    return {
      subtotal,
      totalItems,
      uniqueCampaigns,
      itemCount: cartItems.length
    }
  }, [cartItems])

  // Get items by campaign
  const getItemsByCampaign = useCallback(() => {
    return cartItems.reduce((acc, item) => {
      if (!acc[item.campaignId]) {
        acc[item.campaignId] = {
          campaignTitle: item.campaignTitle,
          items: []
        }
      }
      acc[item.campaignId].items.push(item)
      return acc
    }, {} as Record<number, { campaignTitle: string; items: CartItem[] }>)
  }, [cartItems])

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearCampaignCart,
    getItemQuantity,
    getCartTotals,
    getItemsByCampaign
  }
}

export const useDonationForm = () => {
  const [formData, setFormData] = useState<Partial<DonationFormData>>({})

  // Load form data from localStorage on mount
  useEffect(() => {
    setFormData(getFormDataFromStorage())
  }, [])

  // Update form data
  const updateFormData = useCallback((newData: Partial<DonationFormData>) => {
    const updatedData = { ...formData, ...newData }
    setFormData(updatedData)
    saveFormDataToStorage(updatedData)
  }, [formData])

  // Clear form data
  const clearFormData = useCallback(() => {
    setFormData({})
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FORM_DATA_STORAGE_KEY)
    }
  }, [])

  // Get tip amount calculation
  const getTipAmount = useCallback((subtotal: number) => {
    if (formData.tipAmount) return formData.tipAmount
    if (formData.tipPercentage) return Math.floor(subtotal * (formData.tipPercentage / 100))
    return 0
  }, [formData.tipAmount, formData.tipPercentage])

  return {
    formData,
    updateFormData,
    clearFormData,
    getTipAmount
  }
}

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Create payment order
  const createPaymentOrder = useCallback(async (donationData: {
    cartItems: CartItem[]
    formData: DonationFormData
    totalAmount: number
    donationAmount: number
    tipAmount: number
  }) => {
    setIsProcessing(true)
    setPaymentError(null)

    try {
      const response = await fetch('/api/donations/create-payment-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment order')
      }

      const result = await response.json()
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment creation failed'
      setPaymentError(errorMessage)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Process payment success
  const processPaymentSuccess = useCallback(async (paymentData: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => {
    setIsProcessing(true)
    setPaymentError(null)

    try {
      const response = await fetch('/api/donations/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error('Failed to process payment')
      }

      const result = await response.json()
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed'
      setPaymentError(errorMessage)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    isProcessing,
    paymentError,
    createPaymentOrder,
    processPaymentSuccess
  }
}

// Combined hook for complete donation flow
export const useDonation = () => {
  const cart = useDonationCart()
  const form = useDonationForm()
  const payment = usePayment()

  return {
    ...cart,
    ...form,
    ...payment
  }
}