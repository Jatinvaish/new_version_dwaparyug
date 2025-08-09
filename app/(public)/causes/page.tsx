'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Grid,
  List,
  Users,
  MapPin,
  Gift,
  Heart,
  Target,
  Calendar,
  ArrowRight,
  Shield,
  Star,
  TrendingUp,
  Clock,
  Award,
  Zap
} from 'lucide-react';
import { Category, CampaignFilters, Campaign, CampaignListProps, PaginationState } from '@/lib/interface';

// API Service
const apiService = {
  fetchCategories: async (): Promise<Category[]> => {
    try {
      const response = await fetch('/api/campaign-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  fetchCampaigns: async (filters: CampaignFilters = {}): Promise<{ campaigns: Campaign[], pagination: PaginationState }> => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.selectedCategory) params.append('category_id', filters.selectedCategory.toString());
      if (filters.searchTerm) params.append('search', filters.searchTerm);

      const response = await fetch(`/api/campaigns?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return await response.json();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return { campaigns: [], pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
    }
  }
};

// Enhanced urgency color mapping with gradients
const urgencyColors = {
  High: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
  Medium: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30',
  Low: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-green-500/30'
};

// Category Filter Component with enhanced design
const CategoryFilter: React.FC<{
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (id: number | null) => void;
  loading: boolean;
}> = ({ categories, selectedCategory, onCategoryChange, loading }) => {
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex-shrink-0 whitespace-nowrap transform hover:scale-105 ${!selectedCategory
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-md hover:shadow-lg'
            }`}
        >
          <Star className="w-4 h-4 mr-2 inline" />
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex-shrink-0 whitespace-nowrap transform hover:scale-105 ${selectedCategory === category.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-md hover:shadow-lg'
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// Enhanced Search Component
const SearchBar: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  showViewToggle: boolean;
}> = ({ searchTerm, onSearchChange, viewMode, onViewModeChange, showViewToggle }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
      <div className="relative flex-1 max-w-xl w-full">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for meaningful causes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-base transition-all duration-300 bg-white shadow-lg hover:shadow-xl"
        />
      </div>

      {showViewToggle && (
        <div className="flex bg-gray-100 rounded-2xl p-1 shadow-inner">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-md transform scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            title="Grid view"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-md transform scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            title="List view"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// Ultra Enhanced Campaign Card Component
const CampaignCard: React.FC<{
  campaign: Campaign;
  viewMode: 'grid' | 'list';
  onDonate?: (campaignId: number) => void;
  onFavorite?: (campaignId: number) => void;
  onViewDetails?: (campaignId: number) => void;
}> = ({ campaign, viewMode, onDonate, onFavorite, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const router = useRouter();

  const percentage = campaign.donation_goal > 0
    ? Math.round((campaign.total_raised / campaign.donation_goal) * 100)
    : 0;

  const endDate = new Date(campaign.end_date);
  const now = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft <= 0;

  const handleCardClick = () => {
    router.push(`/causes/${campaign.id}`);
    onViewDetails?.(campaign.id);
  };

  const handleDonate = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/causes/${campaign.id}`);
    onDonate?.(campaign.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.(campaign.id);
  };

  // Dynamic urgency based on days left and progress
  const getUrgency = () => {
    if (isExpired) return null;
    if (daysLeft <= 7 || percentage < 30) return 'High';
    if (daysLeft <= 30 || percentage < 60) return 'Medium';
    return 'Low';
  };

  const urgency = campaign.urgency || getUrgency();

  // Get progress color based on percentage
  const getProgressColor = () => {
    if (percentage >= 100) return 'from-emerald-500 to-green-500';
    if (percentage >= 75) return 'from-blue-500 to-cyan-500';
    if (percentage >= 50) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-pink-500';
  };

  if (viewMode === 'list') {
    return (
      <div
        className="group bg-white rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 p-6 mb-4 cursor-pointer overflow-hidden relative"
        style={{
          background: isHovered
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)'
            : 'white',
          transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <div className="flex gap-6">
          <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden rounded-2xl">
            <img
              src={campaign.image || '/api/placeholder/128/128'}
              alt={campaign.title}
              className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 brightness-110' : 'scale-100'
                }`}
            />
            {isExpired && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40 flex items-center justify-center">
                <span className="text-white text-sm font-bold bg-red-500/90 px-3 py-1 rounded-full">Expired</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm px-4 py-2 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-300">
                    {campaign.category_name}
                  </span>

                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Tax Benefit
                  </div>

                  {urgency && !isExpired && (
                    <span className={`text-sm px-4 py-2 rounded-full font-bold transform hover:scale-105 transition-all duration-300 ${urgencyColors[urgency as keyof typeof urgencyColors]}`}>
                      <Zap className="w-3 h-3 inline mr-1" />
                      {urgency}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-all duration-300">
                  {campaign.title}
                </h3>
                <p className="text-gray-600 text-base line-clamp-2 leading-relaxed">{campaign.overview}</p>
              </div>

              <button
                onClick={handleFavorite}
                className={`ml-4 flex-shrink-0 p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${isFavorited
                    ? 'text-red-500 bg-red-50 shadow-lg shadow-red-500/20'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="mt-auto">
              <div className="flex justify-between items-center mb-3">
                <div className="flex-1 mr-6">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-gray-700">₹{campaign.total_raised?.toLocaleString() || '0'} raised</span>
                    <span className={`font-bold text-lg ${percentage >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700 shadow-lg relative`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Goal: ₹{campaign.donation_goal?.toLocaleString() || '0'}</span>
                    {daysLeft > 0 && (
                      <span className="flex items-center font-medium">
                        <Clock className="w-3 h-3 mr-1" />
                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                      </span>
                    )}
                  </div>
                </div>

                {!isExpired && (
                  <button
                    onClick={handleDonate}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-2xl transition-all duration-300 flex items-center transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Donate
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                <div className="flex items-center font-medium">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  <span>{campaign.beneficiaries || 0} beneficiaries</span>
                </div>
                {campaign.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                    <span className="truncate max-w-32">{campaign.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Keep original desktop card design
  return (
    <div
      className="bg-white rounded-lg border-2 hover:shadow-1xl transition-all duration-500 overflow-hidden cursor-pointer h-full flex flex-col group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      style={{
        transform: isHovered ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="relative overflow-hidden">
        <img
          src={campaign.image || '/api/placeholder/400/300'}
          alt={campaign.title}
          className={`w-full h-48 sm:h-56 object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'
            }`}
        />


        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            {campaign.category_name}
          </span>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs sm:text-sm px-3 py-1 rounded-full font-semibold flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Tax Benefit
          </div>


        </div>

        {/* <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
          <Calendar className="w-3 h-3 inline mr-1" />
          {endDate.toLocaleDateString()}
        </div>

      */}

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 flex items-end justify-center pb-6 ${isHovered ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <button className="bg-white text-black hover:bg-gray-100 px-6 py-2 rounded-full font-semibold flex items-center transition-colors">
            View Details
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      <div className=" sm:p-6 flex-1 flex flex-col">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {campaign.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm sm:text-base flex-1">
          {campaign.overview}
        </p>

        <div className="space-y-4 mt-auto">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Progress</span>
            <span className={`font-bold ${percentage >= 100 ? 'text-green-600' : 'text-green-600'}`}>
              {percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${percentage >= 100 ? 'bg-green-600' : 'bg-green-500'
                }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Raised: ₹{campaign.total_raised?.toLocaleString() || '0'}</span>
            <span>Goal: ₹{campaign.donation_goal?.toLocaleString() || '0'}</span>
          </div>

          {daysLeft > 0 && (
            <div className="text-center">
              <span className="text-sm text-gray-600">
                <strong>{daysLeft}</strong> day{daysLeft !== 1 ? 's' : ''} remaining
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{campaign.beneficiaries || 0} beneficiaries</span>
            </div>
            {campaign.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="truncate max-w-32">{campaign.location}</span>
              </div>
            )}
          </div>

          <div className={`flex mt-6 ${isExpired ? 'justify-center' : 'space-x-3'}`}>
            {isExpired ? (
              <button
                disabled
                className="flex-1 bg-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg cursor-not-allowed"
              >
                Campaign Ended
              </button>
            ) : (
              <button
                onClick={handleDonate}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center transform hover:scale-105"
              >
                <Gift className="w-4 h-4 mr-2" />
                Donate Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Loading Component
const LoadingSkeleton: React.FC<{ viewMode: 'grid' | 'list'; count?: number }> = ({ viewMode, count = 8 }) => {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl border shadow-xl p-6">
            <div className="flex gap-6">
              <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
              <div className="flex-1 space-y-4">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-1/3" />
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-3/4" />
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-full" />
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl border shadow-xl overflow-hidden">
          <div className="h-56 sm:h-64 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          <div className="p-6 sm:p-8 space-y-4">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-3/4" />
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-full" />
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-full" />
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-full" />
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Enhanced Pagination Component
const IPagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex justify-center items-center flex-wrap gap-3 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-blue-300 text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
      >
        Previous
      </button>

      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-3 text-gray-500 font-semibold">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={`px-5 py-3 rounded-2xl text-base font-semibold transition-all duration-300 transform hover:scale-105 ${currentPage === page
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl scale-105'
                  : 'bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300 text-gray-700 shadow-lg hover:shadow-xl'
                }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-blue-300 text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
      >
        Next
      </button>
    </div>
  );
};

// Enhanced Main Reusable Campaign List Component
const CampaignList: React.FC<any> = ({
  title = "Browse Campaigns",
  subtitle = "Discover meaningful causes and make an impact",
  showHeader = true,
  showCategoryFilter = true,
  showSearch = true,
  showPagination = true,
  showViewToggle = true,
  defaultViewMode = 'grid',
  pageSize = 12,
  categoryFilter = null,
  maxItems,
  showCreateButton = false,
  className = "",
  // Callback props for dynamic behavior
  onCampaignClick,
  onDonate,
  onFavorite,
  customFilters = {}
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultViewMode);

  const [filters, setFilters] = useState({
    selectedCategory: categoryFilter,
    searchTerm: '',
    page: 1,
    pageSize: maxItems || pageSize,
    ...customFilters
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: maxItems || pageSize,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch categories
  useEffect(() => {
    if (showCategoryFilter) {
      const loadCategories = async () => {
        setCategoriesLoading(true);
        try {
          const categoriesData = await apiService.fetchCategories();
          setCategories(categoriesData);
        } catch (error) {
          console.error('Failed to load categories:', error);
          setCategories([]);
        } finally {
          setCategoriesLoading(false);
        }
      };
      loadCategories();
    }
  }, [showCategoryFilter]);

  // Fetch campaigns
  useEffect(() => {
    const loadCampaigns = async () => {
      setLoading(true);
      try {
        const data = await apiService.fetchCampaigns(filters);
        const campaignsToShow = maxItems ? data.campaigns.slice(0, maxItems) : data.campaigns;
        setCampaigns(campaignsToShow);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [filters, maxItems]);

  const handleCategoryChange = (categoryId: number | null) => {
    setFilters((prev: any) => ({ ...prev, selectedCategory: categoryId, page: 1 }));
  };

  const handleSearchChange = (searchTerm: string) => {
    setFilters((prev: any) => ({ ...prev, searchTerm, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: any) => ({ ...prev, page }));
  };

  const handleViewDetails = (campaignId: number) => {
    onCampaignClick?.(campaignId);
  };

  const handleDonate = (campaignId: number) => {
    onDonate?.(campaignId);
  };

  const handleFavorite = (campaignId: number) => {
    onFavorite?.(campaignId);
  };

  return (
    <div className={`${className} w-full mb-12`}>
      {showHeader && (
        <div className="text-center mb-12 lg:mb-16 px-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6 lg:mb-8">
            {title}
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6 rounded-full"></div>
        </div>
      )}

      <div className="  max-w-7xl mx-auto">
        {showCategoryFilter && (
          <CategoryFilter
            categories={categories}
            selectedCategory={filters.selectedCategory}
            onCategoryChange={handleCategoryChange}
            loading={categoriesLoading}
          />
        )}

        {showSearch && (
          <SearchBar
            searchTerm={filters.searchTerm}
            onSearchChange={handleSearchChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showViewToggle={showViewToggle}
          />
        )}

        {loading ? (
          <LoadingSkeleton viewMode={viewMode} count={maxItems || 8} />
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="  rounded-3xl shadow-2xl p-12 max-w-md mx-auto">
              <Target className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No campaigns found</h3>
              <p className="text-gray-600 leading-relaxed">
                {filters.searchTerm || filters.selectedCategory
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "No campaigns are currently available. Please check back later."}
              </p>
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4'
              : 'space-y-6'
          }>
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                viewMode={viewMode}
                onDonate={handleDonate}
                onFavorite={handleFavorite}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {showPagination && !maxItems && campaigns.length > 0 && (
          <IPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {showCreateButton && (
        <div className="text-center mt-16 px-4">
          <button className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 hover:from-purple-700 hover:via-pink-700 hover:to-purple-900 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25 text-lg">
            <Target className="w-6 h-6 mr-3 inline" />
            Create Campaign
            <Award className="w-6 h-6 ml-3 inline" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignList;