// File: components/CampaignForm.tsx

"use client";

import React, { useEffect } from "react";
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
import { CalendarIcon, X, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { Campaign, Product } from "@/lib/interface";
import { campaignCategories, festivalTypes, initialProducts } from "@/lib/utils";

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
  category: z.string().min(1, "Category is required."),
  festivalType: z.string().optional(),
  overview: z.string().min(10, "Overview must be at least 10 characters long."),
  details: z.string().min(20, "Details must be at least 20 characters long."),
  goal: z.coerce.number().min(1, "Donation goal must be at least ₹1."),
  raised: z.number().optional(),
  status: z.enum(["Active", "Inactive", "Completed", "Draft"]).optional(),
  bannerImage: z.union([z.instanceof(File), z.string()]).refine((file) => file, {
    message: "Banner image is required.",
  }),
  additionalImages: z.array(z.union([z.instanceof(File), z.string()])).optional(),
  assignedProducts: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        price: z.number(),
        image: z.string().optional(),
        stock: z.number().optional(),
        unit: z.string().optional(),
      }),
    )
    .optional(),
  endDate: z.date({
    required_error: "End date is required.",
  }),
  priority: z.enum(["low", "medium", "high", "critical"]),
  aboutCampaign: z.string().min(20, "About the campaign must be at least 20 characters long."),
  // New fields
  location: z.string().optional(),
  organizer: z.string().optional(),
  verified: z.boolean().optional(),
  urgency: z.string().optional(),
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

interface CampaignFormProps {
  campaign?: Campaign | null;
  onSave: (campaign: Campaign) => void;
  onCancel: () => void;
}

export default function CampaignForm({ campaign, onSave, onCancel }: CampaignFormProps) {
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
      category: "",
      festivalType: "",
      overview: "",
      details: "",
      goal: 0,
      endDate: undefined,
      bannerImage: undefined,
      additionalImages: [],
      assignedProducts: [],
      priority: "medium",
      aboutCampaign: "",
      location: "",
      organizer: "",
      verified: false,
      urgency: "",
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

  useEffect(() => {
    if (campaign) {
      reset({
        ...campaign,
        goal: campaign.goal,
        endDate: campaign.endDate,
        priority: campaign.priority || "medium",
        aboutCampaign: campaign.aboutCampaign || "",
        location: campaign.location || "",
        organizer: campaign.organizer || "",
        verified: campaign.verified || false,
        urgency: campaign.urgency || "",
        faq_questions: campaign.faq_questions,
        videoLinks: campaign.videoLinks?.map(url => ({ url })) || [],
      });
    }
  }, [campaign, reset]);

  const onSubmit = async (data: CampaignFormValues) => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("category", data.category);
    if (data.festivalType) formData.append("festivalType", data.festivalType);
    formData.append("overview", data.overview);
    formData.append("details", data.details);
    formData.append("goal", String(data.goal));
    formData.append("endDate", data.endDate.toISOString());
    formData.append("priority", data.priority);
    formData.append("aboutCampaign", data.aboutCampaign);
    
    // Add new fields to form data
    if (data.location) formData.append("location", data.location);
    if (data.organizer) formData.append("organizer", data.organizer);
    formData.append("verified", String(data.verified || false));
    if (data.urgency) formData.append("urgency", data.urgency);

    if (data.videoLinks) {
      formData.append("videoLinks", JSON.stringify(data.videoLinks.map(v => v.url)));
    }

    if (data.bannerImage instanceof File) {
      formData.append("bannerImage", data.bannerImage);
    } else if (typeof data.bannerImage === "string") {
      formData.append("bannerImage_url", data.bannerImage);
    }

    if (data.additionalImages) {
      data.additionalImages.forEach((image) => {
        if (image instanceof File) {
          formData.append("additionalImages", image);
        } else if (typeof image === "string") {
          formData.append("additionalImages_url", image);
        }
      });
    }
    
    if (data.faq_questions) {
      formData.append("faq_questions", JSON.stringify(data.faq_questions));
    }

    if (data.assignedProducts) {
      formData.append("assignedProducts", JSON.stringify(data.assignedProducts || []));
    }

    try {
      const response = await fetch("YOUR_API_ENDPOINT", {
        method: campaign ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save campaign.");
      }

      const savedCampaign = await response.json();
      onSave(savedCampaign);
    } catch (error) {
      console.error("Error saving campaign:", error);
    }
  };

  const category = useWatch({ control, name: "category" });
  const assignedProducts = useWatch({ control, name: "assignedProducts" });
  const additionalImages = useWatch({ control, name: "additionalImages" });
  const bannerImage = useWatch({ control, name: "bannerImage" });

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setValue("bannerImage", e.target.files[0], { shouldValidate: true });
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setValue("additionalImages", [...(additionalImages || []), ...newImages], { shouldValidate: true });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setValue(
      "additionalImages",
      additionalImages?.filter((_, i) => i !== index),
    );
  };

  const handleProductAssignment = (product: Product, isChecked: boolean) => {
    if (isChecked) {
      setValue("assignedProducts", [...(assignedProducts || []), product]);
    } else {
      setValue(
        "assignedProducts",
        assignedProducts?.filter((p) => p.id !== product.id),
      );
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid gap-6">
          {campaign && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Total Raised (₹)</Label>
                <Input disabled value={campaign.raised?.toLocaleString() || 0} />
              </div>
              <div className="space-y-2">
                <Label>Beneficiaries</Label>
                <Input disabled value={campaign.total_beneficiary?.toLocaleString() || 0} />
              </div>
              <div className="space-y-2">
                <Label>Donors</Label>
                <Input disabled value={campaign.total_donors_till_now?.toLocaleString() || 0} />
              </div>
              <div className="space-y-2">
                <Label>Progress</Label>
                <Input disabled value={`${(campaign.total_progress_percentage || 0).toFixed(2)}%`} />
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
              <Label htmlFor="category">Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>
            {category === "Festival Celebration" && (
              <div className="space-y-2">
                <Label htmlFor="festivalType">Festival Type</Label>
                <Controller
                  control={control}
                  name="festivalType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="festivalType">
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
              <Label htmlFor="goal">Donation Goal (₹)</Label>
              <Input id="goal" type="number" {...register("goal")} />
              {errors.goal && <p className="text-sm text-red-500">{errors.goal.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Controller
                control={control}
                name="endDate"
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
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutCampaign">About this Campaign</Label>
            <Controller
              name="aboutCampaign"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Tell us more about the campaign..."
                />
              )}
            />
            {errors.aboutCampaign && <p className="text-sm text-red-500">{errors.aboutCampaign.message}</p>}
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

          <div className="space-y-2">
            <Label htmlFor="bannerImage">Banner Image (Mandatory)</Label>
            <Input id="bannerImage" type="file" onChange={handleBannerImageChange} accept="image/*" />
            {bannerImage && (
              <div className="relative w-40 h-24 mt-2">
                <Image
                  src={typeof bannerImage === "string" ? bannerImage : URL.createObjectURL(bannerImage)}
                  alt="Banner Preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            )}
            {errors.bannerImage && <p className="text-sm text-red-500">{errors.bannerImage.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalImages">Additional Images</Label>
            <Input
              id="additionalImages"
              type="file"
              multiple
              onChange={handleAdditionalImagesChange}
              accept="image/*"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {additionalImages?.map((img, index) => (
                <div key={index} className="relative w-24 h-16">
                  <Image
                    src={typeof img === "string" ? img : URL.createObjectURL(img)}
                    alt={`Additional ${index}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                    onClick={() => removeAdditionalImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign Products</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {initialProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`product-${product.id}`}
                    checked={assignedProducts?.some((p) => p.id === product.id) || false}
                    onChange={(e) => handleProductAssignment(product, e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor={`product-${product.id}`} className="flex items-center gap-2">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={24}
                      height={24}
                      className="rounded"
                    />
                    <span>
                      {product.name} (₹{product.price})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Campaign"}
          </Button>
        </div>
      </form>
    </Card>
  );
}