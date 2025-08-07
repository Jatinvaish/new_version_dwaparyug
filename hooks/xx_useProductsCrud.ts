// hooks/useProductsCrud.ts
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { IndependentProduct } from '@/lib/interface';

interface ApiResponse {
  products: IndependentProduct[];
  pagination: {
    hasNext: boolean;
    hasPrev: boolean;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface UseProductsCrudReturn {
  // Data
  products: IndependentProduct[];
  loading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Search, filter, and sort states
  searchTerm: string;
  filters: Record<string, string>;
  sortColumn: string | null;
  sortOrder: 'asc' | 'desc' | null;

  // Modal states
  deleteDialogOpen: boolean;
  productToDelete: IndependentProduct | null;
  formModalOpen: boolean;
  modalMode: 'create' | 'edit' | 'view';
  selectedProductId: string | null;

  // Actions
  fetchProducts: (page?: number, pageSize?: number, search?: string, filters?: Record<string, string>, sortColumn?: string, sortOrder?: 'asc' | 'desc') => Promise<void>;
  deleteProduct: () => Promise<void>;
  openCreateModal: () => void;
  openEditModal: (product: IndependentProduct) => void;
  openViewModal: (product: IndependentProduct) => void;
  closeFormModal: () => void;
  openDeleteDialog: (product: IndependentProduct) => void;
  closeDeleteDialog: () => void;
  handleFormSuccess: () => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  handleSearchChange: (search: string) => void;
  handleFiltersChange: (filters: Record<string, string>) => void;
  handleSort: (column: string, order: 'asc' | 'desc') => void;
}

export function useProductsCrud(): UseProductsCrudReturn {
  // Data states
  const [products, setProducts] = useState<IndependentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Search, filter, and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Modal states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IndependentProduct | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Fetch products with all parameters
  const fetchProducts = async (
    page: number = pagination.page,
    pageSize: number = pagination.pageSize,
    search: string = searchTerm,
    currentFilters: Record<string, string> = filters,
    column: string | null = sortColumn,
    order: 'asc' | 'desc' | null = sortOrder
  ) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      // Add search parameter
      if (search.trim()) {
        params.append('search', search.trim());
      }

      // Add filter parameters
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) {
          params.append(`filter[${key}]`, value);
        }
      });

      // Add sort parameters
      if (column && order) {
        params.append('sortBy', column);
        params.append('sortOrder', order);
      }

      const response = await fetch(`/api/independent-products?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ApiResponse = await response.json();

      setProducts(data.products || []);
      setPagination(data.pagination || {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async () => {
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

      // Refresh current page with current search/filter/sort
      await fetchProducts();

    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      closeDeleteDialog();
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProductId(null);
    setFormModalOpen(true);
  };

  const openEditModal = (product: IndependentProduct) => {
    console.log('✌️product --->', product);
    setModalMode('edit');
    setSelectedProductId(product.id.toString());
    setFormModalOpen(true);
  };

  const openViewModal = (product: IndependentProduct) => {
    setModalMode('view');
    setSelectedProductId(product.id.toString());
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setSelectedProductId(null);
  };

  const openDeleteDialog = (product: IndependentProduct) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleFormSuccess = async () => {
    closeFormModal();
    await fetchProducts();
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    fetchProducts(page, pagination.pageSize);
  };

  const handlePageSizeChange = (pageSize: number) => {
    fetchProducts(1, pageSize);
  };

  // Search, filter, and sort handlers
  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    // Reset to first page when searching
    fetchProducts(1, pagination.pageSize, search, filters, sortColumn, sortOrder);
  };

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    // Reset to first page when filtering
    fetchProducts(1, pagination.pageSize, searchTerm, newFilters, sortColumn, sortOrder);
  };

  const handleSort = (column: string, order: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortOrder(order);
    fetchProducts(pagination.page, pagination.pageSize, searchTerm, filters, column, order);
  };

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    // Data
    products,
    loading,
    pagination,

    // Search, filter, and sort states
    searchTerm,
    filters,
    sortColumn,
    sortOrder,

    // Modal states
    deleteDialogOpen,
    productToDelete,
    formModalOpen,
    modalMode,
    selectedProductId,

    // Actions
    fetchProducts,
    deleteProduct,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeFormModal,
    openDeleteDialog,
    closeDeleteDialog,
    handleFormSuccess,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    handleFiltersChange,
    handleSort,
  };
}