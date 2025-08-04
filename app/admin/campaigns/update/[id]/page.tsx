// File: app/admin/campaigns/[id]/edit/page.tsx

"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Campaign } from "@/lib/interface"
import { initialCampaigns } from "@/lib/utils"
import CampaignForm from "../../_componante/CampaignForm"

export default function EditCampaignPage({ params }: { params: { id: string } }) {
  // Use React.use() with a type assertion to satisfy both the linter and TypeScript.
  // The 'as Promise<any>' tells TypeScript to treat params as a Promise,
  // which is what Next.js is expecting in the future.
  const resolvedParams = React.use(params as unknown as Promise<any>)
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const campaignId = parseInt(resolvedParams.id)
    const foundCampaign = initialCampaigns.find((c) => c.id === campaignId)

    if (foundCampaign) {
      setCampaign(foundCampaign)
    } else {
      router.push("/admin/campaigns")
    }
    setIsLoading(false)
  }, [resolvedParams.id, router])

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

  if (!campaign) {
    return <div className="p-6 text-center text-red-500">Campaign not found. Redirecting...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Campaign</h1>
      <CampaignForm campaign={campaign} onSave={handleSave} onCancel={handleCancel} />
    </div>
  )
}