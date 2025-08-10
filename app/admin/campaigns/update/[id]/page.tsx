// File: app/admin/causes/[id]/edit/page.tsx

"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Campaign } from "@/lib/interface"
import CampaignForm from "../../_componante/CampaignForm"

export default function EditCampaignPage({ params }: { params: { id: string } }) {
  // Use React.use() with a type assertion to satisfy both the linter and TypeScript.
  // The 'as Promise<any>' tells TypeScript to treat params as a Promise,
  // which is what Next.js is expecting in the future.
  const resolvedParams = React.use(params as unknown as Promise<any>)
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaign()
  }, [resolvedParams.id])

  const fetchCampaign = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const campaignId = parseInt(resolvedParams.id)

      if (isNaN(campaignId)) {
        throw new Error('Invalid campaign ID')
      }

      const response = await fetch(`/api/campaigns/${campaignId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Campaign not found')
        }
        throw new Error('Failed to fetch campaign')
      }
      const campaignData = await response.json()
      setCampaign({...campaignData, id:Number(campaignData.id), total_raised:Number(campaignData.total_raised), donation_goal:Number(campaignData.donation_goal),
        category_id:Number(campaignData.category_id),
        total_progress_percentage:Number(campaignData.total_progress_percentage),
      })
    } catch (error) {
      console.error('Error fetching campaign:', error)
      setError(error instanceof Error ? error.message : 'Failed to load campaign')

      // Redirect to campaigns list if campaign not found
      if (error instanceof Error && error.message === 'Campaign not found') {
        setTimeout(() => {
          router.push("/admin/campaigns")
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = (updatedCampaign: Campaign) => {
    console.log("Saving updated campaign:", updatedCampaign)
    // Add your API call here to update the campaign
    // After a successful save, redirect to the campaigns list
    router.push("/admin/campaigns")
  }

  const handleCancel = () => {
    router.push("/admin/campaigns")
  }

  if (isLoading) {
    return <div className="p-6 text-center">Loading campaign details...</div>
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        {error !== 'Campaign not found' && (
          <button
            onClick={fetchCampaign}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        )}
        {error === 'Campaign not found' && (
          <div className="text-gray-500">Redirecting to campaigns list...</div>
        )}
      </div>
    )
  }

  if (!campaign) {
    return <div className="p-6 text-center text-red-500">Campaign not found. Redirecting...</div>
  }


  return (
    <div className=" ">
      <h1 className="text-2xl font-bold mb-6">Edit Campaign</h1>
      <CampaignForm campaign={campaign} onSave={handleSave} onCancel={handleCancel} />
    </div>
  )
}