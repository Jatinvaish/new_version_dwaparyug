"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, X, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import Image from "next/image";
import type { Campaign, Product } from "@/lib/interface";
import { festivalTypes } from "@/lib/utils";

// Image upload function for API (only called on form submit)
const uploadImages = async (images: (File | string)[]): Promise<string[]> => {
  try {
    // Separate files and base64 strings
    const files = images.filter(img => img instanceof File) as File[];
    const base64Images = images.filter(img => typeof img === 'string') as string[];
    
    const results: string[] = [];
    
    // Upload files via form data
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file images');
      }
      
      const data = await response.json();
      const fileUrls = files.length === 1 ? [data.imageUrl] : data.imageUrls;
      results.push(...fileUrls);
    }
    
    // Upload base64 images via JSON
    if (base64Images.length > 0) {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: base64Images,
          type: base64Images.length === 1 ? 'single' : 'multiple'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload base64 images');
      }
      
      const data = await response.json();
      const base64Urls = base64Images.length === 1 ? [data.imageUrl] : data.imageUrls;
      results.push(...base64Urls);
    }
    
    return results;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper function to create preview URL for local files
const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Simple but effective rich text editor using a textarea with formatting helpers
const RichTextEditor = ({ value, onChange, placeholder }: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string; 
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertText('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertText('*', '*');
          break;
        case 'u':
          e.preventDefault();
          insertText('<u>', '</u>');
          break;
      }
    }
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const linkText = prompt('Enter link text (optional):') || url;
      insertText(`[${linkText}](${url})`);
    }
  };

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <button
          type="button"
          onClick={() => insertText('**', '**')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertText('*', '*')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => insertText('<u>', '</u>')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => insertText('~~', '~~')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertText('# ', '')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertText('## ', '')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertText('### ', '')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Heading 3"
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertText('- ', '')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => insertText('1. ', '')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Numbered List"
        >
          1. List
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={addLink}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Add Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => insertText('> ', '')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Quote"
        >
          " "
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('\n---\n')}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
          title="Horizontal Rule"
        >
          ―
        </button>
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-32 p-3 resize-none border-0 outline-none focus:ring-0"
          rows={8}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          Markdown supported
        </div>
      </div>
    </div>
  );
};

const campaignFormSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "Title must be at least 3 characters long."),
  category_id: z.number().min(1, "Category is required."),
  festival_type: z.string().optional(),
  overview: z.string().min(10, "Overview must be at least 10 characters long."),
  details: z.string().min(20, "Details must be at least 20 characters long."),
  donation_goal: z.coerce.number().min(1, "Donation goal must be at least ₹1."),
  total_raised: z.number().optional(),
  status: z.enum(["Active", "Inactive", "Completed", "Draft"]).optional(),
  image: z.string().min(1, "Banner image is required."),
  images_array: z.array(z.string()).optional(),
  assignedProducts: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string(),
        description: z.string().optional(),
        price: z.number(),
        image: z.string().optional(),
        stock: z.number().optional(),
        unit_id: z.number().optional(),
        min_qty: z.number().optional(),
        max_qty: z.number().optional(),
        increment_count: z.number().optional(),
      }),
    )
    .optional(),
  end_date: z.date({
    required_error: "End date is required.",
  }),
  priority: z.enum(["low", "medium", "high", "critical"]),
  about_campaign: z.string().min(20, "About the campaign must be at least 20 characters long."),
  location: z.string().optional(),
  organizer: z.string().optional(),
  verified: z.boolean().optional(),
  urgency: z.enum(["low", "medium", "high", "urgent", "critical"]).optional(),
  faq_questions: z
    .array(
      z.object({
        question: z.string().min(1, "Question cannot be empty."),
        answer: z.string().min(1, "Answer cannot be empty."),
      }),
    )
    .optional(),
  total_beneficiary: z.number().optional(),
  total_donors_till_now: z.number().optional(),
  total_progress_percentage: z.number().optional(),
  videoLinks: z
    .array(z.object({ url: z.string().url("Must be a valid URL").min(1, "URL cannot be empty.") }))
    .optional(),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

interface CampaignCategory {
  id: number;
  name: string;
  description?: string;
}

interface ProductUnit {
  id: number;
  name: string;
  abbreviation?: string;
}

interface CampaignFormProps {
  campaign?: Campaign | null;
  onSave: (campaign: Campaign) => void;
  onCancel: () => void;
}

// Local image storage interfaces
interface LocalImage {
  file?: File;
  base64?: string;
  url: string;
  isExisting: boolean;
}

export default function CampaignForm({ campaign, onSave, onCancel }: CampaignFormProps) {
  const [categories, setCategories] = useState<CampaignCategory[]>([]);
  const [productUnits, setProductUnits] = useState<ProductUnit[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  
  // Local image storage
  const [bannerImage, setBannerImage] = useState<LocalImage | null>(null);
  const [additionalImages, setAdditionalImages] = useState<LocalImage[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      category_id: 0,
      festival_type: "",
      overview: "",
      details: "",
      donation_goal: 0,
      end_date: undefined,
      image: "",
      images_array: [],
      assignedProducts: [],
      priority: "medium",
      about_campaign: "",
      location: "",
      organizer: "",
      verified: false,
      urgency: "medium",
      faq_questions: [],
      videoLinks: [],
    },
  });

  const {
    fields: videoLinkFields,
    append: appendVideoLink,
    remove: removeVideoLink,
  } = useFieldArray({
    control,
    name: "videoLinks",
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: "faq_questions",
  });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: "assignedProducts",
  });

  // Fetch categories and units from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, unitsResponse] = await Promise.all([
          fetch('/api/campaign-categories'),
          fetch('/api/campaign-product-units')
        ]);

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        if (unitsResponse.ok) {
          const unitsData = await unitsResponse.json();
          setProductUnits(unitsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingUnits(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (campaign) {
      reset({
        ...campaign,
        donation_goal: campaign?.donation_goal,
        end_date: new Date(campaign?.end_date),
        priority: campaign?.priority || "medium",
        about_campaign: campaign?.about_campaign || "",
        location: campaign?.location || "",
        organizer: campaign?.organizer || "",
        verified: campaign?.verified || false,
        urgency: (campaign?.urgency as any) || "medium",
        faq_questions: campaign?.faq_questions || [],
        videoLinks: campaign?.videoLinks?.map(url => ({ url })) || [],
        image: campaign?.image || "",
        images_array: campaign?.images_array || [],
        assignedProducts: campaign?.assignedProducts || [],
      });

      // Set existing images
      if (campaign?.image) {
        setBannerImage({
          url: campaign?.image,
          isExisting: true
        });
      }

      if (campaign?.images_array && campaign?.images_array.length > 0) {
        setAdditionalImages(
          campaign?.images_array.map(url => ({
            url,
            isExisting: true
          }))
        );
      }
    }
  }, [campaign, reset]);

  const onSubmit = async (data: CampaignFormValues) => {
    try {
      // Prepare images for upload
      let bannerImageUrl = data.image;
      let allImageUrls: string[] = [];

      // Handle banner image upload
      if (bannerImage) {
        if (bannerImage.file) {
          // New file upload
          const uploadedUrls = await uploadImages([bannerImage.file]);
          bannerImageUrl = uploadedUrls[0];
        } else if (bannerImage.base64) {
          // Base64 upload
          const uploadedUrls = await uploadImages([bannerImage.base64]);
          bannerImageUrl = uploadedUrls[0];
        } else if (bannerImage.isExisting) {
          // Existing image, use as is
          bannerImageUrl = bannerImage.url;
        }
      }

      // Handle additional images upload
      const imagesToUpload: (File | string)[] = [];
      const existingImageUrls: string[] = [];

      additionalImages.forEach(img => {
        if (img.file) {
          imagesToUpload.push(img.file);
        } else if (img.base64) {
          imagesToUpload.push(img.base64);
        } else if (img.isExisting) {
          existingImageUrls.push(img.url);
        }
      });

      if (imagesToUpload.length > 0) {
        const uploadedUrls = await uploadImages(imagesToUpload);
        allImageUrls = [...existingImageUrls, ...uploadedUrls];
      } else {
        allImageUrls = existingImageUrls;
      }

      const payload = {
        ...data,
        image: bannerImageUrl,
        images_array: allImageUrls,
        end_date: data.end_date.toISOString(),
        videoLinks: data.videoLinks?.map(v => v.url) || [],
        created_by: 1, // Replace with actual user ID from session/auth
        updated_by: 1, // Replace with actual user ID from session/auth
      };

      const url = campaign ? `/api/campaigns/${campaign?.id}` : '/api/campaigns';
      const method = campaign ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save campaign');
      }

      const savedCampaign = await response.json();
      onSave(savedCampaign);
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save campaign'}`);
    }
  };

  const category_id = useWatch({ control, name: "category_id" });

  // Handle banner image selection (local storage)
  const handleBannerImageSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const previewUrl = createPreviewUrl(file);
      
      setBannerImage({
        file,
        base64,
        url: previewUrl,
        isExisting: false
      });
      setValue("image", "temp_banner_image", { shouldValidate: true });
    } catch (error) {
      console.error('Error processing banner image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  // Handle multiple images selection (local storage)
  const handleMultipleImagesSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newImages: LocalImage[] = await Promise.all(
        Array.from(files).map(async (file) => {
          const base64 = await fileToBase64(file);
          const previewUrl = createPreviewUrl(file);
          
          return {
            file,
            base64,
            url: previewUrl,
            isExisting: false
          };
        })
      );

      setAdditionalImages(prev => [...prev, ...newImages]);
      setValue("images_array", [...(additionalImages.map(img => img.url)), ...(newImages.map(img => img.url))], { shouldValidate: true });
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing some images. Please try again.');
    }
  };

  const removeBannerImage = () => {
    if (bannerImage?.url && !bannerImage.isExisting) {
      URL.revokeObjectURL(bannerImage.url);
    }
    setBannerImage(null);
    setValue("image", "");
  };

  const removeAdditionalImage = (index: number) => {
    const imageToRemove = additionalImages[index];
    if (imageToRemove?.url && !imageToRemove.isExisting) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    const updatedImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(updatedImages);
    setValue("images_array", updatedImages.map(img => img.url));
  };

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      // Clean up banner image URL
      if (bannerImage?.url && !bannerImage.isExisting) {
        URL.revokeObjectURL(bannerImage.url);
      }
      
      // Clean up additional image URLs
      additionalImages.forEach(img => {
        if (img.url && !img.isExisting) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, []);

  const selectedCategory = categories.find(cat => cat.id === category_id);

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid gap-6">
          {campaign && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Total Raised (₹)</Label>
                <Input disabled value={campaign?.total_raised?.toLocaleString() || 0} />
              </div>
              <div className="space-y-2">
                <Label>Beneficiaries</Label>
                <Input disabled value={campaign?.total_beneficiary?.toLocaleString() || 0} />
              </div>
              <div className="space-y-2">
                <Label>Donors</Label>
                <Input disabled value={campaign?.total_donors_till_now?.toLocaleString() || 0} />
              </div>
              <div className="space-y-2">
                <Label>Progress</Label>
                {/* <Input disabled value={`${(campaign?.total_progress_percentage || 0)?.toFixed(2)}%`} /> */}
                <Input disabled value={`0%`} />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Controller
                control={control}
                name="category_id"
                render={({ field }) => (
                  <Select 
                    value={field.value?.toString()} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={isLoadingCategories}
                  >
                    <SelectTrigger id="category_id">
                      <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category_id && <p className="text-sm text-red-500">{errors.category_id.message}</p>}
            </div>
            
            {selectedCategory?.name === "Festival Celebration" && (
              <div className="space-y-2">
                <Label htmlFor="festival_type">Festival Type</Label>
                <Controller
                  control={control}
                  name="festival_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="festival_type">
                        <SelectValue placeholder="Select festival type" />
                      </SelectTrigger>
                      <SelectContent>
                        {festivalTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
            </div>
          </div>

          {/* NEW FIELDS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} placeholder="Campaign location" />
              {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organizer">Organizer</Label>
              <Input id="organizer" {...register("organizer")} placeholder="Campaign organizer name" />
              {errors.organizer && <p className="text-sm text-red-500">{errors.organizer.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Controller
                control={control}
                name="urgency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="urgency">
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.urgency && <p className="text-sm text-red-500">{errors.urgency.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="verified">Verified Campaign</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Controller
                  control={control}
                  name="verified"
                  render={({ field }) => (
                    <Checkbox
                      id="verified"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="verified" className="text-sm font-normal">
                  Mark this campaign as verified
                </Label>
              </div>
              {errors.verified && <p className="text-sm text-red-500">{errors.verified.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overview">Overview Title</Label>
            <Input id="overview" {...register("overview")} placeholder="Short summary for cards" />
            {errors.overview && <p className="text-sm text-red-500">{errors.overview.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Detail Title</Label>
            <Textarea id="details" {...register("details")} placeholder="Detailed description for campaign page" />
            {errors.details && <p className="text-sm text-red-500">{errors.details.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="donation_goal">Donation Goal (₹)</Label>
              <Input id="donation_goal" type="number" {...register("donation_goal")} />
              {errors.donation_goal && <p className="text-sm text-red-500">{errors.donation_goal.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Controller
                control={control}
                name="end_date"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.end_date && <p className="text-sm text-red-500">{errors.end_date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="about_campaign">About this Campaign</Label>
            <Controller
              name="about_campaign"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Tell us more about the campaign?..."
                />
              )}
            />
            {errors.about_campaign && <p className="text-sm text-red-500">{errors.about_campaign?.message}</p>}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Video Links</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendVideoLink({ url: "" })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Video
              </Button>
            </div>
            {videoLinkFields.map((field, index) => (
              <div key={field.id} className="relative">
                <Input
                  {...register(`videoLinks.${index}.url`)}
                  placeholder="e.g., https://www.youtube.com/watch?v=..."
                />
                {errors.videoLinks?.[index]?.url && (
                  <p className="text-sm text-red-500 mt-1">{errors.videoLinks[index]?.url?.message}</p>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-8 w-8 text-red-500"
                  onClick={() => removeVideoLink(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>FAQ Questions</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => appendFaq({ question: "", answer: "" })}>
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </div>
            {faqFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-md relative">
                <div className="space-y-2">
                  <Label htmlFor={`faq_questions.${index}.question`}>Question</Label>
                  <Input id={`faq_questions.${index}.question`} {...register(`faq_questions.${index}.question`)} />
                  {errors.faq_questions?.[index]?.question && (
                    <p className="text-sm text-red-500">{errors.faq_questions[index]?.question?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`faq_questions.${index}.answer`}>Answer</Label>
                  <div className="relative">
                    <Textarea id={`faq_questions.${index}.answer`} {...register(`faq_questions.${index}.answer`)} />
                    {errors.faq_questions?.[index]?.answer && (
                      <p className="text-sm text-red-500">{errors.faq_questions[index]?.answer?.message}</p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-8 w-8 text-red-500"
                      onClick={() => removeFaq(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Image Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="bannerImage">Banner Image (Mandatory)</Label>
            <div className="flex items-center gap-4">
              <Input 
                id="bannerImage" 
                type="file" 
                onChange={handleBannerImageSelection} 
                accept="image/*"
              />
              <span className="text-sm text-gray-500">Image will be uploaded when you save the campaign</span>
            </div>
            {bannerImage && (
              <div className="relative w-40 h-24 mt-2">
                <Image
                  src={bannerImage.url}
                  alt="Banner Preview"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                  onClick={removeBannerImage}
                >
                  <X className="h-3 w-3" />
                </Button>
                {!bannerImage.isExisting && (
                  <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-blue-500 text-white text-xs rounded">
                    New
                  </div>
                )}
              </div>
            )}
            {errors.image && <p className="text-sm text-red-500">{errors.image.message}</p>}
          </div>

          {/* Multiple Images Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="additionalImages">Additional Images</Label>
            <div className="flex items-center gap-4">
              <Input
                id="additionalImages"
                type="file"
                multiple
                onChange={handleMultipleImagesSelection}
                accept="image/*"
              />
              <span className="text-sm text-gray-500">Images will be uploaded when you save the campaign</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {additionalImages.map((image, index) => (
                <div key={index} className="relative w-24 h-16">
                  <Image
                    src={image.url}
                    alt={`Additional ${index}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                    onClick={() => removeAdditionalImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {!image.isExisting && (
                    <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-blue-500 text-white text-xs rounded">
                      New
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.images_array && <p className="text-sm text-red-500">{errors.images_array.message as string}</p>}
          </div>

          {/* Campaign Products Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Campaign Products</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendProduct({ 
                  name: "", 
                  description: "", 
                  price: 0, 
                  stock: 0,
                  min_qty: 1,
                  max_qty: 100,
                  increment_count: 1
                })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>
            {productFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Product {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => removeProduct(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`assignedProducts.${index}.name`}>Product Name</Label>
                    <Input 
                      id={`assignedProducts.${index}.name`} 
                      {...register(`assignedProducts.${index}.name`)} 
                      placeholder="Product name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`assignedProducts.${index}.price`}>Price (₹)</Label>
                    <Input 
                      id={`assignedProducts.${index}.price`} 
                      type="number" 
                      {...register(`assignedProducts.${index}.price`, { valueAsNumber: true })} 
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`assignedProducts.${index}.stock`}>Stock Quantity</Label>
                    <Input 
                      id={`assignedProducts.${index}.stock`} 
                      type="number" 
                      {...register(`assignedProducts.${index}.stock`, { valueAsNumber: true })} 
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`assignedProducts.${index}.unit_id`}>Unit</Label>
                    <Controller
                      control={control}
                      name={`assignedProducts.${index}.unit_id`}
                      render={({ field }) => (
                        <Select 
                          value={field.value?.toString()} 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          disabled={isLoadingUnits}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {productUnits.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id.toString()}>
                                {unit.name} {unit.abbreviation && `(${unit.abbreviation})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`assignedProducts.${index}.description`}>Description</Label>
                  <Textarea 
                    id={`assignedProducts.${index}.description`} 
                    {...register(`assignedProducts.${index}.description`)} 
                    placeholder="Product description"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`assignedProducts.${index}.min_qty`}>Min Quantity</Label>
                    <Input 
                      id={`assignedProducts.${index}.min_qty`} 
                      type="number" 
                      {...register(`assignedProducts.${index}.min_qty`, { valueAsNumber: true })} 
                      placeholder="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`assignedProducts.${index}.max_qty`}>Max Quantity</Label>
                    <Input 
                      id={`assignedProducts.${index}.max_qty`} 
                      type="number" 
                      {...register(`assignedProducts.${index}.max_qty`, { valueAsNumber: true })} 
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`assignedProducts.${index}.increment_count`}>Increment Count</Label>
                    <Input 
                      id={`assignedProducts.${index}.increment_count`} 
                      type="number" 
                      {...register(`assignedProducts.${index}.increment_count`, { valueAsNumber: true })} 
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {campaign ? "Updating campaign?..." : "Creating campaign?..."}
              </>
            ) : (
              campaign ? "Update Campaign" : "Create Campaign"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}