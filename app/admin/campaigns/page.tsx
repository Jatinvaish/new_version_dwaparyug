"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Campaign, CampaignCategory } from "@/lib/interface"

 

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

 

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [categories, setCategories] = useState<CampaignCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  // Sort states
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Mobile filter sheet state
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, filterCategory, filterStatus, pageSize])

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch campaigns when dependencies change
  useEffect(() => {
    fetchCampaigns()
  }, [currentPage, pageSize, debouncedSearchTerm, filterCategory, filterStatus, sortField, sortDirection])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/campaign-categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      })

      if (filterStatus) params.append('status', filterStatus)
      if (filterCategory) params.append('category_id', filterCategory)
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
      if (sortField) {
        params.append('sort', sortField)
        params.append('order', sortDirection)
      }

      const response = await fetch(`/api/campaigns?${params}`)
      if (!response.ok) throw new Error('Failed to fetch campaigns')
      
      const data = await response.json()
      setCampaigns(data.campaigns || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setError('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) {
      return
    }

    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete campaign')
      
      // Refresh campaigns list
      fetchCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Failed to delete campaign')
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1" />
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="h-3 w-3 ml-1" /> : 
      <ArrowDown className="h-3 w-3 ml-1" />
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFilterCategory("")
    setFilterStatus("")
    setSortField("")
    setSortDirection("desc")
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default"
      case "completed":
        return "secondary"
      case "draft":
        return "outline"
      case "inactive":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filterCategory) count++
    if (filterStatus) count++
    if (searchTerm) count++
    return count
  }

  // Mobile Card Component
  const CampaignCard = ({ campaign }: { campaign: Campaign }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{campaign.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {campaign.overview}
            </p>
          </div>
          <Badge variant={getStatusBadgeVariant(campaign.status)} className="ml-2 shrink-0">
            {campaign.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Category:</span>
            <p className="font-medium">{campaign.category_name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">End Date:</span>
            <p className="font-medium">
              {campaign.end_date ? format(new Date(campaign.end_date), "MMM d, yyyy") : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Goal:</span>
            <p className="font-medium">₹{campaign.donation_goal.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Raised:</span>
            <p className="font-medium">₹{campaign.total_raised?.toLocaleString() || '0'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/admin/campaigns/update/${campaign.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDelete(campaign.id)}
            className="flex-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Filter Controls Component
  const FilterControls = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`space-y-4 ${isMobile ? 'p-6' : ''}`}>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Items per page</label>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={resetFilters} variant="outline" className="flex-1">
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
        {isMobile && (
          <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
            Apply
          </Button>
        )}
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className=" mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Campaigns</h1>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchCampaigns}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Campaigns</h1>
          <Button asChild size="sm" className="sm:size-default">
            <Link href="/admin/campaigns/create">
              <Plus className="mr-2 h-4 w-4" /> Create Campaign
            </Link>
          </Button>
        </div>

        {/* Desktop Filters */}
        <Card className="hidden lg:block">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={resetFilters} size="sm">
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Filter Button */}
        <div className="flex lg:hidden items-center justify-between">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <FilterControls isMobile />
            </SheetContent>
          </Sheet>
        </div>

        {/* Results Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {campaigns.length} of {pagination.total} campaigns
          </p>
          {getActiveFiltersCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="self-start sm:self-auto">
              <X className="h-4 w-4 mr-2" />
              Clear filters ({getActiveFiltersCount()})
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="mt-4 text-muted-foreground">Loading campaigns...</p>
            </CardContent>
          </Card>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground mb-4">
                  {getActiveFiltersCount() > 0 
                    ? "Try adjusting your filters or search terms."
                    : "Get started by creating your first campaign."
                  }
                </p>
                {getActiveFiltersCount() > 0 ? (
                  <Button onClick={resetFilters} variant="outline">
                    Clear filters
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/admin/campaigns/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden lg:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('title')}
                            className="h-auto p-0 font-semibold hover:bg-transparent text-left justify-start"
                          >
                            Title {getSortIcon('title')}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[120px]">Category</TableHead>
                        <TableHead className="w-[100px]">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('goal')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Goal {getSortIcon('goal')}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[100px]">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('raised')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Raised {getSortIcon('raised')}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[80px]">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('status')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Status {getSortIcon('status')}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[120px]">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('end_date')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            End Date {getSortIcon('end_date')}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">
                            <div className="max-w-[220px]">
                              <div className="font-semibold truncate">{campaign.title}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {campaign.overview}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{campaign.category_name}</TableCell>
                          <TableCell>₹{campaign.donation_goal.toLocaleString()}</TableCell>
                          <TableCell>₹{campaign.total_raised?.toLocaleString() || '0'}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {campaign.end_date ? format(new Date(campaign.end_date), "MMM d, yyyy") : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/campaigns/update/${campaign.id}`}>
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Link>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(campaign.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="px-3"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Button>

                  {/* Page Numbers - Hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNumber;
                      if (pagination.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNumber = pagination.totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={pageNumber === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className="w-9 h-9 p-0"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage >= pagination.totalPages}
                    className="px-3"
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}





// ========================================
// File: app/admin/campaigns/page.tsx

// "use client"

// import React, { useState, useMemo, useCallback } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Calendar } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Search, 
//   Filter, 
//   ChevronLeft, 
//   ChevronRight, 
//   ChevronsLeft, 
//   ChevronsRight,
//   ArrowUpDown,
//   ArrowUp,
//   ArrowDown,
//   CalendarIcon,
//   X,
//   Eye,
//   Download
// } from "lucide-react"
// import { format } from "date-fns"
// import type { Campaign } from "@/lib/interface"
// import { campaignCategories, initialCampaigns } from "@/lib/utils"

// // Types for table functionality
// type SortDirection = 'asc' | 'desc' | null
// type SortField = keyof Campaign | null

// interface TableState {
//   currentPage: number
//   pageSize: number
//   sortField: SortField
//   sortDirection: SortDirection
//   searchTerm: string
//   filters: {
//     category: string
//     status: string
//     dateRange: {
//       from: Date | null
//       to: Date | null
//     }
//     goalRange: {
//       min: string
//       max: string
//     }
//   }
// }

// interface PaginationInfo {
//   totalItems: number
//   totalPages: number
//   currentPage: number
//   pageSize: number
//   startItem: number
//   endItem: number
// }

// export default function CampaignsPage() {
//   const [campaigns] = useState<Campaign[]>(initialCampaigns)
//   const [showMobileFilters, setShowMobileFilters] = useState(false)
  
//   const [tableState, setTableState] = useState<TableState>({
//     currentPage: 1,
//     pageSize: 10,
//     sortField: null,
//     sortDirection: null,
//     searchTerm: "",
//     filters: {
//       category: "All",
//       status: "All",
//       dateRange: {
//         from: null,
//         to: null
//       },
//       goalRange: {
//         min: "",
//         max: ""
//       }
//     }
//   })

//   // Update table state helper
//   const updateTableState = useCallback((updates: Partial<TableState>) => {
//     setTableState(prev => ({
//       ...prev,
//       ...updates,
//       // Reset to page 1 when filters change
//       currentPage: updates.searchTerm !== undefined || updates.filters !== undefined ? 1 : prev.currentPage
//     }))
//   }, [])

//   // Filtered and sorted data
//   const processedData = useMemo(() => {
//     let filtered = campaigns.filter((campaign) => {
//       // Search filter
//       const matchesSearch = tableState.searchTerm === "" || 
//         campaign.title.toLowerCase().includes(tableState.searchTerm.toLowerCase()) ||
//         campaign.overview.toLowerCase().includes(tableState.searchTerm.toLowerCase())

//       // Category filter
//       const matchesCategory = tableState.filters.category === "All" || 
//         campaign.category === tableState.filters.category

//       // Status filter
//       const matchesStatus = tableState.filters.status === "All" || 
//         campaign.status === tableState.filters.status

//       // Date range filter
//       const matchesDateRange = (!tableState.filters.dateRange.from || campaign.endDate >= tableState.filters.dateRange.from) &&
//         (!tableState.filters.dateRange.to || campaign.endDate <= tableState.filters.dateRange.to)

//       // Goal range filter
//       const matchesGoalRange = 
//         (tableState.filters.goalRange.min === "" || campaign.goal >= parseInt(tableState.filters.goalRange.min)) &&
//         (tableState.filters.goalRange.max === "" || campaign.goal <= parseInt(tableState.filters.goalRange.max))

//       return matchesSearch && matchesCategory && matchesStatus && matchesDateRange && matchesGoalRange
//     })

//     // Sort data
//     if (tableState.sortField && tableState.sortDirection) {
//       filtered.sort((a, b) => {
//         const aValue = a[tableState.sortField!]
//         const bValue = b[tableState.sortField!]
        
//         let comparison = 0
//         if (aValue < bValue) comparison = -1
//         if (aValue > bValue) comparison = 1
        
//         return tableState.sortDirection === 'desc' ? -comparison : comparison
//       })
//     }

//     return filtered
//   }, [campaigns, tableState])

//   // Pagination info
//   const paginationInfo: PaginationInfo = useMemo(() => {
//     const totalItems = processedData.length
//     const totalPages = Math.ceil(totalItems / tableState.pageSize)
//     const startItem = (tableState.currentPage - 1) * tableState.pageSize + 1
//     const endItem = Math.min(tableState.currentPage * tableState.pageSize, totalItems)

//     return {
//       totalItems,
//       totalPages,
//       currentPage: tableState.currentPage,
//       pageSize: tableState.pageSize,
//       startItem: totalItems > 0 ? startItem : 0,
//       endItem
//     }
//   }, [processedData.length, tableState.currentPage, tableState.pageSize])

//   // Paginated data
//   const paginatedData = useMemo(() => {
//     const startIndex = (tableState.currentPage - 1) * tableState.pageSize
//     return processedData.slice(startIndex, startIndex + tableState.pageSize)
//   }, [processedData, tableState.currentPage, tableState.pageSize])

//   // Handlers
//   const handleSort = (field: SortField) => {
//     const newDirection: SortDirection = 
//       tableState.sortField === field && tableState.sortDirection === 'asc' ? 'desc' : 'asc'
    
//     updateTableState({
//       sortField: field,
//       sortDirection: newDirection
//     })
//   }

//   const handleDelete = (id: number) => {
//     if (window.confirm("Are you sure you want to delete this campaign?")) {
//       // In real app, this would be an API call
//       console.log(`Delete campaign ${id}`)
//     }
//   }

//   const clearFilters = () => {
//     updateTableState({
//       searchTerm: "",
//       filters: {
//         category: "All",
//         status: "All",
//         dateRange: { from: null, to: null },
//         goalRange: { min: "", max: "" }
//       }
//     })
//   }

//   const hasActiveFilters = useMemo(() => {
//     return tableState.searchTerm !== "" ||
//       tableState.filters.category !== "All" ||
//       tableState.filters.status !== "All" ||
//       tableState.filters.dateRange.from !== null ||
//       tableState.filters.dateRange.to !== null ||
//       tableState.filters.goalRange.min !== "" ||
//       tableState.filters.goalRange.max !== ""
//   }, [tableState])

//   // Render sort icon
//   const renderSortIcon = (field: SortField) => {
//     if (tableState.sortField !== field) {
//       return <ArrowUpDown className="ml-2 h-4 w-4" />
//     }
//     return tableState.sortDirection === 'asc' ? 
//       <ArrowUp className="ml-2 h-4 w-4" /> : 
//       <ArrowDown className="ml-2 h-4 w-4" />
//   }

//   return (
//     <div className="space-y-6 p-4 lg:p-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold">Campaigns</h1>
//           <p className="text-muted-foreground">Manage your fundraising campaigns</p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" size="sm">
//             <Download className="mr-2 h-4 w-4" />
//             Export
//           </Button>
//           <Button asChild>
//             <Link href="/admin/campaigns/create">
//               <Plus className="mr-2 h-4 w-4" /> Create Campaign
//             </Link>
//           </Button>
//         </div>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardHeader className="pb-4">
//           <div className="flex flex-col lg:flex-row gap-4">
//             {/* Search */}
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search campaigns..."
//                 value={tableState.searchTerm}
//                 onChange={(e) => updateTableState({ searchTerm: e.target.value })}
//                 className="pl-9"
//               />
//             </div>

//             {/* Mobile Filter Toggle */}
//             <Button 
//               variant="outline" 
//               className="lg:hidden"
//               onClick={() => setShowMobileFilters(!showMobileFilters)}
//             >
//               <Filter className="mr-2 h-4 w-4" />
//               Filters
//               {hasActiveFilters && <span className="ml-2 h-2 w-2 bg-blue-600 rounded-full" />}
//             </Button>
//           </div>

//           {/* Desktop Filters */}
//           <div className="hidden lg:flex flex-wrap gap-4">
//             <Select 
//               value={tableState.filters.category} 
//               onValueChange={(value) => updateTableState({ 
//                 filters: { ...tableState.filters, category: value }
//               })}
//             >
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Category" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="All">All Categories</SelectItem>
//                 {campaignCategories.map((cat) => (
//                   <SelectItem key={cat} value={cat}>{cat}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Select 
//               value={tableState.filters.status} 
//               onValueChange={(value) => updateTableState({ 
//                 filters: { ...tableState.filters, status: value }
//               })}
//             >
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="All">All Statuses</SelectItem>
//                 <SelectItem value="Active">Active</SelectItem>
//                 <SelectItem value="Inactive">Inactive</SelectItem>
//                 <SelectItem value="Completed">Completed</SelectItem>
//                 <SelectItem value="Draft">Draft</SelectItem>
//               </SelectContent>
//             </Select>

//             {/* Date Range Filter */}
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {tableState.filters.dateRange.from ? (
//                     tableState.filters.dateRange.to ? (
//                       `${format(tableState.filters.dateRange.from, "MMM dd")} - ${format(tableState.filters.dateRange.to, "MMM dd")}`
//                     ) : (
//                       format(tableState.filters.dateRange.from, "MMM dd, yyyy")
//                     )
//                   ) : (
//                     "End date range"
//                   )}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0" align="start">
//                 <div className="p-4">
//                   <div className="space-y-4">
//                     <div>
//                       <label className="text-sm font-medium">From Date</label>
//                       <Calendar
//                         mode="single"
//                         selected={tableState.filters.dateRange.from || undefined}
//                         onSelect={(date) => updateTableState({
//                           filters: {
//                             ...tableState.filters,
//                             dateRange: { ...tableState.filters.dateRange, from: date || null }
//                           }
//                         })}
//                         className="rounded-md border"
//                       />
//                     </div>
//                     <div>
//                       <label className="text-sm font-medium">To Date</label>
//                       <Calendar
//                         mode="single"
//                         selected={tableState.filters.dateRange.to || undefined}
//                         onSelect={(date) => updateTableState({
//                           filters: {
//                             ...tableState.filters,
//                             dateRange: { ...tableState.filters.dateRange, to: date || null }
//                           }
//                         })}
//                         className="rounded-md border"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </PopoverContent>
//             </Popover>

//             {/* Goal Range Filter */}
//             <div className="flex gap-2">
//               <Input
//                 placeholder="Min goal"
//                 type="number"
//                 value={tableState.filters.goalRange.min}
//                 onChange={(e) => updateTableState({
//                   filters: {
//                     ...tableState.filters,
//                     goalRange: { ...tableState.filters.goalRange, min: e.target.value }
//                   }
//                 })}
//                 className="w-[120px]"
//               />
//               <Input
//                 placeholder="Max goal"
//                 type="number"
//                 value={tableState.filters.goalRange.max}
//                 onChange={(e) => updateTableState({
//                   filters: {
//                     ...tableState.filters,
//                     goalRange: { ...tableState.filters.goalRange, max: e.target.value }
//                   }
//                 })}
//                 className="w-[120px]"
//               />
//             </div>

//             {hasActiveFilters && (
//               <Button variant="ghost" onClick={clearFilters}>
//                 <X className="mr-2 h-4 w-4" />
//                 Clear
//               </Button>
//             )}
//           </div>

//           {/* Mobile Filters */}
//           {showMobileFilters && (
//             <div className="lg:hidden space-y-4 pt-4 border-t">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Select 
//                   value={tableState.filters.category} 
//                   onValueChange={(value) => updateTableState({ 
//                     filters: { ...tableState.filters, category: value }
//                   })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="All">All Categories</SelectItem>
//                     {campaignCategories.map((cat) => (
//                       <SelectItem key={cat} value={cat}>{cat}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>

//                 <Select 
//                   value={tableState.filters.status} 
//                   onValueChange={(value) => updateTableState({ 
//                     filters: { ...tableState.filters, status: value }
//                   })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="All">All Statuses</SelectItem>
//                     <SelectItem value="Active">Active</SelectItem>
//                     <SelectItem value="Inactive">Inactive</SelectItem>
//                     <SelectItem value="Completed">Completed</SelectItem>
//                     <SelectItem value="Draft">Draft</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 <Input
//                   placeholder="Min goal"
//                   type="number"
//                   value={tableState.filters.goalRange.min}
//                   onChange={(e) => updateTableState({
//                     filters: {
//                       ...tableState.filters,
//                       goalRange: { ...tableState.filters.goalRange, min: e.target.value }
//                     }
//                   })}
//                 />
//                 <Input
//                   placeholder="Max goal"
//                   type="number"
//                   value={tableState.filters.goalRange.max}
//                   onChange={(e) => updateTableState({
//                     filters: {
//                       ...tableState.filters,
//                       goalRange: { ...tableState.filters.goalRange, max: e.target.value }
//                     }
//                   })}
//                 />
//               </div>

//               {hasActiveFilters && (
//                 <Button variant="ghost" onClick={clearFilters} className="w-full">
//                   <X className="mr-2 h-4 w-4" />
//                   Clear All Filters
//                 </Button>
//               )}
//             </div>
//           )}
//         </CardHeader>

//         <CardContent>
//           {/* Results Summary */}
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
//             <div className="text-sm text-muted-foreground">
//               Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {paginationInfo.totalItems} campaigns
//             </div>
//             <Select 
//               value={tableState.pageSize.toString()} 
//               onValueChange={(value) => updateTableState({ pageSize: parseInt(value), currentPage: 1 })}
//             >
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="10">10 per page</SelectItem>
//                 <SelectItem value="25">25 per page</SelectItem>
//                 <SelectItem value="50">50 per page</SelectItem>
//                 <SelectItem value="100">100 per page</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Desktop Table */}
//           <div className="hidden lg:block overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead 
//                     className="cursor-pointer select-none"
//                     onClick={() => handleSort('title')}
//                   >
//                     <div className="flex items-center">
//                       Title
//                       {renderSortIcon('title')}
//                     </div>
//                   </TableHead>
//                   <TableHead 
//                     className="cursor-pointer select-none"
//                     onClick={() => handleSort('category')}
//                   >
//                     <div className="flex items-center">
//                       Category
//                       {renderSortIcon('category')}
//                     </div>
//                   </TableHead>
//                   <TableHead 
//                     className="cursor-pointer select-none text-right"
//                     onClick={() => handleSort('goal')}
//                   >
//                     <div className="flex items-center justify-end">
//                       Goal
//                       {renderSortIcon('goal')}
//                     </div>
//                   </TableHead>
//                   <TableHead 
//                     className="cursor-pointer select-none text-right"
//                     onClick={() => handleSort('raised')}
//                   >
//                     <div className="flex items-center justify-end">
//                       Raised
//                       {renderSortIcon('raised')}
//                     </div>
//                   </TableHead>
//                   <TableHead 
//                     className="cursor-pointer select-none"
//                     onClick={() => handleSort('status')}
//                   >
//                     <div className="flex items-center">
//                       Status
//                       {renderSortIcon('status')}
//                     </div>
//                   </TableHead>
//                   <TableHead 
//                     className="cursor-pointer select-none"
//                     onClick={() => handleSort('endDate')}
//                   >
//                     <div className="flex items-center">
//                       End Date
//                       {renderSortIcon('endDate')}
//                     </div>
//                   </TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {paginatedData.map((campaign) => (
//                   <TableRow key={campaign.id}>
//                     <TableCell className="font-medium">{campaign.title}</TableCell>
//                     <TableCell>{campaign.category}</TableCell>
//                     <TableCell className="text-right">₹{campaign.goal.toLocaleString()}</TableCell>
//                     <TableCell className="text-right">₹{campaign.raised.toLocaleString()}</TableCell>
//                     <TableCell>
//                       <Badge
//                         variant={
//                           campaign.status === "Active" ? "default" :
//                           campaign.status === "Completed" ? "secondary" : "outline"
//                         }
//                       >
//                         {campaign.status}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{format(campaign.endDate, "MMM dd, yyyy")}</TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-1">
//                         <Button variant="ghost" size="icon" asChild>
//                           <Link href={`/admin/campaigns/${campaign.id}`}>
//                             <Eye className="h-4 w-4" />
//                           </Link>
//                         </Button>
//                         <Button variant="ghost" size="icon" asChild>
//                           <Link href={`/admin/campaigns/update/${campaign.id}`}>
//                             <Edit className="h-4 w-4" />
//                           </Link>
//                         </Button>
//                         <Button variant="ghost" size="icon" onClick={() => handleDelete(campaign.id)}>
//                           <Trash2 className="h-4 w-4 text-red-500" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>

//           {/* Mobile Card Layout */}
//           <div className="lg:hidden space-y-4">
//             {paginatedData.map((campaign) => (
//               <Card key={campaign.id}>
//                 <CardContent className="p-4">
//                   <div className="space-y-3">
//                     <div className="flex items-start justify-between">
//                       <h3 className="font-semibold text-sm">{campaign.title}</h3>
//                       <Badge
//                         variant={
//                           campaign.status === "Active" ? "default" :
//                           campaign.status === "Completed" ? "secondary" : "outline"
//                         }
//                         className="text-xs"
//                       >
//                         {campaign.status}
//                       </Badge>
//                     </div>
                    
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                       <div>
//                         <span className="text-muted-foreground">Category:</span>
//                         <p className="font-medium">{campaign.category}</p>
//                       </div>
//                       <div>
//                         <span className="text-muted-foreground">End Date:</span>
//                         <p className="font-medium">{format(campaign.endDate, "MMM dd, yyyy")}</p>
//                       </div>
//                       <div>
//                         <span className="text-muted-foreground">Goal:</span>
//                         <p className="font-medium">₹{campaign.goal.toLocaleString()}</p>
//                       </div>
//                       <div>
//                         <span className="text-muted-foreground">Raised:</span>
//                         <p className="font-medium">₹{campaign.raised.toLocaleString()}</p>
//                       </div>
//                     </div>

//                     <div className="flex justify-end gap-2">
//                       <Button variant="outline" size="sm" asChild>
//                         <Link href={`/admin/campaigns/${campaign.id}`}>
//                           <Eye className="h-4 w-4 mr-1" />
//                           View
//                         </Link>
//                       </Button>
//                       <Button variant="outline" size="sm" asChild>
//                         <Link href={`/admin/campaigns/update/${campaign.id}`}>
//                           <Edit className="h-4 w-4 mr-1" />
//                           Edit
//                         </Link>
//                       </Button>
//                       <Button variant="outline" size="sm" onClick={() => handleDelete(campaign.id)}>
//                         <Trash2 className="h-4 w-4 mr-1 text-red-500" />
//                         Delete
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           {/* Pagination */}
//           {paginationInfo.totalPages > 1 && (
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
//               <div className="text-sm text-muted-foreground">
//                 Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
//               </div>
              
//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => updateTableState({ currentPage: 1 })}
//                   disabled={paginationInfo.currentPage === 1}
//                 >
//                   <ChevronsLeft className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => updateTableState({ currentPage: paginationInfo.currentPage - 1 })}
//                   disabled={paginationInfo.currentPage === 1}
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </Button>
                
//                 {/* Page Numbers */}
//                 <div className="flex gap-1">
//                   {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
//                     const pageNumber = i + 1
//                     return (
//                       <Button
//                         key={pageNumber}
//                         variant={pageNumber === paginationInfo.currentPage ? "default" : "outline"}
//                         size="sm"
//                         onClick={() => updateTableState({ currentPage: pageNumber })}
//                         className="w-10"
//                       >
//                         {pageNumber}
//                       </Button>
//                     )
//                   })}
//                 </div>

//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => updateTableState({ currentPage: paginationInfo.currentPage + 1 })}
//                   disabled={paginationInfo.currentPage === paginationInfo.totalPages}
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => updateTableState({ currentPage: paginationInfo.totalPages })}
//                   disabled={paginationInfo.currentPage === paginationInfo.totalPages}
//                 >
//                   <ChevronsRight className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* No Results */}
//           {paginatedData.length === 0 && (
//             <div className="text-center py-12">
//               <div className="text-muted-foreground">
//                 {hasActiveFilters ? "No campaigns match your filters." : "No campaigns found."}
//               </div>
//               {hasActiveFilters && (
//                 <Button variant="outline" onClick={clearFilters} className="mt-4">
//                   Clear Filters
//                 </Button>
//               )}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }