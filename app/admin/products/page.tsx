"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { PaginationInfo, Column, FilterOption, DataTable } from "@/components/common/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { IndependentProduct } from "@/lib/interface";
import ProductModal from "@/components/modals/ProductModal";
import { toast } from "@/components/ui/use-toast";

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Types for API response
interface ApiResponse {
  products: IndependentProduct[];
  pagination: PaginationInfo;
}

export default function IndependentProductsPage() {
  const [products, setProducts] = useState<IndependentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API-driven filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // API-driven pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // API-driven sort states
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IndependentProduct | null>(null);

  // Product modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Use refs to track the current values to avoid infinite loops
  const currentParams = useRef({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    filters: {},
    sortField: "",
    sortDirection: "desc" as "asc" | "desc"
  });

  // Update ref when params change
  useEffect(() => {
    currentParams.current = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      searchTerm,
      filters,
      sortField,
      sortDirection
    };
  });

  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [pagination.page, pagination.pageSize, searchTerm, filters, sortField, sortDirection]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      // Add search
      if (searchTerm) params.append('search', searchTerm);
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });
      
      // Add sorting
      if (sortField) {
        params.append('sortBy', sortField);
        params.append('sortOrder', sortDirection);
      }

      const response = await fetch(`/api/independent-products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data: ApiResponse = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination || {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchTerm, filters, sortField, sortDirection]);

  // API-driven handlers
  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleSort = useCallback((column: string, order: 'asc' | 'desc') => {
    setSortField(column);
    setSortDirection(order);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: pageSize, page: 1 }));
  }, []);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setModalMode('create');
    setSelectedProductId(null);
    setFormModalOpen(true);
  }, []);

  const openEditModal = useCallback((product: IndependentProduct) => {
    setModalMode('edit');
    setSelectedProductId(product.id.toString());
    setFormModalOpen(true);
  }, []);

  const openViewModal = useCallback((product: IndependentProduct) => {
    setModalMode('view');
    setSelectedProductId(product.id.toString());
    setFormModalOpen(true);
  }, []);

  const closeFormModal = useCallback(() => {
    setFormModalOpen(false);
    setSelectedProductId(null);
  }, []);

  const handleFormSuccess = useCallback(async () => {
    closeFormModal();
    await fetchProducts();
    toast({
      title: "Success",
      description: "Product saved successfully.",
    });
  }, [fetchProducts]);

  // Delete handlers
  const handleDelete = useCallback((product: IndependentProduct) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/independent-products?id=${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });

      fetchProducts(); // refresh the list
      closeDeleteDialog(); // close dialog and reset
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  }, [productToDelete, fetchProducts]);

  // Define table columns with useMemo to prevent recreation
  const columns: Column<IndependentProduct>[] = useMemo(() => [
    {
      key: "image",
      header: "Image",
      width: "80px",
      render: (value) => (
        <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100">
          {value ? (
            <Image
              src={value}
              alt="Product"
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Product Name",
      sortable: true,
      searchable: true,
      width: '250px',
      render: (value, row) => (
        <div className="max-w-[220px]">
          <div className="font-medium cursor-pointer hover:text-blue-600 truncate" onClick={() => openViewModal(row)}>
            {value}
          </div>
          {row.description && (
            <div className="text-xs text-gray-500 truncate">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      width: '100px',
      render: (value) => `₹${Number(value).toLocaleString()}`,
    },
    {
      key: "unit",
      header: "Unit",
      width: '120px',
      render: (value, row) => {
        if ((row as any).unit) {
          const unit = (row as any).unit;
          return `${unit.name}${unit.abbreviation ? ` (${unit.abbreviation})` : ''}`;
        }
        return "-";
      },
    },
    {
      key: "min_qty",
      header: "Min/Max Qty",
      width: '100px',
      render: (value, row) => (
        <div className="text-xs">
          <div>Min: {value}</div>
          <div>Max: {row.max_qty || '∞'}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      width: '80px',
      filterOptions: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ] as FilterOption[],
      render: (value) => (
        <Badge variant={value === "Active" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "allows_personalization",
      header: "Features",
      filterable: true,
      width: '120px',
      filterOptions: [
        { label: "Personalizable", value: "personalizable" },
        { label: "Flexible Quantity", value: "flexible_qty" },
        { label: "Both", value: "both" },
        { label: "None", value: "none" },
      ] as FilterOption[],
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          {row.allows_personalization && (
            <Badge variant="outline" className="text-xs">
              Personalizable
            </Badge>
          )}
          {row.is_flexible_increment_count && (
            <Badge variant="outline" className="text-xs">
              Flexible Qty
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      width: '120px',
      render: (value) => formatDate(value),
    },
  ], [openViewModal]);

  // Mobile card component with useCallback
  const renderMobileCard = useCallback((product: IndependentProduct, index: number) => (
    <Card key={product.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 shrink-0">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate cursor-pointer hover:text-blue-600" 
                  onClick={() => openViewModal(product)}>
                {product.name}
              </h3>
              {product.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
          </div>
          <Badge variant={product.status === "Active" ? "default" : "secondary"} className="ml-2 shrink-0">
            {product.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Price:</span>
            <p className="font-medium">₹{Number(product.price).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Unit:</span>
            <p className="font-medium">
              {(product as any).unit ? 
                `${(product as any).unit.name}${(product as any).unit.abbreviation ? ` (${(product as any).unit.abbreviation})` : ''}` : 
                '-'
              }
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Min Qty:</span>
            <p className="font-medium">{product.min_qty}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Max Qty:</span>
            <p className="font-medium">{product.max_qty || '∞'}</p>
          </div>
        </div>

        {(product.allows_personalization || product.is_flexible_increment_count) && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.allows_personalization && (
              <Badge variant="outline" className="text-xs">
                Personalizable
              </Badge>
            )}
            {product.is_flexible_increment_count && (
              <Badge variant="outline" className="text-xs">
                Flexible Qty
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => openViewModal(product)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => openEditModal(product)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDelete(product)}
            className="flex-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  ), [openViewModal, openEditModal, handleDelete]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        <DataTable<IndependentProduct>
          // Data
          data={products}
          columns={columns}
          loading={loading}
          error={error}
          pagination={pagination}

          // Header
          title="Independent Products"
          description="Manage and view all your independent products"

          // Add functionality
          onAdd={openCreateModal}
          addButtonLabel="Add Product"
          showAddButton={true}

          // Search (API-driven)
          showSearch={true}
          searchPlaceholder="Search products by name, description..."
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}

          // Filters (API-driven)
          showFilters={true}
          filters={filters}
          onFiltersChange={handleFiltersChange}

          // Sorting (API-driven)
          sortBy={sortField}
          sortOrder={sortDirection}
          onSort={handleSort}

          // Pagination (API-driven)
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}

          // Actions
          onEdit={openEditModal}
          onDelete={handleDelete}
          emptyMessage="No products found"

          // Configuration
          striped={true}
          stickyHeader={true}
          
          // Mobile
          showMobileCards={true}
          mobileCardComponent={renderMobileCard}

          // Column visibility
          showColumnVisibility={true}
        />
      </div>

      {/* Product Modal */}
      <ProductModal
        open={formModalOpen}
        onOpenChange={closeFormModal}
        productId={selectedProductId}
        mode={modalMode}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product &quot;{productToDelete?.name}&quot;.
              This action cannot be undone and may affect existing campaigns that use this product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirmed} 
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// NOTE: The `DataTable` component code and the `useProductsCrud` hook are assumed
// to be available from the user's provided context and are not included in this file.



















// "use client";
// import React, { useState, useEffect, useMemo } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { 
//   Eye, 
//   Edit, 
//   Trash2, 
//   Plus, 
//   Package, 
//   DollarSign,
//   Calendar,
//   User,
//   ImageIcon,
//   CheckCircle,
//   XCircle
// } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { DataTable } from "@/components/common/data-table";

// // Types based on your data structure
// interface Product {
//   id: number;
//   name: string;
//   description: string;
//   price: string;
//   status: string;
//   image: string;
//   min_qty: number;
//   max_qty: number;
//   increment_count: number;
//   unit_id: number;
//   allows_personalization: boolean;
//   is_flexible_increment_count: boolean;
//   created_at: string;
//   updated_at: string;
//   created_by: string;
//   updated_by: string;
// }

// interface PaginationData {
//   page: number;
//   pageSize: number;
//   total: number;
//   totalPages: number;
//   hasNext: boolean;
//   hasPrev: boolean;
// }

// // Sample data from your console log
// const sampleProducts: Product[] = [
//   {
//     id: 1,
//     name: "Organic Almonds",
//     description: "Premium quality organic almonds, rich in nutrients.",
//     price: "499.99",
//     status: "Active",
//     image: "https://example.com/images/almonds.jpg",
//     min_qty: 1,
//     max_qty: 10,
//     increment_count: 1,
//     unit_id: 1,
//     allows_personalization: true,
//     is_flexible_increment_count: true,
//     created_at: "2025-08-06 19:43:35.479764+00",
//     updated_at: "2025-08-06 19:43:35.479764+00",
//     created_by: "101",
//     updated_by: "101"
//   }
// ];

// const samplePagination: PaginationData = {
//   page: 1,
//   pageSize: 10,
//   total: 1,
//   totalPages: 1,
//   hasNext: false,
//   hasPrev: false
// };

// const ProductsDataTable = () => {
//   // State management
//   const [products, setProducts] = useState<Product[]>(sampleProducts);
//   const [pagination, setPagination] = useState<PaginationData>(samplePagination);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filters, setFilters] = useState<Record<string, string>>({});
//   const [selectedRows, setSelectedRows] = useState<string[]>([]);
//   const [sortBy, setSortBy] = useState<string>("");
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

//   // Column definitions
//   const columns = useMemo(() => [
//     {
//       key: "image",
//       header: "Image",
//       width: "80px",
//       render: (value: string, row: Product) => (
//         <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
//           {value ? (
//             <img 
//               src={value} 
//               alt={row.name}
//               className="w-full h-full object-cover"
//               onError={(e) => {
//                 e.currentTarget.style.display = 'none';
//                 e.currentTarget.nextElementSibling.style.display = 'flex';
//               }}
//             />
//           ) : null}
//           <div className="w-full h-full flex items-center justify-center text-muted-foreground">
//             <ImageIcon className="h-4 w-4" />
//           </div>
//         </div>
//       )
//     },
//     {
//       key: "name",
//       header: "Product Name",
//       sortable: true,
//       searchable: true,
//       width: "200px",
//       render: (value: string, row: Product) => (
//         <div className="space-y-1">
//           <div className="font-medium">{value}</div>
//           <div className="text-xs text-muted-foreground">ID: {row.id}</div>
//         </div>
//       )
//     },
//     {
//       key: "description",
//       header: "Description",
//       width: "250px",
//       render: (value: string) => (
//         <div className="max-w-xs">
//           <p className="text-sm text-muted-foreground line-clamp-2" title={value}>
//             {value}
//           </p>
//         </div>
//       )
//     },
//     {
//       key: "price",
//       header: "Price",
//       sortable: true,
//       width: "120px",
//       render: (value: string) => (
//         <div className="flex items-center gap-1">
//           <DollarSign className="h-3 w-3 text-muted-foreground" />
//           <span className="font-medium">₹{value}</span>
//         </div>
//       )
//     },
//     {
//       key: "status",
//       header: "Status",
//       filterable: true,
//       width: "100px",
//       filterOptions: [
//         { label: "Active", value: "Active" },
//         { label: "Inactive", value: "Inactive" },
//         { label: "Draft", value: "Draft" }
//       ],
//       render: (value: string) => (
//         <Badge 
//           variant={value === "Active" ? "default" : value === "Inactive" ? "destructive" : "secondary"}
//         >
//           {value}
//         </Badge>
//       )
//     },
//     {
//       key: "quantity_info",
//       header: "Quantity",
//       width: "150px",
//       render: (value: any, row: Product) => (
//         <div className="space-y-1">
//           <div className="text-xs text-muted-foreground">
//             Min: {row.min_qty} - Max: {row.max_qty}
//           </div>
//           <div className="text-xs">
//             Increment: {row.increment_count}
//           </div>
//         </div>
//       )
//     },
//     {
//       key: "features",
//       header: "Features",
//       width: "140px",
//       render: (value: any, row: Product) => (
//         <div className="flex flex-col gap-1">
//           <div className="flex items-center gap-1">
//             {row.allows_personalization ? (
//               <CheckCircle className="h-3 w-3 text-green-500" />
//             ) : (
//               <XCircle className="h-3 w-3 text-muted-foreground" />
//             )}
//             <span className="text-xs">Personalization</span>
//           </div>
//           <div className="flex items-center gap-1">
//             {row.is_flexible_increment_count ? (
//               <CheckCircle className="h-3 w-3 text-green-500" />
//             ) : (
//               <XCircle className="h-3 w-3 text-muted-foreground" />
//             )}
//             <span className="text-xs">Flexible Qty</span>
//           </div>
//         </div>
//       )
//     },
//     {
//       key: "created_at",
//       header: "Created",
//       sortable: true,
//       width: "120px",
//       render: (value: string) => (
//         <div className="flex items-center gap-1">
//           <Calendar className="h-3 w-3 text-muted-foreground" />
//           <span className="text-xs">
//             {new Date(value).toLocaleDateString()}
//           </span>
//         </div>
//       )
//     }
//   ], []);

//   // Collapsible content for detailed view
//   const collapsibleData = {
//     render: (row: Product) => (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
//         <div className="space-y-3">
//           <h4 className="font-semibold text-sm flex items-center gap-2">
//             <Package className="h-4 w-4" />
//             Product Details
//           </h4>
//           <div className="space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Product ID:</span>
//               <span>{row.id}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Unit ID:</span>
//               <span>{row.unit_id}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Price:</span>
//               <span className="font-medium">₹{row.price}</span>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-3">
//           <h4 className="font-semibold text-sm flex items-center gap-2">
//             <User className="h-4 w-4" />
//             Management Info
//           </h4>
//           <div className="space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Created By:</span>
//               <span>{row.created_by}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Updated By:</span>
//               <span>{row.updated_by}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Last Updated:</span>
//               <span>{new Date(row.updated_at).toLocaleDateString()}</span>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-3">
//           <h4 className="font-semibold text-sm">Full Description</h4>
//           <p className="text-sm text-muted-foreground">{row.description}</p>
          
//           <div className="space-y-2">
//             <h5 className="font-medium text-sm">Product Features:</h5>
//             <div className="flex flex-wrap gap-2">
//               {row.allows_personalization && (
//                 <Badge variant="outline" className="text-xs">
//                   <CheckCircle className="h-3 w-3 mr-1" />
//                   Personalization
//                 </Badge>
//               )}
//               {row.is_flexible_increment_count && (
//                 <Badge variant="outline" className="text-xs">
//                   <CheckCircle className="h-3 w-3 mr-1" />
//                   Flexible Quantity
//                 </Badge>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   };

//   // Event handlers
//   const handleAdd = () => {
//     console.log("Add new product");
//     // Navigate to add product page or open modal
//   };

//   const handleEdit = (product: Product) => {
//     console.log("Edit product:", product);
//     // Navigate to edit page or open modal
//   };

//   const handleView = (product: Product) => {
//     console.log("View product:", product);
//     // Navigate to product detail page or open modal
//   };

//   const handleDelete = (product: Product) => {
//     if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
//       console.log("Delete product:", product);
//       // Call delete API
//       setProducts(prev => prev.filter(p => p.id !== product.id));
//       setSelectedRows(prev => prev.filter(id => id !== String(product.id)));
//     }
//   };

//   const handleSort = (column: string, order: "asc" | "desc") => {
//     setSortBy(column);
//     setSortOrder(order);
//     console.log("Sort by:", column, order);
//     // Implement sorting logic or API call
//   };

//   const handleSearch = (search: string) => {
//     setSearchTerm(search);
//     console.log("Search:", search);
//     // Implement search logic or API call
//   };

//   const handleFiltersChange = (newFilters: Record<string, string>) => {
//     setFilters(newFilters);
//     console.log("Filters:", newFilters);
//     // Implement filter logic or API call
//   };

//   const handlePageChange = (page: number) => {
//     console.log("Page change:", page);
//     setPagination(prev => ({ ...prev, page }));
//     // Implement pagination API call
//   };

//   const handlePageSizeChange = (pageSize: number) => {
//     console.log("Page size change:", pageSize);
//     setPagination(prev => ({ ...prev, pageSize, page: 1 }));
//     // Implement pagination API call
//   };

//   // Mock API calls (replace with your actual API calls)
//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       // Simulate API call
//       setTimeout(() => {
//         setProducts(sampleProducts);
//         setPagination(samplePagination);
//         setLoading(false);
//       }, 1000);
//     } catch (err) {
//       setError("Failed to fetch products");
//       setLoading(false);
//     }
//   };

//   // Load products on component mount
//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Independent Products</h1>
//           <p className="text-muted-foreground">
//             Manage your product catalog and inventory
//           </p>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Total Products</p>
//                 <p className="text-2xl font-bold">{pagination.total}</p>
//               </div>
//               <Package className="h-8 w-8 text-muted-foreground ml-auto" />
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Active Products</p>
//                 <p className="text-2xl font-bold text-green-600">
//                   {products.filter(p => p.status === 'Active').length}
//                 </p>
//               </div>
//               <CheckCircle className="h-8 w-8 text-green-600 ml-auto" />
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Selected Items</p>
//                 <p className="text-2xl font-bold text-blue-600">{selectedRows.length}</p>
//               </div>
//               <Eye className="h-8 w-8 text-blue-600 ml-auto" />
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Total Value</p>
//                 <p className="text-2xl font-bold text-orange-600">
//                   ₹{products.reduce((sum, p) => sum + parseFloat(p.price), 0).toFixed(2)}
//                 </p>
//               </div>
//               <DollarSign className="h-8 w-8 text-orange-600 ml-auto" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Data Table */}
//       <DataTable
//         data={products}
//         columns={columns}
//         loading={loading}
//         error={error}
        
//         // Search
//         showSearch={true}
//         searchTerm={searchTerm}
//         onSearchChange={handleSearch}
//         searchPlaceholder="Search products by name, description..."
        
//         // Filters
//         showFilters={true}
//         filters={filters}
//         onFiltersChange={handleFiltersChange}
        
//         // Sorting
//         sortBy={sortBy}
//         sortOrder={sortOrder}
//         onSort={handleSort}
        
//         // Pagination
//         showPagination={true}
//         currentPage={pagination.page}
//         pageSize={pagination.pageSize}
//         totalCount={pagination.total}
//         onPageChange={handlePageChange}
//         onPageSizeChange={handlePageSizeChange}
        
//         // Selection
//         allowCheckbox={true}
//         selectedRows={selectedRows}
//         onSelectionChange={setSelectedRows}
        
//         // Collapsible
//         isCollapsible={true}
//         collapsibleData={collapsibleData}
        
//         // Actions
//         onAdd={handleAdd}
//         addButtonLabel="Add Product"
//         onEdit={handleEdit}
//         onView={handleView}
//         onDelete={handleDelete}
        
//         // Additional options
//         striped={true}
//         dense={false}
//         stickyHeader={true}
//         emptyMessage="No products found. Start by adding your first product!"
        
//         // Custom empty state
//         noDataComponent={
//           <div className="text-center py-12">
//             <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//             <h3 className="text-lg font-medium mb-2">No products found</h3>
//             <p className="text-muted-foreground mb-4">
//               Get started by adding your first product to the catalog.
//             </p>
//             <Button onClick={handleAdd}>
//               <Plus className="h-4 w-4 mr-2" />
//               Add Product
//             </Button>
//           </div>
//         }
//       />

//       {/* Bulk Actions for Selected Items */}
//       {selectedRows.length > 0 && (
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <span className="font-medium">
//                   {selectedRows.length} product(s) selected
//                 </span>
//                 <div className="flex gap-2">
//                   <Button size="sm" variant="outline">
//                     <Edit className="h-4 w-4 mr-2" />
//                     Bulk Edit
//                   </Button>
//                   <Button size="sm" variant="outline">
//                     <Package className="h-4 w-4 mr-2" />
//                     Update Status
//                   </Button>
//                   <Button size="sm" variant="destructive">
//                     <Trash2 className="h-4 w-4 mr-2" />
//                     Delete Selected
//                   </Button>
//                 </div>
//               </div>
//               <Button 
//                 size="sm" 
//                 variant="ghost"
//                 onClick={() => setSelectedRows([])}
//               >
//                 Clear Selection
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default ProductsDataTable;