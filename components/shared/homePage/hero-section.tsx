'use client';

import { scaleOnHover } from '@/lib/utils';
import { useScroll, useTransform, motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Gift, ArrowRight, HandHeart, CheckCircle, Clock, Users, ChevronLeft, ChevronRight, Play, Pause, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { CountUpAnimation } from './counter-up';
import { Button } from '@/components/ui/button';
import Image from "next/image"
import Link from "next/link"

// Types
interface Campaign {
  id: number;
  title: string;
  category_id: number;
  category_name?: string;
  festival_type?: string;
  overview: string;
  details: string;
  about_campaign?: string;
  donation_goal: number;
  total_raised?: any;
  total_progress_percentage?: number;
  image: string;
  images_array?: string[];
  status: 'Draft' | 'Active' | 'Completed' | 'Inactive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  urgency?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  location?: string;
  organizer?: string;
  verified?: boolean;
  total_beneficiary?: number;
  beneficiaries?: number;
  total_donors_till_now?: number;
  start_date?: string;
  end_date: string;
  description?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

interface CampaignFilters {
  selectedCategory?: number | null;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface SliderData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
}

// API Service
const apiService = {
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
const optimizeCloudinaryUrl = (url: string, width = 1600, height = 900) => {
  if (!url) return "/images/placeholder-campaign.jpg";

  // Only modify Cloudinary-hosted images
  if (!url.includes("res.cloudinary.com")) return url;

  return url.replace("/upload/", `/upload/f_auto,q_auto,c_fill,w_${width},h_${height}/`);
};

// Utility functions
const getCategoryGradient = (categoryName?: string): string => {
  if (!categoryName) return 'from-blue-500 to-indigo-600';

  const category = categoryName.toLowerCase();
  const gradients: Record<string, string> = {
    'education': 'from-blue-600 to-purple-700',
    'food': 'from-green-600 to-emerald-700',
    'healthcare': 'from-red-500 to-pink-600',
    'health': 'from-red-500 to-pink-600',
    'women': 'from-yellow-500 to-orange-600',
    'emergency': 'from-red-600 to-orange-600',
    'environment': 'from-green-500 to-teal-600',
    'disaster': 'from-gray-600 to-gray-800',
    'relief': 'from-orange-500 to-red-500',
    'children': 'from-pink-500 to-purple-600',
    'elderly': 'from-indigo-500 to-blue-600'
  };

  for (const key in gradients) {
    if (category.includes(key)) {
      return gradients[key];
    }
  }

  return 'from-blue-500 to-indigo-600';
};

const getCategoryCtaText = (categoryName?: string): string => {
  if (!categoryName) return 'Donate Now';

  const category = categoryName.toLowerCase();
  const ctaTexts: Record<string, string> = {
    'education': 'Support Education',
    'food': 'Fight Hunger',
    'healthcare': 'Support Healthcare',
    'health': 'Support Health',
    'women': 'Empower Women',
    'emergency': 'Provide Relief',
    'environment': 'Save Environment',
    'disaster': 'Disaster Relief',
    'relief': 'Provide Relief',
    'children': 'Help Children',
    'elderly': 'Support Elderly'
  };

  for (const key in ctaTexts) {
    if (category.includes(key)) {
      return ctaTexts[key];
    }
  }

  return 'Donate Now';
};

const transformCampaignsToSlides = (campaigns: Campaign[]): SliderData[] => {
  return campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    subtitle: campaign.category_name || 'Making a Difference',
    description: campaign.overview || campaign.about_campaign || campaign.details || 'Join us in making a positive impact in the community.',
    image: campaign.image || (campaign.images_array && campaign.images_array[0]) || '/images/placeholder-campaign.jpg',
    ctaText: getCategoryCtaText(campaign.category_name),
    ctaLink: `/causes/${campaign.id}`,
    bgGradient: getCategoryGradient(campaign.category_name)
  }));
};

const getDaysRemaining = (endDate?: string): number => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const today = new Date();
  const timeDiff = end.getTime() - today.getTime();
  return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
};

// Ultra-fast animation variants
const fastFadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.12, ease: "easeOut" },
};

const instantFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15, ease: "easeInOut" },
};

const HeroSlider = ({ slides, loading }: { slides: SliderData[], loading: boolean }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (isAutoPlaying && slides.length > 1 && !loading) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 3000); // Reduced from 5000 to 3000

      return () => clearInterval(timer);
    }
  }, [currentSlide, isAutoPlaying, slides.length, loading]);

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // if (loading) {
  //   return (
  //     <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
  //       <div className="text-center text-white">
  //         <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
  //         <p className="text-xl font-semibold">Loading Campaigns...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold">No Active Campaigns Available</p>
          <p className="text-gray-300 mt-2">Check back soon for new opportunities to make a difference</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          {...instantFade}
          className="absolute inset-0"
        >
          <div className="absolute inset-0">
            <Image
              src={optimizeCloudinaryUrl(slides[currentSlide].image, 1920, 1080)}
              alt={slides[currentSlide].title}
              fill
              className="object-cover"
              priority
            />

            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  className="mb-4"
                >
                  <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                    {slides[currentSlide].subtitle}
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.12, delay: 0.02 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                >
                  {slides[currentSlide].title}
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.12, delay: 0.04 }}
                  className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl"
                >
                  {slides[currentSlide].description}
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.12, delay: 0.06 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button
                    className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-150 cursor-pointer"
                    {...scaleOnHover}
                    asChild
                  >
                    <Link href={slides[currentSlide].ctaLink}>
                      <Gift className="w-5 h-5 mr-3" />
                      {slides[currentSlide].ctaText}
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-150 cursor-pointer bg-transparent"
                    {...scaleOnHover}
                    asChild
                  >
                    <Link href="/causes">
                      View All Campaigns
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {slides.length > 1 && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }} // Reduced from 5 to 3
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-150 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform duration-100" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-150 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform duration-100" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-150 ${index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
                  }`}
              />
            ))}
          </div>

          <button
            onClick={toggleAutoPlay}
            className="absolute bottom-6 right-6 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-150"
            aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        </>
      )}
    </div>
  );
};

const HeroSection = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -25]); // Reduced parallax effect
  const y2 = useTransform(scrollY, [0, 300], [0, 25]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculated stats from campaigns
  const totalStats = React.useMemo(() => {
    if (campaigns.length === 0) {
      return { totalDonations: 0, uniqueDonors: 0, livesImpacted: 0 };
    }

    const totalDonations = campaigns.reduce((sum, campaign) => sum + (Number(campaign.total_raised) || 0), 0);
    const uniqueDonors = campaigns.reduce((sum, campaign) => sum + (campaign.total_donors_till_now || 0), 0);
    const livesImpacted = campaigns.reduce((sum, campaign) => sum + (campaign.total_beneficiary || campaign.beneficiaries || 0), 0);

    return { totalDonations, uniqueDonors, livesImpacted };
  }, [campaigns]);

  // Get featured campaign (highest priority + active status)
  const featuredCampaign = React.useMemo(() => {
    if (campaigns.length === 0) return null;

    const activeCampaigns = campaigns.filter(c => c.status === 'Active');
    if (activeCampaigns.length === 0) return campaigns[0];

    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    return activeCampaigns.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return (Number(b.total_raised) || 0) - (Number(a.total_raised) || 0);
    })[0];
  }, [campaigns]);

  // Transform campaigns to slides
  const slides = React.useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.status === 'Active');
    const sortedCampaigns = activeCampaigns.length > 0 ? activeCampaigns : campaigns;
    return transformCampaignsToSlides(sortedCampaigns.slice(0, 6));
  }, [campaigns]);

  // Progress percentage for featured campaign
  const progressPercentage = React.useMemo(() => {
    if (!featuredCampaign || !featuredCampaign.donation_goal) return 0;
    return Math.min(100, (Number(featuredCampaign.total_raised) || 0) / featuredCampaign.donation_goal * 100);
  }, [featuredCampaign]);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        const { campaigns: fetchedCampaigns } = await apiService.fetchCampaigns({
          page: 1,
          pageSize: 20
        });

        if (fetchedCampaigns.length === 0) {
          throw new Error('No campaigns found');
        }

        setCampaigns(fetchedCampaigns);
      } catch (err) {
        console.error('Error loading campaigns:', err);
        setError(err instanceof Error ? err.message : 'Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString()}`;
  };

  if (error && campaigns.length === 0) {
    return (
      <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden bg-gradient-to-br from-red-600 to-pink-700 flex items-center justify-center">
        <div className="text-center text-white">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold mb-2">Unable to Load Campaigns</p>
          <p className="text-red-200">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-white text-red-600 hover:bg-gray-100"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroSlider slides={slides} loading={loading} />

      <section className="relative py-10 sm:py-16 lg:py-20 px-4 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        {/* Faster animated background elements */}
        <motion.div
          className="absolute top-10 sm:top-20 right-10 sm:right-20 text-green-600 opacity-20"
          style={{ y: y1 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }} // Reduced from 20
        >
          <Heart className="w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 fill-current" />
        </motion.div>

        <motion.div
          className="absolute top-20 sm:top-40 right-20 sm:right-40 text-yellow-400 opacity-30"
          style={{ y: y2 }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }} // Reduced from 15
        >
          <div className="w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 bg-yellow-400 transform rotate-45 rounded-lg"></div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 text-blue-400 opacity-20"
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} // Reduced movement
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }} // Reduced from 4
        >
          <Sparkles className="w-12 sm:w-18 lg:w-24 h-12 sm:h-18 lg:h-24" />
        </motion.div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }} // Reduced from 1
            className="space-y-6 lg:space-y-8 order-2 lg:order-1"
          >
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.1 }}>
              <div className="inline-flex items-center bg-gradient-to-r from-yellow-100 to-green-100 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-gray-700 mb-4 sm:mb-6">
                <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-yellow-600" />
                {loading ? 'Loading...' : `Transforming Lives Since 2025 • ${totalStats.livesImpacted.toLocaleString()}+ Lives Impacted`}
              </div>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.15 }}
            >
              Give Support To{" "}
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-500"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }} // Reduced from 3
              >
                Make Change
              </motion.span>{" "}
              & Save Lives
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.12 }}
            >
              {featuredCampaign?.about_campaign || featuredCampaign?.overview ||
                "Dwaparyug Foundation is India's most trusted humanitarian nonprofit organization. We serve underprivileged communities across multiple locations, providing essential services and programs that create lasting positive change."}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.12 }}
            >
              <Button
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-150 cursor-pointer"
                {...scaleOnHover}
                asChild
              >
                <Link href="/causes">
                  <Gift className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                  Start Donating Now
                  <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 sm:ml-3" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-150 cursor-pointer bg-transparent"
                {...scaleOnHover}
                asChild
              >
                <Link href="/volunteer">
                  <HandHeart className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                  Become a Volunteer
                </Link>
              </Button>
            </motion.div>

            {!loading && (
              <motion.div
                className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.15 }}
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    <CountUpAnimation end={totalStats.totalDonations} />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Donations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    <CountUpAnimation end={totalStats.uniqueDonors} />+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Unique Donors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    <CountUpAnimation end={totalStats.livesImpacted} />+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Lives Impacted</div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }} // Reduced from 1
            className="relative order-1 lg:order-2"
          >
            <motion.div
              className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-green-400 to-yellow-400 rounded-xl sm:rounded-2xl opacity-20 blur-xl"
              animate={{ scale: [1, 1.02, 1] }} // Reduced scale change
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }} // Reduced from 3
            />
            <Image
              src={optimizeCloudinaryUrl(featuredCampaign?.image || "", 700, 600)}
              alt={featuredCampaign?.title || "Campaign Impact"}
              width={700}
              height={600}
              className="rounded-xl sm:rounded-2xl shadow-2xl relative z-10 w-full h-auto"
            />
            <motion.div
              className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.15, type: "spring", stiffness: 300 }} // Faster spring
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 sm:w-12 h-8 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 sm:w-6 h-4 sm:h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm sm:text-base">Impact Verified</div>
                  <div className="text-xs sm:text-sm text-gray-600">100% Transparency</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Fundraising Progress Section */}
        {featuredCampaign && !loading && (
          <motion.div
            className="max-w-7xl mx-auto mt-12 sm:mt-16 lg:mt-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }} // Reduced from 0.8
            viewport={{ once: true }}
          >
            <div className="grid lg:grid-cols-2 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
              <motion.div
                className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-6 sm:p-8 lg:p-10 relative overflow-hidden"
                whileHover={{ scale: 1.01 }} // Reduced from 1.02
                transition={{ duration: 0.15 }}
              >
                <motion.div
                  className="absolute top-0 right-0 w-20 sm:w-24 lg:w-32 h-20 sm:h-24 lg:h-32 bg-white/10 rounded-full -mr-10 sm:-mr-12 lg:-mr-16 -mt-10 sm:-mt-12 lg:-mt-16"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }} // Reduced from 20
                />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-4 sm:mb-6">Current Campaign Progress</h3>
                <motion.div
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-3 sm:mb-4"
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.15, type: "spring", stiffness: 300 }} // Faster spring
                >
                  {progressPercentage.toFixed(1)}%
                </motion.div>
                <div className="w-full bg-black/20 rounded-full h-3 sm:h-4 mb-6 sm:mb-8">
                  <motion.div
                    className="bg-black h-3 sm:h-4 rounded-full relative"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    transition={{ duration: 1, delay: 0.1 }} // Reduced from 2 and 0.5
                  >
                    <motion.div
                      className="absolute right-0 top-0 w-5 sm:w-6 h-5 sm:h-6 bg-black rounded-full -mt-1 -mr-1"
                      animate={{ scale: [1, 1.1, 1] }} // Reduced scale change
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }} // Reduced from 2
                    />
                  </motion.div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-xs sm:text-sm text-black/80 font-medium">Amount Raised</div>
                    <motion.div
                      className="text-lg sm:text-xl lg:text-2xl font-bold text-black"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.1 }} // Reduced delay and duration
                    >
                      {formatCurrency(Number(featuredCampaign.total_raised) || 0)}
                    </motion.div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-black/80 font-medium">Target Goal</div>
                    <motion.div
                      className="text-lg sm:text-xl lg:text-2xl font-bold text-black"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.1 }} // Reduced delay and duration
                    >
                      {formatCurrency(featuredCampaign.donation_goal)}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="bg-gradient-to-br from-green-600 to-green-700 p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden"
                whileHover={{ scale: 1.01 }} // Reduced from 1.02
                transition={{ duration: 0.15 }}
              >
                <motion.div
                  className="absolute bottom-0 left-0 w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 bg-white/10 rounded-full -ml-8 sm:-ml-10 lg:-ml-12 -mb-8 sm:-mb-10 lg:-mb-12"
                  animate={{ scale: [1, 1.05, 1] }} // Reduced scale change
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }} // Reduced from 3
                />
                <div className="inline-block bg-green-500 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                  {featuredCampaign.category_name ? `🌟 ${featuredCampaign.category_name}` : '🎯 Featured Campaign'}
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
                  {featuredCampaign.title}
                </h3>
                <p className="text-green-100 text-sm sm:text-base lg:text-lg leading-relaxed">
                  {featuredCampaign.overview || featuredCampaign.about_campaign || featuredCampaign.details ||
                    'Join us in making a positive impact. Your contribution directly supports this important cause and helps create meaningful change in the community.'}
                </p>
                <motion.div
                  className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.12 }} // Reduced delay and duration
                >
                  <div className="flex items-center text-xs sm:text-sm">
                    <Clock className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    <span>
                      {getDaysRemaining(featuredCampaign.end_date) > 0
                        ? `${getDaysRemaining(featuredCampaign.end_date)} days remaining`
                        : 'Campaign ended'
                      }
                    </span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <Users className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    <span>{(featuredCampaign.total_donors_till_now || 0).toLocaleString()} donors</span>
                  </div>
                  {featuredCampaign.location && (
                    <div className="flex items-center text-xs sm:text-sm">
                      <span className="w-2 h-2 bg-green-300 rounded-full mr-2" />
                      <span>{featuredCampaign.location}</span>
                    </div>
                  )}
                </motion.div>
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.12 }} // Reduced delay and duration
                >
                  <Link
                    href={`/causes/${featuredCampaign.id}`}
                    className="inline-flex items-center text-white hover:text-green-200 font-semibold transition-colors duration-150"
                  >
                    <span>Learn More About This Campaign</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Loading State for Progress Section */}
        {loading && (
          <motion.div
            className="max-w-7xl mx-auto mt-12 sm:mt-16 lg:mt-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }} // Reduced from 0.8
          >
            <div className="grid lg:grid-cols-2 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-br from-gray-300 to-gray-400 p-6 sm:p-8 lg:p-10 animate-pulse">
                <div className="h-8 bg-gray-400 rounded mb-4"></div>
                <div className="h-16 bg-gray-400 rounded mb-4"></div>
                <div className="h-4 bg-gray-400 rounded mb-6"></div>
                <div className="flex justify-between">
                  <div className="h-12 w-24 bg-gray-400 rounded"></div>
                  <div className="h-12 w-24 bg-gray-400 rounded"></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-400 to-gray-500 p-6 sm:p-8 lg:p-10 animate-pulse">
                <div className="h-6 w-32 bg-gray-500 rounded mb-4"></div>
                <div className="h-8 bg-gray-500 rounded mb-4"></div>
                <div className="h-20 bg-gray-500 rounded mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 w-24 bg-gray-500 rounded"></div>
                  <div className="h-4 w-20 bg-gray-500 rounded"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </>
  )
}

export default HeroSection