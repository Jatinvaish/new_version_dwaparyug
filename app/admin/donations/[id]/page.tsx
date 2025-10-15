"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Calendar, CreditCard, Package, Heart, ImageIcon, Video, MapPin, Users, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

// Helper functions
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount: number | string, currency = 'INR') => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return numAmount.toLocaleString('en-IN', {
    style: 'currency',
    currency: currency
  })
}

// Types (same as original but keeping for completeness)
interface DonationUser {
  id: number
  name: string
  first_name: string
  last_name: string
  email: string
  mobile: string
}

interface CampaignCategory {
  name: string
  description: string
}

interface Campaign {
  id: number
  title: string
  overview: string
  details: string
  image: string
  donation_goal: number
  total_raised: number
  progress_percentage: number
  total_beneficiary: number
  location: string
  organizer: string
  status: string
  category: CampaignCategory
}

interface ProductUnit {
  name: string
  abbreviation: string
}

interface Product {
  independent_product_id: number
  name: string
  description: string
  campaign_description: string
  image: string
  current_campaign_price: number
  stock: number
  min_qty: number
  max_qty: number
  increment_count: number
  is_flexible_increment_count: boolean
  allows_personalization: boolean
  status: string
  unit: ProductUnit
}

interface DonationItem {
  id: number
  campaign_product_id: number
  quantity: number
  price_per_unit: number
  total_price: number
  fulfillment_status: string
  product: Product
  created_at: string
  updated_at: string
}

interface PersonalizationOption {
  id: number
  donation_id: number
  donation_item_id: number
  donor_name: string
  donor_country: string
  custom_image: string
  is_image_available: boolean
  custom_message: string
  donation_purpose: string
  special_instructions: string
  created_at: string
}

interface ImpactStory {
  id: number
  title: string
  content: string
  summary: string
  images: string[]
  videos: string[]
  people_helped: number
  families_helped: number
  communities_helped: number
  location: string
  impact_date: string
  is_published: boolean
  featured: boolean
}

interface ImpactBatch {
  name: string
  distribution_date: string
  location: string
  status: string
}

interface ImpactTracking {
  tracking_id: number
  contribution_percentage: number
  people_helped_by_this_donation: number
  impact_description: string
  story: ImpactStory
  batch: ImpactBatch | null
  created_at: string
}

interface DonationDetails {
  id: number
  donation_amount: number
  tip_amount: number
  total_amount: number
  donation_type: 'direct' | 'product_based'
  is_public: boolean
  donation_date: string
  donated_on_behalf_of: string
  donor_message: string
  impact_generated: boolean
  beneficiaries_reached: number
  created_at: string
  updated_at: string
  razorpay_payment_id: string
  razorpay_signature: string
  razorpay_order_id: string
  payment_status: string
  payment_created_at: string
  payment_currency: string
  total_amount_formatted: string
  donation_amount_formatted: string
  tip_amount_formatted: string
  user: DonationUser | null
  campaign: Campaign
  items: DonationItem[]
  personalization: PersonalizationOption[]
  impact_stories: ImpactTracking[]
}

export default function CompactDonationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const donationId = params?.id as string

  const [donation, setDonation] = useState<DonationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (donationId) {
      fetchDonationDetails()
    }
  }, [donationId])

  const fetchDonationDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/donations/${donationId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch donation details')
      }

      const data = await response.json()
      if (data.success) {
        setDonation(data.donation)
      } else {
        throw new Error(data.error || 'Failed to load donation')
      }
    } catch (error) {
      console.error('Error fetching donation details:', error)
      setError(error instanceof Error ? error.message : 'Failed to load donation details')
    } finally {
      setLoading(false)
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'captured':
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-xs px-1 py-0"><CheckCircle className="w-2 h-2 mr-1" />Done</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs px-1 py-0"><Clock className="w-2 h-2 mr-1" />Wait</Badge>
      case 'failed':
      case 'cancelled':
        return <Badge variant="destructive" className="text-xs px-1 py-0"><XCircle className="w-2 h-2 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline" className="text-xs px-1 py-0"><AlertCircle className="w-2 h-2 mr-1" />{status || 'Unknown'}</Badge>
    }
  }

  const getFulfillmentStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-xs px-1 py-0">Done</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs px-1 py-0">Wait</Badge>
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs px-1 py-0">Process</Badge>
      default:
        return <Badge variant="outline" className="text-xs px-1 py-0">{status || 'Unknown'}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold mb-1">{error ? 'Error Loading' : 'Not Found'}</h3>
            <p className="text-xs text-muted-foreground mb-2">{error || "Donation doesn't exist"}</p>
            <Button size="sm" onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button size="default" variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Donation #{donation.id}</h1>
              <p className="text-sm text-muted-foreground">{formatDate(donation.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{donation.total_amount_formatted}</div>
            <div className="text-sm text-muted-foreground">Total Amount</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6 text-sm">

          {/* Left Column - Main Info */}
          <div className="col-span-8 space-y-6">

            {/* Overview Card */}
            <Card className="p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Amount Breakdown */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Amount Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Donation:</span>
                      <span className="font-medium">{donation.donation_amount_formatted}</span>
                    </div>
                    {donation.tip_amount > 0 && (
                      <div className="flex justify-between">
                        <span>Tip:</span>
                        <span>{donation.tip_amount_formatted}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Total:</span>
                      <span>{donation.total_amount_formatted}</span>
                    </div>
                  </div>
                </div>

                {/* Donation Info */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Type:</span>
                      <Badge variant={donation.donation_type === 'direct' ? 'default' : 'secondary'} className="text-sm px-2 py-1">
                        {donation.donation_type === 'direct' ? 'Direct' : 'Product'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Public:</span>
                      <Badge variant={donation.is_public ? 'default' : 'outline'} className="text-sm px-2 py-1">
                        {donation.is_public ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Impact:</span>
                      <Badge variant={donation.impact_generated ? 'default' : 'outline'} className="text-sm px-2 py-1">
                        {donation.impact_generated ? 'Yes' : 'None'}
                      </Badge>
                    </div>
                  </div>
                </div>

              </div>

              {/* Messages */}
              {(donation.donor_message || donation.donated_on_behalf_of) && (
                <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
                  {donation.donor_message && (
                    <div>
                      <span className="font-medium text-sm">Donor Message:</span>
                      <p className="text-sm italic bg-muted p-3 rounded mt-2">"{donation.donor_message}"</p>
                    </div>
                  )}
                  {donation.donated_on_behalf_of && (
                    <div>
                      <span className="font-medium text-sm">On behalf of:</span>
                      <p className="text-sm bg-pink-50 p-3 rounded mt-2 flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-pink-600" />
                        {donation.donated_on_behalf_of}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Products & Personalization */}
            {(donation.items.length > 0 || donation.personalization.length > 0) && (
              <Card className="p-6">
                <h4 className="font-semibold mb-4 text-lg">Products & Personalization</h4>
                <div className="grid grid-cols-2 gap-6">

                  {/* Products */}
                  {donation.items.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-3">Items ({donation.items.length})</h5>
                      <div className="space-y-3">
                        {donation.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            {item.product.image && (
                              <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{item.product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.quantity} × {formatCurrency(item.price_per_unit)} = {formatCurrency(item.total_price)}
                              </div>
                            </div>
                            <div>{getFulfillmentStatusBadge(item.fulfillment_status)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personalization */}
                  {donation.personalization.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-3">Personalization ({donation.personalization.length})</h5>
                      <div className="space-y-3">
                        {donation.personalization.map((p) => (
                          <div key={p.id} className="p-3 border rounded-lg">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {p.donor_name && <div><span className="text-muted-foreground">Name:</span> {p.donor_name}</div>}
                              {p.donor_country && <div><span className="text-muted-foreground">Country:</span> {p.donor_country}</div>}
                              {p.donation_purpose && <div><span className="text-muted-foreground">Purpose:</span> {p.donation_purpose}</div>}
                              {p.is_image_available && (
                                <div className="flex items-center text-green-600">
                                  <ImageIcon className="w-4 h-4 mr-1" />Custom image available
                                </div>
                              )}
                            </div>
                            {(p.custom_message || p.special_instructions) && (
                              <div className="mt-3 space-y-2">
                                {p.custom_message && (
                                  <div className="bg-muted p-3 rounded">
                                    <span className="text-muted-foreground text-sm font-medium">Message:</span>
                                    <p className="text-sm mt-1">{p.custom_message}</p>
                                  </div>
                                )}
                                {p.special_instructions && (
                                  <div className="bg-muted p-3 rounded">
                                    <span className="text-muted-foreground text-sm font-medium">Instructions:</span>
                                    <p className="text-sm mt-1">{p.special_instructions}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {p.custom_image && (
                              <div className="mt-3">
                                <span className="text-muted-foreground text-sm font-medium">Custom Image:</span>
                                <img src={p.custom_image} alt="Custom" className="w-full max-h-32 object-cover rounded mt-2" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="p-3">
              <h4 className="font-semibold mb-2 text-xs">Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">#{donation.id}</div>
                  <div className="text-xs text-muted-foreground">ID</div>
                </div>

                {donation.impact_generated && donation.beneficiaries_reached > 0 && (
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">{donation.beneficiaries_reached}</div>
                    <div className="text-xs text-muted-foreground">Beneficiaries</div>
                  </div>
                )}

                {donation.items.length > 0 && (
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {donation.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Items</div>
                  </div>
                )}

                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-semibold text-gray-600">{donation.campaign.progress_percentage.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Progress</div>
                </div>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-3">
              <h4 className="font-semibold mb-2 text-xs flex items-center">
                <Clock className="h-3 w-3 mr-1" />Timeline
              </h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-1 mr-2"></div>
                  <div>
                    <p className="text-xs font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(donation.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-1 h-1 rounded-full bg-green-500 mt-1 mr-2"></div>
                  <div>
                    <p className="text-xs font-medium">Paid</p>
                    <p className="text-xs text-muted-foreground">{formatDate(donation.payment_created_at)}</p>
                  </div>
                </div>
                {donation.impact_stories.length > 0 && (
                  <div className="flex items-start">
                    <div className="w-1 h-1 rounded-full bg-red-500 mt-1 mr-2"></div>
                    <div>
                      <p className="text-xs font-medium">Impact</p>
                      <p className="text-xs text-muted-foreground">{donation.impact_stories.length} stories</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            {/* Impact Stories */}
            {donation.impact_stories.length > 0 && (
              <Card className="p-6">
                <h4 className="font-semibold mb-4 text-lg flex items-center">
                  <Heart className="h-5 w-5 mr-2" />Impact Stories ({donation.impact_stories.length})
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {donation.impact_stories.map((impact) => (
                    <div key={impact.tracking_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="text-sm font-medium">{impact.story.title}</h5>
                        {impact.story.featured && <Badge variant="default" className="text-sm px-2 py-1">Featured</Badge>}
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-sm font-bold text-blue-600">{impact.people_helped_by_this_donation}</div>
                          <div className="text-xs text-muted-foreground">You Helped</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <div className="text-sm font-bold text-green-600">{impact.story.people_helped}</div>
                          <div className="text-xs text-muted-foreground">Total People</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <div className="text-sm font-bold text-purple-600">{impact.story.families_helped}</div>
                          <div className="text-xs text-muted-foreground">Families</div>
                        </div>
                        <div className="bg-orange-50 p-2 rounded">
                          <div className="text-sm font-bold text-orange-600">{impact.story.communities_helped}</div>
                          <div className="text-xs text-muted-foreground">Communities</div>
                        </div>
                      </div>

                      <p className="text-sm mb-3">{impact.story.summary}</p>

                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />{impact.story.location}
                        </div>
                        {impact.story.images.length > 0 && (
                          <div className="flex items-center">
                            <ImageIcon className="h-3 w-3 mr-1" />{impact.story.images.length} photos
                          </div>
                        )}
                        {impact.story.videos.length > 0 && (
                          <div className="flex items-center">
                            <Video className="h-3 w-3 mr-1" />{impact.story.videos.length} videos
                          </div>
                        )}
                      </div>

                      {impact.batch && (
                        <div className="mt-3 p-3 bg-muted rounded text-sm">
                          <div className="font-medium">Distribution Batch: {impact.batch.name}</div>
                          <div className="text-muted-foreground">
                            Status: <Badge variant="outline" className="text-xs px-1 py-0 ml-1">{impact.batch.status}</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-6">

            {/* Donor Info */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3 text-base flex items-center">
                <User className="h-4 w-4 mr-2" />Donor Information
              </h4>
              {donation.user ? (
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{donation.user.name}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{donation.user.email}</span></div>
                  {donation.user.mobile && <div><span className="text-muted-foreground">Mobile:</span> <span className="font-medium">{donation.user.mobile}</span></div>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Anonymous Donor</p>
              )}
            </Card>
            {/* Payment Details */}
            <Card className="p-3">
              <h4 className="font-semibold mb-2 text-xs flex items-center">
                <CreditCard className="h-3 w-3 mr-1" />Payment
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  {getPaymentStatusBadge(donation.payment_status)}
                </div>
                <div><span className="text-muted-foreground">ID:</span> {donation.razorpay_payment_id  || 'N/A'}</div>
                <div><span className="text-muted-foreground">Currency:</span> {donation.payment_currency}</div>
                <div><span className="text-muted-foreground">Date:</span> {formatDate(donation.payment_created_at)}</div>
              </div>
            </Card>

            {/* Campaign Info */}
            <Card className="p-3">
              <h4 className="font-semibold mb-2 text-xs">Campaign</h4>
              <div className="space-y-2">
                {donation.campaign.image && (
                  <img src={donation.campaign.image} alt={donation.campaign.title} className="w-full h-16 object-cover rounded" />
                )}
                <div className="space-y-1 text-xs">
                  <div className="font-medium">{donation.campaign.title}</div>
                  <div className="text-muted-foreground">{donation.campaign.overview.slice(0, 80)}...</div>
                  <div><span className="text-muted-foreground">Category:</span> {donation.campaign.category.name}</div>
                  <div><span className="text-muted-foreground">Organizer:</span> {donation.campaign.organizer}</div>
                  <div><span className="text-muted-foreground">Location:</span> {donation.campaign.location}</div>
                </div>
              </div>
            </Card>


            {/* Actions */}
            <Card className="p-3">
              <div className="flex justify-center items-center gap-2">
                <Button size="sm" className="w-1/2 text-xs h-8 flex items-center justify-center" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Receipt
                </Button>
                <Button size="sm" className="w-1/2 text-xs h-8 flex items-center justify-center" variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  View Campaign
                </Button>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )


}