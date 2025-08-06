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
  Gift,
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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ContactSection } from "@/components/shared/contact-section"
import { Footer } from "@/components/shared/footer"
import { DonationDialog } from "@/components/shared/donation-dialog"
import type { Campaign } from "@/lib/interface"

// Mock campaign data based on CampaignForm structure - this will come from API later
const getCampaignData = (id: string): Campaign => ({
  id: parseInt(id) || 1,
  title: "Emergency Relief for Flood-Affected Families in Gujarat",
  category: "Disaster Relief",
  festivalType: undefined,
  overview: "Providing immediate relief to 500+ families affected by devastating floods in rural Gujarat villages",
  details: "Comprehensive relief campaign including emergency food supplies, temporary shelter materials, medical aid packages, and long-term rehabilitation support for flood victims who have lost their homes and livelihoods",
  goal: 1500000,
  raised: 875000,
  status: "Active",
  bannerImage: "/api/placeholder/800/600",
  additionalImages: [
    "/api/placeholder/800/600",
    "/api/placeholder/400/300", 
    "/api/placeholder/400/300",
    "/api/placeholder/400/300",
    "/api/placeholder/400/300"
  ],
  assignedProducts: [
    {
      id: 1,
      name: "Family Food Kit",
      price: 2500,
      image: "/api/placeholder/200/150",
      stock: 100,
      unit: "kit"
    },
    {
      id: 2,
      name: "Emergency Shelter Package",
      price: 15000,
      image: "/api/placeholder/200/150", 
      stock: 25,
      unit: "package"
    },
    {
      id: 3,
      name: "Medical Aid Kit",
      price: 5000,
      image: "/api/placeholder/200/150",
      stock: 50,
      unit: "kit"
    },
    {
      id: 4,
      name: "Clean Water Supply Unit",
      price: 1000,
      image: "/api/placeholder/200/150",
      stock: 200,
      unit: "unit"
    },
    {
      id: 5,
      name: "Children's Education Kit",
      price: 3000,
      image: "/api/placeholder/200/150",
      stock: 75,
      unit: "kit"
    },
    {
      id: 6,
      name: "Hygiene & Sanitation Package",
      price: 1500,
      image: "/api/placeholder/200/150",
      stock: 150,
      unit: "package"
    }
  ],
  endDate: new Date("2025-12-31"),
  priority: "critical",
  aboutCampaign: `# Emergency Flood Relief Campaign

The recent devastating floods in Gujarat have left thousands of families without homes, food, or basic necessities. Our comprehensive relief campaign aims to provide immediate and long-term support to over 500 affected families across multiple villages.

## **What We're Doing:**
- **Immediate Relief**: Providing emergency food supplies, clean water, and temporary shelter materials
- **Medical Support**: Setting up mobile medical clinics and distributing essential medical supplies
- **Rehabilitation Support**: Helping families rebuild their lives, homes, and restore their livelihoods
- **Educational Continuity**: Ensuring children can continue their education with temporary learning spaces
- **Psychosocial Support**: Providing counseling and mental health support for trauma recovery

## **How Your Donation Creates Impact:**
- **₹1,000** provides clean drinking water for a family of 5 for one full month
- **₹2,500** feeds a family with nutritious meals for two weeks
- **₹5,000** covers complete medical treatment for flood-related health issues
- **₹15,000** provides comprehensive temporary shelter materials including tarpaulin, ropes, and basic furniture
- **₹25,000** helps a family completely rebuild their livelihood through small business support

## **Our Transparent Approach:**
We believe in complete transparency. Every donation is tracked, and we provide regular updates with photos, videos, and detailed reports showing exactly how your contribution is making a difference. Our team works directly with local communities to ensure maximum impact.

---

*Every contribution, no matter the size, makes a real and measurable difference in these families' lives. Together, we can help them rebuild and recover from this disaster.*`,
  faq_questions: [
    {
      question: "How will my donation be used exactly?",
      answer: "100% of donations go directly to flood relief efforts. We maintain complete transparency with detailed breakdowns: 60% for immediate relief (food, water, shelter), 25% for medical aid and healthcare, 10% for rehabilitation and livelihood restoration, and 5% for administrative costs. You'll receive regular updates showing exactly how your donation is being utilized."
    },
    {
      question: "Are donations tax-deductible?",
      answer: "Yes, we are a registered 501(c)(3) non-profit organization under Section 80G. You will receive a tax-deductible receipt immediately after your donation, which can be used for tax benefits. All donations are eligible for tax deductions as per applicable laws."
    },
    {
      question: "How do you ensure transparency and accountability?",
      answer: "We provide weekly updates with photos, videos, and detailed expense reports. All major expenditures are documented and shared with donors. We also have third-party audits and encourage donor visits to relief sites. You can track your donation's impact through our online portal."
    },
    {
      question: "Can I visit the relief sites to see the impact?",
      answer: "Absolutely! We organize regular donor visits to relief sites and welcome you to see the impact of your donation firsthand. Please contact us at least 7 days in advance to coordinate a visit. We'll provide transportation and a guided tour of all relief activities."
    },
    {
      question: "What happens if the campaign exceeds its goal?",
      answer: "If we exceed our funding goal, additional funds will be used to help more affected families in the region, extend the duration of support, or be allocated to our emergency relief fund for future disasters. We will always inform donors about how excess funds are being utilized."
    },
    {
      question: "How do you select which families receive aid?",
      answer: "We work closely with local government officials, community leaders, and social workers to identify the most vulnerable families. Priority is given to families with children, elderly members, disabled individuals, and those who have completely lost their homes and livelihoods."
    }
  ],
  total_beneficiary: 500,
  total_donors_till_now: 1234,
  total_progress_percentage: 58.33,
  videoLinks: [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  ],
  // Additional fields for public display
  location: "Ahmedabad, Rajkot & Surrounding Villages, Gujarat, India",
  organizer: "Gujarat Relief Foundation",
  verified: true,
  urgency: "Critical"
})

export default function CauseDetailsPage() {
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<{ [key: number]: number }>({})
  const [customAmount, setCustomAmount] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  // Simulate API call - replace with actual API call later
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/campaigns/${params.id}`)
        // const campaignData = await response.json()
        
        const campaignData = getCampaignData(params.id as string)
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
          <Link href="/campaigns">
            <Button>Browse All Campaigns</Button>
          </Link>
        </div>
      </div>
    )
  }

  const addToCart = (productId: number) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }))
  }

  const removeFromCart = (productId: number) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }))
  }

  const getTotalAmount = () => {
    let total = 0
    Object.entries(selectedProducts).forEach(([productId, quantity]) => {
      const product = campaign.assignedProducts?.find((p) => p.id === Number.parseInt(productId))
      if (product) {
        total += product.price * quantity
      }
    })
    if (customAmount) {
      total += Number.parseInt(customAmount) || 0
    }
    return total
  }

  const getTotalItems = () => {
    return Object.values(selectedProducts).reduce((sum, quantity) => sum + quantity, 0)
  }

  const handleDonationConfirm = (donationData: any) => {
    console.log("Donation confirmed:", donationData)
    // TODO: Integrate with payment gateway
    // router.push('/payment')
  }

  const nextImage = () => {
    const images = [campaign.bannerImage, ...(campaign.additionalImages || [])].filter((img): img is string => !!img)
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    const images = [campaign.bannerImage, ...(campaign.additionalImages || [])].filter((img): img is string => !!img)
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const renderMarkdownContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Handle headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">{line.slice(2)}</h1>
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-gray-900 mb-3 mt-5">{line.slice(3)}</h2>
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold text-gray-900 mb-2 mt-4">{line.slice(4)}</h3>
      }
      
      // Handle bold text
      if (line.includes('**') && line.trim() !== '') {
        const parts = line.split('**')
        return (
          <p key={index} className="mb-2 text-gray-600">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part)}
          </p>
        )
      }
      
      // Handle bullet points
      if (line.startsWith('- ')) {
        return <li key={index} className="mb-1 text-gray-600 ml-4 list-disc">{line.slice(2)}</li>
      }
      
      // Handle horizontal rule
      if (line.trim() === '---') {
        return <hr key={index} className="my-6 border-gray-200" />
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        return <div key={index} className="mb-2" />
      }
      
      // Handle italic emphasis
      if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
        return <p key={index} className="mb-2 text-gray-500 italic text-sm">{line.slice(1, -1)}</p>
      }
      
      // Regular paragraphs
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

  const allImages = [campaign.bannerImage, ...(campaign.additionalImages || [])].filter((img): img is string => !!img)

  return (
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
              <span className="text-gray-900 font-medium truncate">{campaign.category}</span>
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

                    {/* Navigation Arrows - Touch Friendly */}
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

                    {/* Image Indicators - Mobile Friendly */}
                    {allImages.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:bottom-4 sm:space-x-2">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors touch-manipulation ${
                              index === currentImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Badges - Mobile Responsive */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1 sm:top-4 sm:left-4 sm:gap-2 lg:top-6 lg:left-6 lg:gap-3">
                    <Badge className="bg-blue-500 text-white font-semibold text-xs sm:text-sm">
                      {campaign.category}
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
                    <Badge className="bg-yellow-500 text-black font-semibold text-xs sm:text-sm">
                      <Star className="w-2 h-2 mr-1 sm:w-3 sm:h-3" />
                      Featured
                    </Badge>
                  </div>

                  {/* Thumbnail Gallery - Mobile Scrollable */}
                  {allImages.length > 1 && (
                    <div className="flex space-x-2 mt-3 overflow-x-auto pb-2 sm:mt-4 scrollbar-hide">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-colors touch-manipulation sm:w-20 sm:h-16 sm:rounded-lg ${
                            index === currentImageIndex ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"
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

                {/* Content Section - Mobile Optimized */}
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

                  {/* Stats Grid - Mobile First */}
                  <div className="grid grid-cols-2 gap-3 py-4 border-y border-gray-200 sm:grid-cols-4 sm:gap-4 sm:py-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 sm:text-xl lg:text-2xl">
                        ₹{campaign.raised?.toLocaleString()}
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
                        {campaign.total_beneficiary?.toLocaleString()}
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

                  {/* About Campaign - Mobile Readable */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 sm:text-2xl sm:mb-4">
                      About This Campaign
                    </h2>
                    <div className="prose prose-sm max-w-none sm:prose-base lg:prose-lg">
                     {campaign && campaign?.aboutCampaign ?   (renderMarkdownContent(campaign?.aboutCampaign)) :null}
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

            {/* Sidebar - Mobile First (appears at top on mobile) */}
            <div className="order-2 lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-4 lg:sticky lg:top-24 sm:space-y-6"
              >
                {/* Progress Card - Mobile Optimized */}
                <Card className="p-4 shadow-lg sm:p-6 sm:shadow-xl">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold sm:text-lg">Progress</span>
                      <span className="text-xl font-bold text-green-600 sm:text-2xl">{campaign.total_progress_percentage?.toFixed(1)}%</span>
                    </div>
                    <Progress value={campaign.total_progress_percentage} className="h-3 sm:h-4" />
                    <div className="flex justify-between text-xs text-gray-600 sm:text-sm">
                      <span>₹{campaign.raised?.toLocaleString()} raised</span>
                      <span>₹{campaign.goal.toLocaleString()} goal</span>
                    </div>
                    <div className="text-center pt-2">
                      <p className="text-xs text-gray-500">
                        ₹{(campaign.goal - (campaign.raised || 0)).toLocaleString()} still needed
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Quick Donate - Mobile First */}
                <Card className="p-4 shadow-lg sm:p-6 sm:shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 sm:text-xl sm:mb-4">Quick Donate</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4 sm:gap-3">
                    {[500, 1000, 2500, 5000].map((amount) => (
                      <DonationDialog
                        key={amount}
                        trigger={
                          <Button
                            variant="outline"
                            className="cursor-pointer hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 bg-transparent text-sm p-2 transition-colors sm:text-base sm:p-3"
                          >
                            ₹{amount}
                          </Button>
                        }
                        productTitle={`Quick Donation - ₹${amount}`}
                        productPrice={amount}
                        onConfirm={handleDonationConfirm}
                      />
                    ))}
                  </div>
                  <DonationDialog
                    trigger={
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold cursor-pointer text-sm p-3 sm:text-base">
                        <Heart className="w-3 h-3 mr-2 sm:w-4 sm:h-4" />
                        Donate Now
                      </Button>
                    }
                    productTitle="General Donation"
                    productPrice={1000}
                    onConfirm={handleDonationConfirm}
                  />
                </Card>

                {/* Campaign Info - Mobile Friendly */}
                <Card className="p-4 shadow-lg sm:p-6 sm:shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 sm:text-xl sm:mb-4">Campaign Details</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                      <span className="break-words">{campaign.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span>Ends {new Date(campaign.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span>{campaign.total_beneficiary?.toLocaleString()} people will benefit</span>
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

                {/* Share - Mobile Optimized */}
                <Card className="p-4 shadow-lg sm:p-6 sm:shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 sm:text-xl sm:mb-4">Share This Campaign</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full cursor-pointer bg-transparent text-sm p-3 sm:text-base hover:bg-blue-50">
                      <Share2 className="w-3 h-3 mr-2 sm:w-4 sm:h-4" />
                      Share Campaign
                    </Button>
                    <div className="flex justify-center space-x-2 pt-2">
                      <button className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                        </svg>
                      </button>
                      <button className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                        </svg>
                      </button>
                      <button className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Mobile First Responsive */}
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

            {/* Products Grid - Mobile First */}
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
                  <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-40 object-cover sm:h-48"
                      />
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                        <Badge className="bg-white/90 text-gray-900 font-semibold text-xs sm:text-sm">
                          {product.unit}
                        </Badge>
                      </div>
                      {product.stock !== undefined && product.stock < 10 && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                          <Badge className="bg-red-500 text-white font-semibold text-xs sm:text-sm">
                            Only {product.stock} left
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 sm:text-xl sm:mb-3">
                        {product.name}
                      </h3>
                      <div className="text-xl font-bold text-blue-600 mb-2 sm:text-2xl sm:mb-3">
                        ₹{product.price.toLocaleString()}/{product.unit}
                      </div>
                      
                      {/* Product Impact Description */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mb-3 sm:mb-4">
                        <div className="text-xs font-semibold text-gray-700 flex items-center sm:text-sm">
                          <TrendingUp className="w-3 h-3 mr-2 text-blue-600 sm:w-4 sm:h-4" />
                          Impact: {
                            product.name.includes('Food') ? 'Feeds a family for 2 weeks' :
                            product.name.includes('Shelter') ? 'Provides temporary housing for a family' :
                            product.name.includes('Medical') ? 'Covers medical treatment for 10 people' :
                            product.name.includes('Water') ? 'Clean water for 1 month' :
                            product.name.includes('Education') ? 'School supplies for 5 children' :
                            'Essential hygiene supplies for 1 month'
                          }
                        </div>
                      </div>

                      {selectedProducts[product.id] > 0 && (
                        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg mb-3 sm:p-3 sm:mb-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(product.id)}
                            className="cursor-pointer p-1 sm:p-2"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <span className="font-semibold text-sm sm:text-base">{selectedProducts[product.id]}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(product.id)}
                            className="cursor-pointer p-1 sm:p-2"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2 sm:space-y-3">
                        <DonationDialog
                          trigger={
                            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold cursor-pointer text-xs p-2.5 sm:text-sm sm:p-3">
                              DONATE NOW | ₹{product.price.toLocaleString()}
                            </Button>
                          }
                          productTitle={product.name}
                          productPrice={product.price}
                          onConfirm={handleDonationConfirm}
                        />
                        <Button
                          variant="outline"
                          className="w-full border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer bg-transparent text-xs p-2.5 sm:text-sm sm:p-3 transition-colors"
                          onClick={() => addToCart(product.id)}
                        >
                          ADD TO GIFT CART ♡
                        </Button>
                      </div>
                      
                      {product.stock !== undefined && (
                        <div className="mt-2 text-xs text-gray-500 text-center">
                          {product.stock} {product.unit}s available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Custom Amount - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-sm mx-auto sm:max-w-md"
            >
              <Card className="p-4 shadow-lg sm:p-6 sm:shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-3 text-center sm:text-xl sm:mb-4">
                  Custom Donation Amount
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-sm sm:text-base">₹</span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                      inputMode="numeric"
                      min="1"
                    />
                  </div>
                  <DonationDialog
                    trigger={
                      <Button
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold cursor-pointer text-sm p-3 sm:text-base"
                        disabled={!customAmount || parseInt(customAmount) < 1}
                      >
                        <Heart className="w-3 h-3 mr-2 fill-current sm:w-4 sm:h-4" />
                        Donate Custom Amount
                      </Button>
                    }
                    productTitle="Custom Donation"
                    productPrice={parseInt(customAmount) || 0}
                    onConfirm={handleDonationConfirm}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Mobile Cart Summary - Fixed Position */}
            {getTotalItems() > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto"
              >
                <Card className="p-3 shadow-2xl bg-white border-2 border-blue-400 sm:p-4">
                  <div className="flex items-center justify-between space-x-3 sm:space-x-4">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">
                        {getTotalItems()} items in cart
                      </div>
                      <div className="text-base font-bold text-green-600 sm:text-lg">
                        Total: ₹{getTotalAmount().toLocaleString()}
                      </div>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold cursor-pointer text-sm p-2 sm:text-base sm:p-3"
                      asChild
                    >
                      <Link href="/cart">
                        <Gift className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
                        View Cart
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </section>
      )}
 
    </div>
  )
}