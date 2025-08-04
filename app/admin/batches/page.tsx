"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search, Package } from "lucide-react"
import { format } from "date-fns"

interface Product {
  id: number
  name: string
  price: number
  stock: number
  units: string
  image: string
}

interface Campaign {
  id: number
  title: string
}

interface Batch {
  id: number
  name: string
  campaignId: number
  assignedProducts: { productId: number; quantity: number }[]
  status: "Pending" | "In Progress" | "Completed"
  distributionTeam: string
  createdAt: Date
}

const allProducts: Product[] = [
  {
    id: 1,
    name: "Diwali Sweet Box",
    price: 500,
    stock: 100,
    units: "boxes",
    image: "/placeholder.svg?height=50&width=50&text=Sweet+Box",
  },
  {
    id: 2,
    name: "Winter Blanket",
    price: 800,
    stock: 200,
    units: "units",
    image: "/placeholder.svg?height=50&width=50&text=Blanket",
  },
  {
    id: 3,
    name: "School Kit",
    price: 1200,
    stock: 50,
    units: "kits",
    image: "/placeholder.svg?height=50&width=50&text=School+Kit",
  },
  {
    id: 4,
    name: "Medical Aid Pack",
    price: 700,
    stock: 150,
    units: "packs",
    image: "/placeholder.svg?height=50&width=50&text=Medical+Aid",
  },
  {
    id: 5,
    name: "Hygiene Kit",
    price: 300,
    stock: 300,
    units: "kits",
    image: "/placeholder.svg?height=50&width=50&text=Hygiene+Kit",
  },
]

const allCampaigns: Campaign[] = [
  { id: 1, title: "Winter Relief Drive 2024" },
  { id: 2, title: "Educate a Child Program" },
  { id: 3, title: "Diwali Joy Distribution 2024" },
  { id: 4, title: "Rural Healthcare Access" },
  { id: 5, title: "Women Empowerment Through Skill Training" },
]

const initialBatches: Batch[] = [
  {
    id: 1,
    name: "Winter Relief Batch 001",
    campaignId: 1,
    assignedProducts: [
      { productId: 2, quantity: 50 },
      { productId: 1, quantity: 20 },
    ],
    status: "In Progress",
    distributionTeam: "Team Alpha",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: 2,
    name: "School Kit Batch 001",
    campaignId: 2,
    assignedProducts: [{ productId: 3, quantity: 30 }],
    status: "Pending",
    distributionTeam: "Team Beta",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 3,
    name: "Diwali Sweets Batch 001",
    campaignId: 3,
    assignedProducts: [{ productId: 1, quantity: 80 }],
    status: "Completed",
    distributionTeam: "Team Gamma",
    createdAt: new Date("2023-11-01"),
  },
]

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>(initialBatches)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterCampaign, setFilterCampaign] = useState("All")

  const [formName, setFormName] = useState("")
  const [formCampaignId, setFormCampaignId] = useState<number | string>("")
  const [formAssignedProducts, setFormAssignedProducts] = useState<{ productId: number; quantity: number }[]>([])
  const [formStatus, setFormStatus] = useState<Batch["status"]>("Pending")
  const [formDistributionTeam, setFormDistributionTeam] = useState("")

  const resetForm = () => {
    setCurrentBatch(null)
    setFormName("")
    setFormCampaignId("")
    setFormAssignedProducts([])
    setFormStatus("Pending")
    setFormDistributionTeam("")
  }

  const handleEdit = (batch: Batch) => {
    setCurrentBatch(batch)
    setFormName(batch.name)
    setFormCampaignId(batch.campaignId)
    setFormAssignedProducts(batch.assignedProducts)
    setFormStatus(batch.status)
    setFormDistributionTeam(batch.distributionTeam)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      setBatches(batches.filter((b) => b.id !== id))
    }
  }

  const handleSave = () => {
    if (!formName || !formCampaignId || formAssignedProducts.length === 0 || !formDistributionTeam) {
      alert("Please fill in all required fields and assign at least one product.")
      return
    }

    const newBatch: Batch = {
      id: currentBatch ? currentBatch.id : batches.length + 1,
      name: formName,
      campaignId: Number(formCampaignId),
      assignedProducts: formAssignedProducts,
      status: formStatus,
      distributionTeam: formDistributionTeam,
      createdAt: currentBatch ? currentBatch.createdAt : new Date(),
    }

    if (currentBatch) {
      setBatches(batches.map((b) => (b.id === newBatch.id ? newBatch : b)))
    } else {
      setBatches([...batches, newBatch])
    }
    setIsDialogOpen(false)
    resetForm()
  }

  const handleProductQuantityChange = (productId: number, quantity: number) => {
    setFormAssignedProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.productId === productId)
      if (existingIndex > -1) {
        const updated = [...prev]
        if (quantity > 0) {
          updated[existingIndex].quantity = quantity
        } else {
          updated.splice(existingIndex, 1) // Remove if quantity is 0
        }
        return updated
      } else if (quantity > 0) {
        return [...prev, { productId, quantity }]
      }
      return prev
    })
  }

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.distributionTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allCampaigns
        .find((c) => c.id === batch.campaignId)
        ?.title.toLowerCase()
        .includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "All" || batch.status === filterStatus
    const matchesCampaign = filterCampaign === "All" || batch.campaignId === Number(filterCampaign)
    return matchesSearch && matchesStatus && matchesCampaign
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default"
      case "In Progress":
        return "secondary"
      case "Pending":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Batches</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Create Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentBatch ? "Edit Batch" : "Create New Batch"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Batch Name</Label>
                <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign">Link to Campaign</Label>
                <Select value={String(formCampaignId)} onValueChange={setFormCampaignId} required>
                  <SelectTrigger id="campaign">
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={String(campaign.id)}>
                        {campaign.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="distributionTeam">Distribution Team</Label>
                <Input
                  id="distributionTeam"
                  value={formDistributionTeam}
                  onChange={(e) => setFormDistributionTeam(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formStatus} onValueChange={(value) => setFormStatus(value as Batch["status"])} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign Products & Quantities</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allProducts.map((product) => (
                    <Card key={product.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <span>{product.name}</span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Qty"
                        className="w-24"
                        value={formAssignedProducts.find((p) => p.productId === product.id)?.quantity || ""}
                        onChange={(e) => handleProductQuantityChange(product.id, Number.parseInt(e.target.value))}
                      />
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Batch</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search batches by name or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCampaign} onValueChange={setFilterCampaign}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Campaigns</SelectItem>
                {allCampaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={String(campaign.id)}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell>{allCampaigns.find((c) => c.id === batch.campaignId)?.title}</TableCell>
                  <TableCell>
                    {batch.assignedProducts.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {batch.assignedProducts.map((ap) => {
                          const product = allProducts.find((p) => p.id === ap.productId)
                          return product ? (
                            <Badge key={product.id} variant="secondary" className="text-xs">
                              {product.name} (x{ap.quantity})
                            </Badge>
                          ) : null
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No products</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(batch.status)}>{batch.status}</Badge>
                  </TableCell>
                  <TableCell>{batch.distributionTeam}</TableCell>
                  <TableCell>{format(batch.createdAt, "PPP")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(batch)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(batch.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
