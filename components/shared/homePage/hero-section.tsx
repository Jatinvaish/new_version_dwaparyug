'use client';

import { scaleOnHover } from '@/lib/utils';
import { useScroll, useTransform, motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Gift, ArrowRight, HandHeart, CheckCircle, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
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
  mobile_banner_image?: string;
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
  is_featured?: number;
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
  mobileImage?: string;
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
      params.append('is_featured', '1');
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
    mobileImage: campaign.mobile_banner_image || campaign.image || (campaign.images_array && campaign.images_array[0]) || '/images/placeholder-campaign.jpg',
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

const instantFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15, ease: "easeInOut" },
};

const HeroSlider = ({ slides, loading }: { slides: SliderData[], loading: boolean }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (slides.length > 1 && !loading) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [currentSlide, slides.length, loading]);

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrev();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full h-[500px] overflow-hidden touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ touchAction: 'pan-y' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          {...instantFade}
          className="absolute inset-0"
        >
          <div className="absolute inset-0">
            <Link href={slides[currentSlide].ctaLink} className="cursor-pointer block w-full h-full">
              {/* Desktop Image */}
              <Image
                src={optimizeCloudinaryUrl(slides[currentSlide].image, 1920, 1080)}
                alt={slides[currentSlide].title}
                fill
                className="object-cover cursor-pointer hidden md:block"
                priority
                sizes="100vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
              {/* Mobile Image */}
              <Image
                src={optimizeCloudinaryUrl(slides[currentSlide].mobileImage || slides[currentSlide].image, 768, 1024)}
                alt={slides[currentSlide].title}
                fill
                className="object-cover cursor-pointer md:hidden"
                priority
                sizes="100vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </Link>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          </div>

          {/* Animated progress bar */}
          {slides.length > 1 && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/20">
              <motion.div
                className="h-full bg-yellow-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "linear" }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/80 hover:bg-white z-20 rounded-full"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/80 hover:bg-white z-20 rounded-full"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </Button>
        </>
      )}

      {/* Dotted indicators below the image */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${index === currentSlide
                ? 'w-2 h-2 bg-yellow-400/80 rounded-full shadow-md'
                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50 rounded-full'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HeroSection = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -25]);
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

  // Get featured campaign
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
          pageSize: 20,
        });

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
    return null;
  }

  return (
    <>
      <div className=" ">
        <HeroSlider slides={slides} loading={loading} />
      </div>

      <section className="hidden md:block relative py-8 md:py-16 px-4 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="space-y-6 lg:space-y-8 order-2 lg:order-1"
          >
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.1 }}>
              <div className="inline-flex items-center bg-green-50 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-gray-700 mb-4 sm:mb-6">
                <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-green-600" />
                {loading ? 'Loading...' : `Transforming Lives Since 2025 • ${totalStats.livesImpacted.toLocaleString()}+ Lives Impacted`}
              </div>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.15 }}
            >
              Give Support To{" "}
              <span className="text-green-600">Make Change</span>{" "}
              & Save Lives
            </motion.h1>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.12 }}
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-150 cursor-pointer"
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
              </div>
              <motion.p
                className="text-base text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.12 }}
              >
                💝 You can donate - start from <span className="text-green-600 font-bold">₹65</span>
              </motion.p>
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
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative order-1 lg:order-2"
          >
            <Image
              src={optimizeCloudinaryUrl(featuredCampaign?.image || "", 700, 600)}
              alt={featuredCampaign?.title || "Campaign Impact"}
              width={700}
              height={600}
              className="rounded-xl w-full h-auto"
            />
            <motion.div
              className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 bg-white p-3 sm:p-6 rounded-lg border border-gray-100"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.15, type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 sm:w-12 h-8 sm:h-12 bg-green-50 rounded-full flex items-center justify-center">
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

        {/* Enhanced Fundraising Progress Section - Minimal */}
        {featuredCampaign && !loading && (
          <motion.div
            className="max-w-7xl mx-auto mt-12 sm:mt-16 lg:mt-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            viewport={{ once: true }}
          >
            <div className="grid lg:grid-cols-2 rounded-lg overflow-hidden border border-gray-200">
              <motion.div
                className="bg-yellow-400 p-6 sm:p-8 lg:p-10 relative overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-4 sm:mb-6">Current Campaign Progress</h3>
                <motion.div
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-3 sm:mb-4"
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.15, type: "spring", stiffness: 300 }}
                >
                  {progressPercentage.toFixed(1)}%
                </motion.div>
                <div className="w-full bg-black/20 rounded-full h-3 sm:h-4 mb-6 sm:mb-8">
                  <motion.div
                    className="bg-black h-3 sm:h-4 rounded-full relative"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    transition={{ duration: 1, delay: 0.1 }}
                  />
                </div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-xs sm:text-sm text-black/80 font-medium">Amount Raised</div>
                    <motion.div
                      className="text-lg sm:text-xl lg:text-2xl font-bold text-black"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.1 }}
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
                      transition={{ delay: 0.2, duration: 0.1 }}
                    >
                      {formatCurrency(featuredCampaign.donation_goal)}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="bg-green-600 p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
              >
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
                  transition={{ delay: 0.1, duration: 0.12 }}
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
                  transition={{ delay: 0.15, duration: 0.12 }}
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
            transition={{ duration: 0.15 }}
          >
            <div className="grid lg:grid-cols-2 rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-200 p-6 sm:p-8 lg:p-10 animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-16 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-6"></div>
                <div className="flex justify-between">
                  <div className="h-12 w-24 bg-gray-300 rounded"></div>
                  <div className="h-12 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="bg-gray-300 p-6 sm:p-8 lg:p-10 animate-pulse">
                <div className="h-6 w-32 bg-gray-400 rounded mb-4"></div>
                <div className="h-8 bg-gray-400 rounded mb-4"></div>
                <div className="h-20 bg-gray-400 rounded mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 w-24 bg-gray-400 rounded"></div>
                  <div className="h-4 w-20 bg-gray-400 rounded"></div>
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