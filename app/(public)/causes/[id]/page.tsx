"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  TrendingUp,
  Shield,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play,
  ExternalLink,
  Target,
  Clock,
  AlertCircle,
  Star,
  ShoppingCart,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Head from "next/head"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDonationCart } from "@/hooks/useDonationHooks"

// Updated interfaces to match your requirements
interface Campaign {
  id: number
  title: string
  category_id: number
  category_name: string
  festival_type?: string
  overview: string
  details: string
  about_campaign?: string
  donation_goal: number
  total_raised: number
  total_progress_percentage: number
  image: string
  images_array?: string[]
  status: string
  priority: string
  urgency?: string
  location: string
  organizer: string
  verified: boolean
  beneficiaries: number
  total_donors_till_now: number
  start_date: string
  end_date: string
  created_by?: number
  updated_by?: number
  created_at: string
  updated_at: string
  created_by_name?: string
  updated_by_name?: string
  assignedProducts?: CampaignProduct[]
  faq_questions?: FAQ[]
  videoLinks?: string[]
}

interface CampaignProduct {
  id: number
  campaign_id: number
  indipendent_product_id: number
  description?: string
  price: number
  stock: number
  sequence: number
  name?: string
  unit?: string
  image?: string
  min_qty?: number
  max_qty?: number
  increment_count?: number
}

interface FAQ {
  question: string
  answer: string
}

export default function CauseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { cartItems, addToCart, removeFromCart, getItemQuantity, getCartTotals } = useDonationCart()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)

  // Fetch campaign data from API
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)

        const response = await fetch(`/api/campaigns/${params.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const campaignData = await response.json()
        setCampaign(campaignData)
      } catch (error) {
        console.error('Error fetching campaign:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCampaign()
    }
  }, [params.id])

  // Share functionality
  const shareData = campaign ? {
    title: `Help Support: ${campaign.title}`,
    text: `${campaign.overview} - ${campaign.details}. Goal: ₹${campaign.donation_goal.toLocaleString()}, Raised: ₹${campaign.total_raised?.toLocaleString()}. Joined: ${campaign.total_donors_till_now} donors in making a difference!`,
    url: typeof window !== 'undefined' ? window.location.href : '',
  } : null

  const handleShare = async () => {
    if (!shareData) return

    // Try native Web Share API first (mobile devices)
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 3000)
        return
      } catch (error) {
        console.log('Native share failed, falling back to custom options')
      }
    }

    // Fall back to custom share options
    setShowShareOptions(!showShareOptions)
  }

  const shareToSocial = (platform: string) => {
    if (!shareData) return

    const encodedUrl = encodeURIComponent(shareData.url)
    const encodedTitle = encodeURIComponent(shareData.title)
    const encodedText = encodeURIComponent(shareData.text)

    let shareUrl = ''

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`
        break
      default:
        return
    }

    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShowShareOptions(false)
  }

  const copyToClipboard = async () => {
    if (!shareData) return

    try {
      await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 3000)
      setShowShareOptions(false)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  // SEO Meta Data
  const metaData = campaign ? {
    title: `${campaign.title} | Donate Now - Make a Difference`,
    description: `${campaign.overview} ${campaign.details} Help us reach our goal of ₹${campaign.donation_goal.toLocaleString()}. ${campaign.total_donors_till_now} people have already donated ₹${campaign.total_raised?.toLocaleString()}.`,
    keywords: `donation, charity, ${campaign.category_name}, ${campaign.location}, help, support, fundraising, ${campaign.organizer}, relief, humanitarian aid`,
    ogTitle: `Help Support: ${campaign.title}`,
    ogDescription: `${campaign.overview} Goal: ₹${campaign.donation_goal.toLocaleString()} | Raised: ₹${campaign.total_raised?.toLocaleString()} | ${campaign.total_donors_till_now} donors`,
    ogImage: campaign.image,
    canonicalUrl: typeof window !== 'undefined' ? window.location.href : '',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "DonateAction",
      "name": campaign.title,
      "description": campaign.overview + " " + campaign.details,
      "image": campaign.image,
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "recipient": {
        "@type": "Organization",
        "name": campaign.organizer,
        "location": {
          "@type": "Place",
          "name": campaign.location
        }
      },
      "potentialAction": {
        "@type": "DonateAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": typeof window !== 'undefined' ? window.location.origin + "/donate" : '',
          "actionPlatform": ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"]
        }
      },
      "startDate": campaign.start_date,
      "endDate": campaign.end_date,
      "goal": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": campaign.donation_goal
      },
      "amount": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": campaign.total_raised
      }
    }
  } : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
          <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
          <Link href="/causes">
            <Button>Browse All Campaigns</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = (product: CampaignProduct) => {
    addToCart({
      productId: product.id,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      name: product.name || `Product ${product.id}`,
      price: product.price,
      unit: product.unit,
      image: product.image,
      maxQty: product.max_qty || product.stock,
      stock: product.stock,
      description: product.description
    })
  }

  const handleRemoveFromCart = (productId: number) => {
    removeFromCart(productId, campaign.id)
  }

  const redirectToDonate = () => {
    router.push('/donate')
  }

  const redirectToCart = () => {
    router.push('/cart')
  }

  const nextImage = () => {
    const images = [campaign.image, ...(campaign.images_array || [])].filter((img): img is string => !!img)
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    const images = [campaign.image, ...(campaign.images_array || [])].filter((img): img is string => !!img)
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const daysLeft = Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const renderMarkdownContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">{line.slice(2)}</h1>
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-gray-900 mb-3 mt-5">{line.slice(3)}</h2>
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold text-gray-900 mb-2 mt-4">{line.slice(4)}</h3>
      }

      if (line.includes('**') && line.trim() !== '') {
        const parts = line.split('**')
        return (
          <p key={index} className="mb-2 text-gray-600">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part)}
          </p>
        )
      }

      if (line.startsWith('- ')) {
        return <li key={index} className="mb-1 text-gray-600 ml-4 list-disc">{line.slice(2)}</li>
      }

      if (line.trim() === '---') {
        return <hr key={index} className="my-6 border-gray-200" />
      }

      if (line.trim() === '') {
        return <div key={index} className="mb-2" />
      }

      if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
        return <p key={index} className="mb-2 text-gray-500 italic text-sm">{line.slice(1, -1)}</p>
      }

      return <p key={index} className="mb-3 text-gray-600 leading-relaxed">{line}</p>
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertCircle className="w-3 h-3" />
      case 'high': return <TrendingUp className="w-3 h-3" />
      case 'medium': return <Clock className="w-3 h-3" />
      case 'low': return <CheckCircle className="w-3 h-3" />
      default: return <Target className="w-3 h-3" />
    }
  }

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const allImages = [campaign.image, ...(campaign.images_array || [])].filter((img): img is string => !!img)
  const { totalItems, subtotal } = getCartTotals()

  return (
    <>
      {/* SEO Head */}
      {metaData && (
        <Head>
          <title>{metaData.title}</title>
          <meta name="description" content={metaData.description} />
          <meta name="keywords" content={metaData.keywords} />
          <meta name="author" content={campaign.organizer} />
          <meta name="robots" content="index, follow, max-image-preview:large" />
          <link rel="canonical" href={metaData.canonicalUrl} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content={metaData.canonicalUrl} />
          <meta property="og:title" content={metaData.ogTitle} />
          <meta property="og:description" content={metaData.ogDescription} />
          <meta property="og:image" content={metaData.ogImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={campaign.title} />
          <meta property="og:site_name" content="Your Charity Platform" />
          <meta property="og:locale" content="en_US" />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={metaData.canonicalUrl} />
          <meta property="twitter:title" content={metaData.ogTitle} />
          <meta property="twitter:description" content={metaData.ogDescription} />
          <meta property="twitter:image" content={metaData.ogImage} />
          <meta property="twitter:image:alt" content={campaign.title} />

          {/* Additional SEO */}
          <meta name="geo.region" content="IN" />
          <meta name="geo.placename" content={campaign.location} />
          <meta name="theme-color" content="#3B82F6" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="format-detection" content="telephone=no" />

          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(metaData.jsonLd) }}
          />
        </Head>
      )}

      <div className="min-h-screen bg-white">
        {/* Hero Section - Mobile First */}
        <section className="py-4 px-3 bg-gradient-to-br from-gray-50 to-white sm:py-6 sm:px-4 lg:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 sm:mb-6 lg:mb-8"
            >
              <nav className="flex items-center space-x-1 text-xs text-gray-600 mb-3 sm:space-x-2 sm:text-sm sm:mb-4 lg:mb-6">
                <Link href="/" className="hover:text-blue-600 cursor-pointer truncate transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/causes" className="hover:text-blue-600 cursor-pointer truncate transition-colors">
                  Campaigns
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium truncate">{campaign.category_name}</span>
                <span>/</span>
                <span className="text-gray-900 font-medium truncate">{campaign.title.slice(0, 30)}...</span>
              </nav>
            </motion.div>

            {/* Mobile-First Layout */}
            <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0 xl:gap-12">
              {/* Main Content - Mobile First, Desktop Second Column */}
              <div className="order-1 lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Image Gallery - Mobile Optimized */}
                  <div className="relative">
                    <div className="relative h-48 rounded-lg overflow-hidden shadow-lg sm:h-64 md:h-80 lg:h-96 lg:rounded-2xl lg:shadow-xl">
                      <Image
                        src={allImages[currentImageIndex] || "/placeholder.svg"}
                        alt={campaign.title}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover"
                        priority
                      />

                      {/* Navigation Arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors touch-manipulation sm:left-4"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors touch-manipulation sm:right-4"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </>
                      )}

                      {/* Image Indicators */}
                      {allImages.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:bottom-4 sm:space-x-2">
                          {allImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors touch-manipulation ${index === currentImageIndex ? "bg-white" : "bg-white/50"
                                }`}
                              aria-label={`Go to image ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 sm:top-4 sm:left-4 sm:gap-2 lg:top-6 lg:left-6 lg:gap-3">
                      <Badge className="bg-blue-500 text-white font-semibold text-xs sm:text-sm">
                        {campaign.category_name}
                      </Badge>
                      <Badge className={`font-semibold text-xs sm:text-sm flex items-center gap-1 ${getPriorityColor(campaign.priority)}`}>
                        {getPriorityIcon(campaign.priority)}
                        {campaign.priority.toUpperCase()}
                      </Badge>
                      {campaign.verified && (
                        <Badge className="bg-green-500 text-white font-semibold text-xs sm:text-sm">
                          <CheckCircle className="w-2 h-2 mr-1 sm:w-3 sm:h-3" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {allImages.length > 1 && (
                      <div className="flex space-x-2 mt-3 overflow-x-auto pb-2 sm:mt-4 scrollbar-hide">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-colors touch-manipulation sm:w-20 sm:h-16 sm:rounded-lg ${index === currentImageIndex ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Gallery image ${index + 1}`}
                              width={80}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight sm:text-3xl md:text-4xl lg:text-5xl sm:mb-4">
                        {campaign.title}
                      </h1>
                      <p className="text-base text-gray-600 leading-relaxed mb-2 sm:text-lg lg:text-xl">
                        {campaign.overview}
                      </p>
                      <p className="text-sm text-gray-500 sm:text-base">
                        {campaign.details}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 py-4 border-y border-gray-200 sm:grid-cols-4 sm:gap-4 sm:py-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600 sm:text-xl lg:text-2xl">
                          ₹{campaign.total_raised?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 sm:text-sm">Raised</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600 sm:text-xl lg:text-2xl">
                          {campaign.total_donors_till_now?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 sm:text-sm">Donors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600 sm:text-xl lg:text-2xl">
                          {campaign.beneficiaries?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 sm:text-sm">Beneficiaries</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold sm:text-xl lg:text-2xl ${daysLeft > 30 ? 'text-gray-900' : daysLeft > 7 ? 'text-orange-600' : 'text-red-600'}`}>
                          {daysLeft > 0 ? daysLeft : 0}
                        </div>
                        <div className="text-xs text-gray-600 sm:text-sm">Days Left</div>
                      </div>
                    </div>

                    {/* About Campaign */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 sm:text-2xl sm:mb-4">
                        About This Campaign
                      </h2>
                      <div className="prose prose-sm max-w-none sm:prose-base lg:prose-lg">
                        {campaign && campaign?.about_campaign ? (renderMarkdownContent(campaign?.about_campaign)) : null}
                      </div>
                    </div>

                    {/* Video Links Section */}
                    {campaign.videoLinks && campaign.videoLinks.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 sm:text-2xl sm:mb-4">
                          Campaign Videos
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                          {campaign.videoLinks.map((videoUrl, index) => {
                            const videoId = getYouTubeVideoId(videoUrl)
                            return (
                              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                                {videoId ? (
                                  <div className="relative aspect-video">
                                    <Image
                                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                      alt={`Campaign Video ${index + 1}`}
                                      width={400}
                                      height={225}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                      <Button
                                        variant="secondary"
                                        size="lg"
                                        className="bg-white/90 hover:bg-white cursor-pointer"
                                        onClick={() => window.open(videoUrl, '_blank')}
                                      >
                                        <Play className="w-5 h-5 mr-2 fill-current" />
                                        Watch Video
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <Play className="w-5 h-5 text-red-500" />
                                        <span className="text-sm font-medium">Campaign Video {index + 1}</span>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer"
                                        onClick={() => window.open(videoUrl, '_blank')}
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                )}
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* FAQ Section */}

                    {campaign.assignedProducts && campaign.assignedProducts.length > 0 && (
                      <section className="py-8 px-3 bg-gray-50 sm:py-12 sm:px-4 lg:py-16">
                        <div className="max-w-7xl mx-auto">
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-8 sm:mb-12"
                          >
                            <h2 className="text-2xl font-bold text-gray-900 mb-3 sm:text-3xl lg:text-4xl sm:mb-4">
                              Campaign{" "}
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                                Products
                              </span>
                            </h2>
                            <p className="text-base text-gray-600 max-w-3xl mx-auto sm:text-lg lg:text-xl">
                              Choose from our campaign-specific products. Each product directly contributes to this relief campaign
                              and shows exactly how your donation will be used to help families in need.
                            </p>
                          </motion.div>

                          {/* Products Grid */}
                          <div className="grid gap-4 mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 sm:mb-12">
                            {campaign.assignedProducts?.map((product, index) => (
                              <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5, scale: 1.01 }}
                                className="cursor-pointer"
                              >
                                <Card className=" h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                                  <div className="relative">
                                    <Image
                                      src={product.image || "/placeholder.svg"}
                                      alt={product.description || `Product ${product.id}`}
                                      width={300}
                                      height={200}
                                      className="w-full h-40 object-cover sm:h-48"
                                    />

                                    {product.stock !== undefined && product.stock < 10 && (
                                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                                        <Badge className="bg-red-500 text-white font-semibold text-xs sm:text-sm">
                                          Only {product.stock} left
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                  <CardContent className="p-2 sm:p-2">
                                    <h3 className="text-sm font-bold text-gray-900 mb-2  sm:mb-3 border-b-2">
                                      {product.name || `Product ${product.id}`}
                                    </h3>
                                    <span className="text-xs font-bold text-gray-900 mb-2  sm:mb-3">
                                      {product.description || `Product ${product.id}`}
                                    </span>
                                    <div className="text-xl font-bold text-blue-600 mb-2 sm:text-2xl sm:mb-3">
                                      ₹{product.price.toLocaleString()}/{product.unit || 'unit'}
                                    </div>

                                    {/* Product Impact Description */}
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mb-3 sm:mb-4">
                                      <div className="text-xs font-semibold text-gray-700 flex items-center sm:text-sm">
                                        <TrendingUp className="w-3 h-3 mr-2 text-blue-600 sm:w-4 sm:h-4" />
                                        Impact: {
                                          product.name?.includes('Food') ? 'Feeds a family for 2 weeks' :
                                            product.name?.includes('Shelter') ? 'Provides temporary housing for a family' :
                                              product.name?.includes('Medical') ? 'Covers medical treatment for 10 people' :
                                                product.name?.includes('Water') ? 'Clean water for 1 month' :
                                                  product.name?.includes('Education') ? 'School supplies for 5 children' :
                                                    'Essential supplies for families in need'
                                        }
                                      </div>
                                    </div>

                                    {getItemQuantity(product.id, campaign.id) > 0 && (
                                      <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg mb-3 sm:p-3 sm:mb-4">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleRemoveFromCart(product.id)}
                                          className="cursor-pointer p-1 sm:p-2"
                                        >
                                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Button>
                                        <span className="font-semibold text-sm sm:text-base">
                                          {getItemQuantity(product.id, campaign.id)}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleAddToCart(product)}
                                          className="cursor-pointer p-1 sm:p-2"
                                          disabled={product.stock === 0}
                                        >
                                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Button>
                                      </div>
                                    )}

                                    <div className="space-y-2 sm:space-y-3">
                                      <Button
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold cursor-pointer text-xs p-2.5 sm:text-sm sm:p-3"
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.stock === 0}
                                      >
                                        {getItemQuantity(product.id, campaign.id) > 0 ? 'ADD MORE' : 'ADD TO CART'} | ₹{product.price.toLocaleString()}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}

                    {campaign.faq_questions && campaign.faq_questions.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 sm:text-2xl sm:mb-4">
                          Frequently Asked Questions
                        </h2>
                        <div className="space-y-3">
                          {campaign.faq_questions.map((faq, index) => (
                            <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                              <button
                                onClick={() => toggleFaq(index)}
                                className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                              >
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-gray-900 pr-4 text-sm sm:text-base">{faq.question}</h3>
                                  {expandedFaq === index ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                              {expandedFaq === index && (
                                <div className="px-4 pb-4">
                                  <Separator className="mb-3" />
                                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="order-2 lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-4 lg:sticky lg:top-24 sm:space-y-6"
                >
                  {/* Progress Card */}
                  <Card className="p-4 shadow-lg sm:p-6 sm:shadow-xl">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold sm:text-lg">Progress</span>
                        <span className="text-xl font-bold text-green-600 sm:text-2xl">{campaign.total_progress_percentage}%</span>
                      </div>
                      <Progress value={campaign.total_progress_percentage} className="h-3 sm:h-4" />
                      <div className="flex justify-between text-xs text-gray-600 sm:text-sm">
                        <span>₹{campaign.total_raised?.toLocaleString()} raised</span>
                        <span>₹{campaign.donation_goal.toLocaleString()} goal</span>
                      </div>
                      <div className="text-center pt-2">
                        <p className="text-xs text-gray-500">
                          ₹{(campaign.donation_goal - (campaign.total_raised || 0)).toLocaleString()} still needed
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Quick Donate */}
                  <Card className="p-4 shadow-lg sm:p-6 sm:shadow-xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 sm:text-xl sm:mb-4">Quick Donate</h3>
                    <div className="grid grid-cols-2 gap-2 mb-4 sm:gap-3">
                      {[500, 1000, 2500, 5000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 bg-transparent text-sm p-2 transition-colors sm:text-base sm:p-3"
                          onClick={() => {
                            // Set custom amount in localStorage and redirect
                            localStorage.setItem('customDonationAmount', amount.toString())
                            redirectToDonate()
                          }}
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold cursor-pointer text-sm p-3 sm:text-base"
                      onClick={redirectToDonate}
                    >
                      <Heart className="w-3 h-3 mr-2 sm:w-4 sm:h-4" />
                      Donate Now
                    </Button>
                  </Card>

                  {/* Campaign Info */}
                  <Card className="p-4 shadow-lg sm:p-6 sm:shadow-xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 sm:text-xl sm:mb-4">Campaign Details</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{campaign.location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span>Ends {new Date(campaign.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span>{campaign.beneficiaries?.toLocaleString()} people will benefit</span>
                      </div>
                      <div className="flex items-start text-sm">
                        <Shield className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                        <span className="break-words">Organized by {campaign.organizer}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Target className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span>Priority: <span className="font-medium capitalize">{campaign.priority}</span></span>
                      </div>
                      <div className="flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span>Status: <span className={`font-medium ${campaign.status === 'Active' ? 'text-green-600' : 'text-gray-600'}`}>{campaign.status}</span></span>
                      </div>
                    </div>
                  </Card>

                  {/* Enhanced Share Card */}
                  <Card className="p-4 shadow-lg sm:p-6 sm:shadow-xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 sm:text-xl sm:mb-4">Share This Campaign</h3>

                    {/* Success Message */}
                    {shareSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-3 p-2 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Shared successfully!
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer bg-transparent text-sm p-3 sm:text-base hover:bg-blue-50"
                        onClick={handleShare}
                      >
                        <Share2 className="w-3 h-3 mr-2 sm:w-4 sm:h-4" />
                        Share Campaign
                      </Button>

                      {/* Share Options */}
                      {showShareOptions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer hover:bg-blue-500 hover:text-white"
                              onClick={() => shareToSocial('facebook')}
                            >
                              <Facebook className="w-3 h-3 mr-1" />
                              Facebook
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer hover:bg-blue-400 hover:text-white"
                              onClick={() => shareToSocial('twitter')}
                            >
                              <Twitter className="w-3 h-3 mr-1" />
                              Twitter
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer hover:bg-blue-600 hover:text-white"
                              onClick={() => shareToSocial('linkedin')}
                            >
                              <Linkedin className="w-3 h-3 mr-1" />
                              LinkedIn
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer hover:bg-green-500 hover:text-white"
                              onClick={() => shareToSocial('whatsapp')}
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              WhatsApp
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full cursor-pointer hover:bg-gray-600 hover:text-white"
                            onClick={copyToClipboard}
                          >
                            <Copy className="w-3 h-3 mr-2" />
                            Copy Link
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Cart Button */}
        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto"
          >
            <Card className="p-3 shadow-2xl bg-white border-2 border-blue-400 sm:p-4">
              <div className="flex items-center justify-between space-x-3 sm:space-x-4">
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">
                    {totalItems} items in cart
                  </div>
                  <div className="text-base font-bold text-green-600 sm:text-lg">
                    Total: ₹{subtotal.toLocaleString()}
                  </div>
                </div>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold cursor-pointer text-sm p-2 sm:text-base sm:p-3"
                  onClick={redirectToCart}
                >
                  <ShoppingCart className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
                  View Cart
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </>
  )
}