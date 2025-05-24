"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useActionState } from "@/hooks/useActionState"
import toast, { Toaster } from 'react-hot-toast'
import { ArrowLeft, ArrowRight, Send, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

function ApplicationForm() {
  const router = useRouter()
  const { id } = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)

  // Fetch job-specific questions
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['jobQuestions', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await fetch(`/api/jobs/${id}/questions`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch questions');
      }
      return response.json();
    },
    enabled: !!id
  })

  // Fetch job details
  const { data: job } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/job-postings/${id}`);
      if (!response.ok) throw new Error('Failed to fetch job');
      return response.json();
    },
    enabled: !!id
  })

  // Define a more flexible type
  type DynamicFormSchema = {
    [key: string]: string | string[] | File;
  }

  // Dynamically build the form schema based on questions
  const buildFormSchema = () => {
    const schemaMap = questions.reduce((acc, question) => ({
      ...acc,
      [question._id]: z.string().refine(val => {
        if (question.type !== 'file') return true;
        if (question.required && !val) return false;
        return true;
      }, { message: `${question.question} is required` })
    }), {});

    return z.object(schemaMap);
  };

  // Initialize form with default values
  const { register, handleSubmit, formState, reset, setValue, setError, trigger } = useForm({
    defaultValues: getDefaultValues(questions),
    resolver: zodResolver(buildFormSchema())
  });

  // Update form when questions change
  useEffect(() => {
    reset(getDefaultValues(questions));
  }, [questions, reset]);

  useEffect(() => {
    console.log("Current form errors:", formState.errors);
  }, [formState.errors]);

  useEffect(() => {
    if (questions.length > 0 && !isLoading) {
      trigger();
    }
  }, [questions, trigger, isLoading]);

  const onSubmit: SubmitHandler<any> = async (data) => {
    setIsSubmitting(true);

    try {
      // Validate email format if email field exists
      const emailQuestion = questions.find(q => q.question.toLowerCase().includes('email'));
      if (emailQuestion && data[emailQuestion._id]) {
        const email = data[emailQuestion._id];
        if (!z.string().email().safeParse(email).success) {
          throw new Error('Please enter a valid email address');
        }
      }

      const formData = new FormData();
      
      // Store both question ID and text in the form data
      questions.forEach(q => {
        if (data[q._id]) {
          formData.append(`question_${q._id}`, JSON.stringify({
            id: q._id,
            text: q.question,
            answer: data[q._id]
          }));
        }
      });

      // Append other fields
      formData.append('jobId', id as string);
      if (uploadedFileUrl) {
        formData.append('cvUrl', uploadedFileUrl);
      }

      // Submit to application endpoint
      const response = await fetch('/api/submit-application', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Submission failed');
      }

      // Show success notification with email confirmation
      toast.success(result.message || 'Application submitted successfully!', {
        duration: 5000,
        icon: '✅'
      });

      // Redirect after short delay
      setTimeout(() => {
        router.push('/dashboard/apply/thank-you');
      }, 2000);

      // Reset form after successful submission
      reset();
      
    } catch (error) {
      setFormErrors([error.message]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render dynamic form fields
  const renderQuestionField = (question: any) => {
    const fieldName = question._id;
    
    switch (question.type) {
      case 'text':
        return (
          <div key={question._id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.question}
              {question.required && <span className="text-red-500">*</span>}
            </label>
            <input
              {...register(fieldName)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Enter your ${question.question.toLowerCase()}`}
            />
            {formState.errors[fieldName] && (
              <p className="text-red-500 text-sm">
                {formState.errors[fieldName]?.message}
              </p>
            )}
          </div>
        )
      case 'select':
        return (
          <div key={question._id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.question}
              {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <select
                {...register(fieldName)}
                className={`w-full px-4 py-3 rounded-lg border appearance-none bg-white/5 backdrop-blur-sm
                  focus:ring-2 focus:ring-blue-500 outline-none
                  ${formState.errors[fieldName] ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-200'}`}
              >
                <option value="">Select an option</option>
                {question.options.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {formState.errors[fieldName] && (
              <p className="text-red-500 text-sm">
                {formState.errors[fieldName]?.message}
              </p>
            )}
          </div>
        )
      case 'radio':
        return (
          <div key={question._id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.question}
              {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-2 space-y-2">
              {question.options.map((option: string) => (
                <label key={option} className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    {...register(fieldName)}
                    value={option}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {formState.errors[fieldName] && (
              <p className="text-red-500 text-sm">
                {formState.errors[fieldName]?.message}
              </p>
            )}
          </div>
        )
      case 'file':
        return (
          <div key={question._id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.question}
              {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg border-gray-300 hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor={fieldName} className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input 
                      id={fieldName} 
                      type="file" 
                      className="sr-only" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file client-side
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('File size must be less than 5MB');
                            return;
                          }
                          const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                          if (!validTypes.includes(file.type)) {
                            toast.error('Only PDF and Word documents are allowed');
                            return;
                          }

                          setUploadedFile(file);
                          setIsUploading(true);

                          try {
                            const uploadFormData = new FormData();
                            uploadFormData.append('file', file);
                            
                            const uploadResponse = await fetch('/api/upload', {
                              method: 'POST',
                              body: uploadFormData
                            });

                            if (!uploadResponse.ok) throw new Error('Upload failed');
                            
                            const { url } = await uploadResponse.json();
                            setUploadedFileUrl(url);
                            setValue(fieldName, url); // Store URL string in form
                          } catch (error) {
                            toast.error(error.message || 'File upload failed');
                            setUploadedFile(null);
                            setUploadedFileUrl(null);
                            setValue(fieldName, ''); // Clear the form value
                          } finally {
                            setIsUploading(false);
                          }
                        }
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                {isUploading ? (
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading file...
                  </div>
                ) : uploadedFileUrl ? (
                  <p className="text-sm text-green-600">
                    ✓ File uploaded successfully
                  </p>
                ) : uploadedFile ? (
                  <p className="text-sm text-gray-600">
                    {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  useEffect(() => {
    // Redirect if job ID is undefined or invalid
    if (id === 'undefined' || !id) {
      toast.error('Invalid job application. Redirecting to jobs page...');
      setTimeout(() => router.push('/careers/jobs'), 2000);
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
            <div className="absolute inset-0 border-4 border-t-blue-600 border-blue-100 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Loading application form...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {job?.title || 'Job Application'}
          </h1>
          <p className="text-gray-600">
            Complete the form below to apply for this position
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {Object.keys(formState.errors).length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
                  <h3 className="text-red-600 font-semibold mb-2 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    Please fix the following issues:
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {Object.values(formState.errors)
                      .filter(error => error?.message)
                      .map((error, index) => (
                        <li key={index} className="text-red-600 text-sm">
                          {error.message}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              <div className="space-y-6">
                {questions.map(question => renderQuestionField(question))}
              </div>

              <div className="mt-8 pt-5 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={!formState.isDirty || isSubmitting}
                  className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Submitting Application...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </motion.div>
  );
}

function getDefaultValues(questions: Array<{ _id: string }>) {
  return questions.reduce((acc: Record<string, string>, q) => ({ 
    ...acc, 
    [q._id]: ''
  }), {});
}

export default function ApplyPage() {
  return <ApplicationForm />;
}
