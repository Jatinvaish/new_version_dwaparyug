"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Eye, Search, XCircle, ListChecks, Clock } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

interface Donation {
  id: number
  donorName: string
  campaignTitle: string
  amount: number
  date: Date
  status: "Pending" | "Completed" | "Refunded"
  paymentMethod: string
  message?: string
  images?: string[] // URLs of uploaded images
  mobileNumber: string
  country: string
}

const initialDonations: Donation[] = [
  {
    id: 1,
    donorName: "Priya Sharma",
    campaignTitle: "Winter Relief Drive 2024",
    amount: 1500,
    date: new Date("2024-01-10"),
    status: "Completed",
    paymentMethod: "Credit Card",
    message: "Hope this helps keep someone warm!",
    images: ["/placeholder.svg?height=50&width=50&text=Donation+Pic1"],
    mobileNumber: "+919876543210",
    country: "India",
  },
  {
    id: 2,
    donorName: "Rajesh Kumar",
    campaignTitle: "Educate a Child Program",
    amount: 2500,
    date: new Date("2024-01-12"),
    status: "Pending",
    paymentMethod: "UPI",
    mobileNumber: "+919988776655",
    country: "India",
  },
  {
    id: 3,
    donorName: "Sarah Johnson",
    campaignTitle: "Diwali Joy Distribution 2024",
    amount: 5000,
    date: new Date("2023-11-01"),
    status: "Completed",
    paymentMethod: "PayPal",
    message: "Happy Diwali to all!",
    mobileNumber: "+12125551234",
    country: "United States",
  },
  {
    id: 4,
    donorName: "David Lee",
    campaignTitle: "Rural Healthcare Access",
    amount: 1000,
    date: new Date("2024-01-05"),
    status: "Refunded",
    paymentMethod: "Bank Transfer",
    mobileNumber: "+447911123456",
    country: "United Kingdom",
  },
]

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>(initialDonations)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentDonation, setCurrentDonation] = useState<Donation | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")

  const handleViewDetails = (donation: Donation) => {
    setCurrentDonation(donation)
    setIsViewDialogOpen(true)
  }

  const handleUpdateStatus = (id: number, newStatus: "Pending" | "Completed" | "Refunded") => {
    setDonations(donations.map((d) => (d.id === id ? { ...d, status: newStatus } : d)))
  }

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.mobileNumber.includes(searchTerm)
    const matchesStatus = filterStatus === "All" || donation.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default"
      case "Pending":
        return "secondary"
      case "Refunded":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Donation Requests</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by donor, campaign, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor Name</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">{donation.donorName}</TableCell>
                  <TableCell>{donation.campaignTitle}</TableCell>
                  <TableCell>₹{donation.amount.toLocaleString()}</TableCell>
                  <TableCell>{format(donation.date, "PPP")}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(donation.status)}>{donation.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(donation)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ListChecks className="h-4 w-4" />
                      <span className="sr-only">Change Status</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Clock className="h-4 w-4" />
                      <span className="sr-only">Change Status</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <XCircle className="h-4 w-4" />
                      <span className="sr-only">Change Status</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
          </DialogHeader>
          {currentDonation && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <Label>Donor Name:</Label>
                <span>{currentDonation.donorName}</span>
                <Label>Campaign:</Label>
                <span>{currentDonation.campaignTitle}</span>
                <Label>Amount:</Label>
                <span>₹{currentDonation.amount.toLocaleString()}</span>
                <Label>Date:</Label>
                <span>{format(currentDonation.date, "PPP")}</span>
                <Label>Status:</Label>
                <span>
                  <Badge variant={getStatusBadgeVariant(currentDonation.status)}>{currentDonation.status}</Badge>
                </span>
                <Label>Payment Method:</Label>
                <span>{currentDonation.paymentMethod}</span>
                <Label>Mobile Number:</Label>
                <span>{currentDonation.mobileNumber}</span>
                <Label>Country:</Label>
                <span>{currentDonation.country}</span>
              </div>
              {currentDonation.message && (
                <div className="space-y-2">
                  <Label>Message:</Label>
                  <p className="text-sm text-muted-foreground">{currentDonation.message}</p>
                </div>
              )}
              {currentDonation.images && currentDonation.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Images:</Label>
                  <div className="flex flex-wrap gap-2">
                    {currentDonation.images.map((img, index) => (
                      <Image
                        key={index}
                        src={img || "/placeholder.svg"}
                        alt={`Donation image ${index + 1}`}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
