"use client"

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Define a generic type for the data and column definitions
interface Column<T> {
  key: string
  title: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface DataTableProps<T> {
  title: string
  data: T[]
  columns: Column<T>[]
  pagination: PaginationInfo
  loading: boolean
  onPageChange: (page: number) => void
  onSort: (field: string) => void
  sortField: string
  sortDirection: "asc" | "desc"
  onPageSizeChange: (size: number) => void
  onSearch: (searchTerm: string) => void
  searchTerm: string
  renderEmptyState?: () => React.ReactNode
  renderActions?: () => React.ReactNode
}

export function DataTable<T>({
  title,
  data,
  columns,
  pagination,
  loading,
  onPageChange,
  onSort,
  sortField,
  sortDirection,
  onPageSizeChange,
  onSearch,
  searchTerm,
  renderEmptyState,
  renderActions,
}: DataTableProps<T>) {

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1" />
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    )
  }

  const startEntry = (pagination.page - 1) * pagination.limit + 1
  const endEntry = startEntry + data.length - 1

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9"
          />
        </div><div className="flex items-center gap-4 w-full sm:w-auto">
          <h2 className="text-2xl font-bold">{title}</h2>
          {renderActions && renderActions()}
        </div>

      </div>

      <Card>
        {loading ? (
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="mt-4 text-muted-foreground">Loading {title.toLowerCase()}...</p>
          </CardContent>
        ) : data.length === 0 ? (
          <CardContent className="p-8 text-center">
            {renderEmptyState ? renderEmptyState() : (
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">No {title.toLowerCase()} found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.key}>
                        {column.sortable ? (
                          <Button
                            variant="ghost"
                            onClick={() => onSort(column.key)}
                            className="h-auto p-0 font-semibold hover:bg-transparent text-left justify-start"
                          >
                            {column.title} {getSortIcon(column.key)}
                          </Button>
                        ) : (
                          <span className="font-semibold">{column.title}</span>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {column.render ? column.render(item) : (item as any)[column.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {startEntry}-{endEntry} of {pagination.total} campaigns
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}