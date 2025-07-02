"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useState, useRef, useCallback } from "react"
import { Upload, Loader2, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Editor } from "@/components/editor"
import { Badge } from "@/components/ui/badge"
import type { BlogPost } from "@/types/blog"
import Image from "next/image"
import { authService } from "@/lib/auth-backend"

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  excerpt: z.string().min(1, "Excerpt is required").max(300, "Excerpt must be less than 300 characters"),
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().min(1, "Featured image is required").url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  readTime: z.string().min(1, "Read time is required"),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metaDescription: z.string().max(160, "Meta description must be less than 160 characters").optional(),
  authorName: z.string().min(1, "Author name is required").max(100, "Author name must be less than 100 characters"),
  authorBio: z.string().min(1, "Author bio is required").max(500, "Author bio must be less than 500 characters"),
  authorTitle: z.string().min(1, "Author title is required").max(100, "Author title must be less than 100 characters"),
  authorProfileImage: z.string().min(1, "Author profile image is required").url("Must be a valid URL"),
  authorTwitter: z.string().optional(),
  authorLinkedin: z.string().optional(),
  authorGithub: z.string().optional(),
  authorWebsite: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface BlogPostFormProps {
  initialData?: Partial<BlogPost>
  onSubmit: (data: FormData) => Promise<void>
}

// Drag and Drop Upload Component
interface DragDropUploadProps {
  onFileSelect: (file: File) => void
  accept: string
  maxSize: number
  isUploading: boolean
  currentImageUrl?: string
  placeholder: string
  className?: string
  isCircular?: boolean
}

const DragDropUpload = ({ 
  onFileSelect, 
  accept, 
  maxSize, 
  isUploading, 
  currentImageUrl, 
  placeholder,
  className = "",
  isCircular = false 
}: DragDropUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  console.log('DragDropUpload maxSize prop:', maxSize) // Debug the maxSize prop

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    console.log('Drop event triggered')
    const files = Array.from(e.dataTransfer.files)
    console.log('Files dropped:', files)
    
    if (files.length > 0) {
      const file = files[0]
      console.log('Selected file:', file.name, file.type, file.size)
      console.log('DragDropUpload component - maxSize limit:', maxSize)
      
      // No validation here - just pass the file to the parent
      onFileSelect(file)
    }
  }, [onFileSelect, maxSize])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('File input changed:', file)
    if (file) {
      console.log('File input - maxSize limit:', maxSize)
      onFileSelect(file)
    }
  }, [onFileSelect, maxSize])

  const handleClick = () => {
    console.log('Click to browse triggered')
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    const result = bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)}KB` : `${Math.round(bytes / (1024 * 1024))}MB`
    console.log('formatFileSize called with:', bytes, 'result:', result)
    return result
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-200
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileInput}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                {placeholder}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Max size: {formatFileSize(maxSize)} • {accept.replace(/image\//g, '').toUpperCase()}
              </p>
            </>
          )}
        </div>
      </div>

      {currentImageUrl && (
        <div className={`relative overflow-hidden bg-muted ${isCircular ? 'w-32 h-32 rounded-full mx-auto' : 'aspect-video w-full max-w-2xl rounded-lg'}`}>
          <Image
            src={currentImageUrl}
            alt="Preview"
            fill
            className="object-cover"
            sizes={isCircular ? "128px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            priority={false}
          />
        </div>
      )}
    </div>
  )
}

export function BlogPostForm({ initialData, onSubmit }: BlogPostFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      imageUrl: initialData?.imageUrl || "",
      category: initialData?.category || "",
      readTime: initialData?.readTime || "",
      published: initialData?.published || false,
      tags: initialData?.tags || [],
      metaDescription: initialData?.metaDescription || "",
      authorName: initialData?.authorProfile?.name || "",
      authorBio: initialData?.authorProfile?.bio || "",
      authorTitle: initialData?.authorProfile?.title || "",
      authorProfileImage: initialData?.authorProfile?.profileImage || "",
      authorTwitter: initialData?.authorProfile?.socialLinks?.twitter || "",
      authorLinkedin: initialData?.authorProfile?.socialLinks?.linkedin || "",
      authorGithub: initialData?.authorProfile?.socialLinks?.github || "",
      authorWebsite: initialData?.authorProfile?.socialLinks?.website || "",
    },
  })

  const handleImageUpload = async (file: File, fieldName: 'imageUrl' | 'authorProfileImage') => {
    console.log('handleImageUpload called with:', file.name, file.type, file.size, 'for field:', fieldName)
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type)
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (different limits for different image types)
    const maxSize = fieldName === 'authorProfileImage' ? (10 * 1024 * 1024) : (5 * 1024 * 1024) // 10MB or 5MB
    const sizeLabel = fieldName === 'authorProfileImage' ? '10MB' : '5MB'
    
    console.log('File size check:', file.size, 'bytes, max allowed:', maxSize, 'bytes')
    
    if (file.size > maxSize) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(1)
      console.error(`File too large: ${file.size} bytes (${actualSizeMB}MB), max allowed: ${maxSize} bytes (${sizeLabel})`)
      toast.error(`Image size is ${actualSizeMB}MB, but should be less than ${sizeLabel}`)
      return
    }

    console.log('File validation passed, starting upload...')
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('Using authService for authenticated upload...')
      const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000'
      const uploadUrl = `${baseUrl}/api/upload/`
      console.log('Upload URL:', uploadUrl)
      
      const response = await authService.authenticatedFetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      console.log('Upload response status:', response.status)
      
      if (!response.ok) {
        const error = await response.json()
        console.error('Upload failed with error:', error)
        throw new Error(error.detail || error.message || 'Upload failed')
      }

      const data = await response.json()
      console.log('Upload successful, response data:', data)
      form.setValue(fieldName, data.url)
      
      const successMessage = fieldName === 'authorProfileImage' ? 'Profile image uploaded successfully' : 'Image uploaded successfully'
      toast.success(successMessage)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
      console.log('Upload process completed')
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const currentTags = form.getValues('tags')
      const newTag = tagInput.trim().toLowerCase()
      
      if (currentTags.includes(newTag)) {
        toast.error('Tag already exists')
        return
      }
      
      if (currentTags.length >= 10) {
        toast.error('Maximum 10 tags allowed')
        return
      }
      
      form.setValue('tags', [...currentTags, newTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags')
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save blog post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter blog post title" {...field} maxLength={200} />
              </FormControl>
              <FormDescription>
                {field.value.length}/200 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief summary of the post" 
                  {...field} 
                  rows={3}
                  maxLength={300}
                />
              </FormControl>
              <FormDescription>
                {field.value.length}/300 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metaDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="SEO meta description" 
                  {...field} 
                  rows={2}
                  maxLength={160}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/160 characters - Used for SEO
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Featured Image</FormLabel>
              <FormControl>
                <DragDropUpload
                  onFileSelect={(file) => {
                    console.log('Featured image file selected:', file)
                    handleImageUpload(file, 'imageUrl')
                  }}
                  accept="image/jpeg,image/png,image/webp"
                  maxSize={5 * 1024 * 1024}
                  isUploading={isUploading}
                  currentImageUrl={field.value}
                  placeholder="Upload featured image"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Technology, Business" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="readTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Read Time</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 5 min read" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Editor
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <Input
                      placeholder="Add a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      maxLength={50}
                    />
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Press Enter to add tags. Maximum 10 tags allowed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold">Author Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Full name" 
                      {...field} 
                      maxLength={100}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/100 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Job title or role" 
                      {...field} 
                      maxLength={100}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/100 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="authorBio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief bio about the author" 
                    {...field} 
                    rows={4}
                    maxLength={500}
                  />
                </FormControl>
                <FormDescription>
                  {field.value.length}/500 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="authorProfileImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author Profile Image</FormLabel>
                <FormControl>
                  <DragDropUpload
                    onFileSelect={(file) => {
                      console.log('Author profile image file selected:', file)
                      handleImageUpload(file, 'authorProfileImage')
                    }}
                    accept="image/jpeg,image/png,image/webp"
                    maxSize={10 * 1024 * 1024}
                    isUploading={isUploading}
                    currentImageUrl={field.value}
                    placeholder="Upload profile image"
                    isCircular={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h4 className="text-md font-medium">Social Links (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="authorTwitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorLinkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorGithub"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourwebsite.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">Publish</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Post'
          )}
        </Button>
      </form>
    </Form>
  )
} 