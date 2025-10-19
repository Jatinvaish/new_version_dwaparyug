"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  Upload,
  X,
  Camera,
  Package,
} from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { fileToBase64, createPreviewUrl, uploadImages } from '@/lib/helper-function'

const countries = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
]

interface ProductPersonalizationData {
  donationDate: string
  donorName: string
  donorCountry: string
  mobileNumber: string
  donatedOnBehalfOf?: string
  customImage?: string
  customMessage?: string
  donationPurpose?: string
  specialInstructions?: string
  isAnonymous: boolean
}

interface ProductPersonalizationModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: number
    campaignId: number
    campaignTitle: string
    name: string
    price: number
    unit?: string
    image?: string
    maxQty?: number
    stock?: number
    description?: string
    productId?: number
    quantity?: number
    max_tat: number   
    min_tat: number   
    personalization?: Partial<ProductPersonalizationData>
  }
  onAddToCart?: (productData: any) => void
  isEdit?: boolean
}

const CART_STORAGE_KEY = 'donationCart'

// Helper functions
const getCartFromStorage = () => {
  if (typeof window === 'undefined') return []
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY)
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    console.error('Error reading cart:', error)
    return []
  }
}

const saveCartToStorage = (cart: any[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }))
  } catch (error) {
    console.error('Error saving cart:', error)
  }
}

export default function ProductPersonalizationModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  isEdit = false
}: ProductPersonalizationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(product?.personalization?.customImage || null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<ProductPersonalizationData>({
    donationDate: new Date(Date.now() + product?.min_tat * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    donorName: product?.personalization?.donorName || '',
    donorCountry: product?.personalization?.donorCountry || 'IN',
    mobileNumber: product?.personalization?.mobileNumber || '',
    donatedOnBehalfOf: product?.personalization?.donatedOnBehalfOf || '',
    customImage: product?.personalization?.customImage,
    customMessage: product?.personalization?.customMessage || '',
    donationPurpose: product?.personalization?.donationPurpose || '',
    specialInstructions: product?.personalization?.specialInstructions || '',
    isAnonymous: product?.personalization?.isAnonymous || false
  })

  // Update form data when product changes
  useEffect(() => {
    if (product?.personalization) {
      setFormData({
        donationDate: product.personalization.donationDate || new Date().toISOString().split('T')[0],
        donorName: product.personalization.donorName || '',
        donorCountry: product.personalization.donorCountry || 'IN',
        mobileNumber: product.personalization.mobileNumber || '',
        donatedOnBehalfOf: product.personalization.donatedOnBehalfOf || '',
        customImage: product.personalization.customImage,
        customMessage: product.personalization.customMessage || '',
        donationPurpose: product.personalization.donationPurpose || '',
        specialInstructions: product.personalization.specialInstructions || '',
        isAnonymous: product.personalization.isAnonymous || false
      })
      setImagePreview(product.personalization.customImage || null)
    }
  }, [product])

  const updateFormData = (updates: Partial<ProductPersonalizationData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const base64 = await fileToBase64(file)
      const previewUrl = createPreviewUrl(file)
      setImageFile(file)
      setImagePreview(previewUrl)
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Error processing image. Please try again.')
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    updateFormData({ customImage: undefined })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.donationDate) {
      newErrors.donationDate = 'Donation date is required'
    }
    if (!formData.donorName || formData.donorName.trim() === '') {
      newErrors.donorName = 'Full name is required'
    }
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!/^[\d+\-\s()]*$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid mobile number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleSave = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      let uploadedImageUrl = formData.customImage

      // Upload image only if it's a new file
      if (imageFile) {
        const uploadedUrls = await uploadImages([imageFile])
        uploadedImageUrl = uploadedUrls[0]
      }

      const productId = product.productId || product.id
      const campaignId = product.campaignId

      // Direct localStorage manipulation
      const cart = getCartFromStorage()

      // FIX: Convert both to numbers for comparison to handle type mismatch
      const itemIndex = cart.findIndex(
        (item: any) => Number(item.productId) === Number(productId) && Number(item.campaignId) === Number(campaignId)
      )

      if (itemIndex > -1) {
        // Update existing item - keep quantity, update personalization
        cart[itemIndex] = {
          ...cart[itemIndex],
          productId: Number(productId), // Normalize to number
          campaignId: Number(campaignId), // Normalize to number
          personalization: {
            donationDate: formData.donationDate,
            donorName: formData.donorName,
            donorCountry: formData.donorCountry,
            mobileNumber: formData.mobileNumber,
            donatedOnBehalfOf: formData.donatedOnBehalfOf,
            customImage: uploadedImageUrl,
            customMessage: formData.customMessage,
            donationPurpose: formData.donationPurpose,
            specialInstructions: formData.specialInstructions,
            isAnonymous: formData.isAnonymous
          }
        }
      } else {
        // Add new item
        const cartItemWithPersonalization = {
          productId: Number(productId), // Normalize to number
          campaignId: Number(campaignId), // Normalize to number
          campaignTitle: product.campaignTitle,
          name: product.name,
          price: product.price,
          quantity: product.quantity || 1,
          unit: product.unit,
          image: product.image,
          maxQty: product.maxQty,
          stock: product.stock,
          description: product.description,
          personalization: {
            donationDate: formData.donationDate,
            donorName: formData.donorName,
            donorCountry: formData.donorCountry,
            mobileNumber: formData.mobileNumber,
            donatedOnBehalfOf: formData.donatedOnBehalfOf,
            customImage: uploadedImageUrl,
            customMessage: formData.customMessage,
            donationPurpose: formData.donationPurpose,
            specialInstructions: formData.specialInstructions,
            isAnonymous: formData.isAnonymous
          }
        }
        cart.push(cartItemWithPersonalization)
      }

      saveCartToStorage(cart)

      toast.success(isEdit ? 'Product details updated!' : 'Product added to cart successfully!')
      handleClose()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(isEdit ? 'Failed to update product details' : 'Failed to add product to cart')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      donationDate: product?.personalization?.donationDate || new Date().toISOString().split('T')[0],
      donorName: product?.personalization?.donorName || '',
      donorCountry: product?.personalization?.donorCountry || 'IN',
      mobileNumber: product?.personalization?.mobileNumber || '',
      donatedOnBehalfOf: product?.personalization?.donatedOnBehalfOf || '',
      customImage: product?.personalization?.customImage,
      customMessage: product?.personalization?.customMessage || '',
      donationPurpose: product?.personalization?.donationPurpose || '',
      specialInstructions: product?.personalization?.specialInstructions || '',
      isAnonymous: product?.personalization?.isAnonymous || false
    })
    setImagePreview(product?.personalization?.customImage || null)
    setImageFile(null)
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            {isEdit ? 'Edit Donation Details' : 'Personalize Your Donation'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update' : 'Customize'} your donation details for {product.name}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-4"
        >
          {/* Product Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.campaignTitle}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-lg font-bold text-blue-600">
                      ₹{product.price.toLocaleString()}{product.unit && ` per ${product.unit}`}
                    </p>
                    {product.quantity && (
                      <Badge variant="outline">
                        Qty: {product.quantity}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donation Date */}
          <div className="space-y-2">
            <Label htmlFor="donationDate">Donation Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="donationDate"
                type="date"
                value={formData.donationDate}
                onChange={(e) => updateFormData({ donationDate: e.target.value })}
                min={product.min_tat ? new Date(Date.now() + product.min_tat * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined}
                max={product.max_tat ? new Date(Date.now() + product.max_tat * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined}
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Select when you want this donation to be processed
            </p>
            {errors.donationDate && (
              <p className="text-red-500 text-sm">{errors.donationDate}</p>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="donorName">Full Name *</Label>
              <Input
                id="donorName"
                placeholder="Enter your full name"
                value={formData.donorName}
                onChange={(e) => updateFormData({ donorName: e.target.value })}
              />
              {errors.donorName && (
                <p className="text-red-500 text-sm mt-1">{errors.donorName}</p>
              )}
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
            </div>
          </div>

          <div>
            <Label htmlFor="mobileNumber">Mobile Number *</Label>
            <Input
              id="mobileNumber"
              placeholder="Enter your mobile number"
              value={formData.mobileNumber}
              maxLength={15}
              onChange={(e) => {
                const input = e.target.value
                if (/^[\d+\-\s()]*$/.test(input)) {
                  updateFormData({ mobileNumber: input })
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
              value={formData.donatedOnBehalfOf}
              onChange={(e) => updateFormData({ donatedOnBehalfOf: e.target.value })}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Get a photograph printed</Label>
            <p className="text-xs text-gray-600">
              Personalize your product by adding a custom image
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
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
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">Upload a custom image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Optional Messages */}
          <div>
            <Label htmlFor="customMessage">Custom Message</Label>
            <Textarea
              id="customMessage"
              placeholder="Add a personal message..."
              value={formData.customMessage}
              onChange={(e) => updateFormData({ customMessage: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="donationPurpose">Purpose of Donation</Label>
            <Input
              id="donationPurpose"
              placeholder="e.g., Birthday celebration, In memory of..."
              value={formData.donationPurpose}
              onChange={(e) => updateFormData({ donationPurpose: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Any special instructions..."
              value={formData.specialInstructions}
              onChange={(e) => updateFormData({ specialInstructions: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAnonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => updateFormData({ isAnonymous: !!checked })}
            />
            <Label htmlFor="isAnonymous">Donate anonymously</Label>
          </div>
        </motion.div>

        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                {isEdit ? 'Update Details' : 'Add to Cart'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

