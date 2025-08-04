"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import Image from "next/image"

interface Product {
  id: number
  name: string
  price: number
  stock: number
  units: string // e.g., "boxes", "units", "kits"
  image: string
  assignedCampaigns: number[] // IDs of campaigns this product is assigned to
}

interface Campaign {
  id: number
  title: string
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Diwali Sweet Box",
    price: 500,
    stock: 100,
    units: "boxes",
    image: "/placeholder.svg?height=50&width=50&text=Sweet+Box",
    assignedCampaigns: [1, 3],
  },
  {
    id: 2,
    name: "Winter Blanket",
    price: 800,
    stock: 200,
    units: "units",
    image: "/placeholder.svg?height=50&width=50&text=Blanket",
    assignedCampaigns: [1],
  },
  {
    id: 3,
    name: "School Kit",
    price: 1200,
    stock: 50,
    units: "kits",
    image: "/placeholder.svg?height=50&width=50&text=School+Kit",
    assignedCampaigns: [2],
  },
  {
    id: 4,
    name: "Medical Aid Pack",
    price: 700,
    stock: 150,
    units: "packs",
    image: "/placeholder.svg?height=50&width=50&text=Medical+Aid",
    assignedCampaigns: [4],
  },
  {
    id: 5,
    name: "Hygiene Kit",
    price: 300,
    stock: 300,
    units: "kits",
    image: "/placeholder.svg?height=50&width=50&text=Hygiene+Kit",
    assignedCampaigns: [],
  },
]

const allCampaigns: Campaign[] = [
  { id: 1, title: "Winter Relief Drive 2024" },
  { id: 2, title: "Educate a Child Program" },
  { id: 3, title: "Diwali Joy Distribution 2024" },
  { id: 4, title: "Rural Healthcare Access" },
  { id: 5, title: "Women Empowerment Through Skill Training" },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formName, setFormName] = useState("")
  const [formPrice, setFormPrice] = useState<number | string>("")
  const [formStock, setFormStock] = useState<number | string>("")
  const [formUnits, setFormUnits] = useState("")
  const [formImage, setFormImage] = useState<File | string | null>(null)
  const [formAssignedCampaigns, setFormAssignedCampaigns] = useState<number[]>([])

  const resetForm = () => {
    setCurrentProduct(null)
    setFormName("")
    setFormPrice("")
    setFormStock("")
    setFormUnits("")
    setFormImage(null)
    setFormAssignedCampaigns([])
  }

  const handleEdit = (product: Product) => {
    setCurrentProduct(product)
    setFormName(product.name)
    setFormPrice(product.price)
    setFormStock(product.stock)
    setFormUnits(product.units)
    setFormImage(product.image)
    setFormAssignedCampaigns(product.assignedCampaigns)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  const handleSave = () => {
    if (!formName || !formPrice || !formStock || !formUnits || !formImage) {
      alert("Please fill in all required fields.")
      return
    }

    const newProduct: Product = {
      id: currentProduct ? currentProduct.id : products.length + 1,
      name: formName,
      price: Number(formPrice),
      stock: Number(formStock),
      units: formUnits,
      image: typeof formImage === "string" ? formImage : URL.createObjectURL(formImage as File),
      assignedCampaigns: formAssignedCampaigns,
    }

    if (currentProduct) {
      setProducts(products.map((p) => (p.id === newProduct.id ? newProduct : p)))
    } else {
      setProducts([...products, newProduct])
    }
    setIsDialogOpen(false)
    resetForm()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormImage(e.target.files[0])
    }
  }

  const handleCampaignAssignment = (campaignId: number, isChecked: boolean) => {
    if (isChecked) {
      setFormAssignedCampaigns((prev) => [...prev, campaignId])
    } else {
      setFormAssignedCampaigns((prev) => prev.filter((id) => id !== campaignId))
    }
  }

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Create Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="units">Units (e.g., boxes, units, kits)</Label>
                <Input
                  id="units"
                  value={formUnits}
                  onChange={(e) => setFormUnits(e.target.value)}
                  placeholder="e.g., boxes"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  required={!currentProduct}
                />
                {formImage && (
                  <div className="relative w-24 h-24 mt-2">
                    <Image
                      src={typeof formImage === "string" ? formImage : URL.createObjectURL(formImage)}
                      alt="Product Preview"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Assign to Campaigns</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`campaign-${campaign.id}`}
                        checked={formAssignedCampaigns.includes(campaign.id)}
                        onChange={(e) => handleCampaignAssignment(campaign.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor={`campaign-${campaign.id}`}>{campaign.title}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Assigned Campaigns</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>₹{product.price.toLocaleString()}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.units}</TableCell>
                  <TableCell>
                    {product.assignedCampaigns.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.assignedCampaigns.map((campaignId) => {
                          const campaign = allCampaigns.find((c) => c.id === campaignId)
                          return campaign ? (
                            <span key={campaignId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {campaign.title}
                            </span>
                          ) : null
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
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
