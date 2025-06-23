"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useActionState } from "@/hooks/useActionState"
import toast, { Toaster } from 'react-hot-toast'
import { 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Loader2 
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { 
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  DocumentIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import { useAuth } from "@/contexts/AuthContext"
import { authService } from "@/lib/auth-backend"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function ApplicationForm() {
  const router = useRouter()
  const { id } = useParams()
  const { user, authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/jobs/${id}`, {
        headers: {
          'Authorization': `Bearer ${authService.getSession()?.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch job');
      return response.json();
    },
    enabled: !!id
  })

  // Fetch job-specific questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['jobQuestions', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/jobs/${id}/questions`, {
        headers: {
          'Authorization': `Bearer ${authService.getSession()?.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        // If no questions found, return empty array
        if (response.status === 404) return [];
        throw new Error('Failed to fetch questions');
      }
      return response.json();
    },
    enabled: !!id
  })

  // Dynamically build the form schema based on questions
  const buildFormSchema = () => {
    const schemaMap = questions.reduce((acc, question) => {
      const fieldName = question._id || question.id;
      let schema: z.ZodString | z.ZodOptional<z.ZodString>;

      // Add type-specific validation with custom error messages
      switch (question.type) {
        case 'text':
          if (question.question.toLowerCase().includes('email')) {
            schema = z.string()
              .min(1, { message: `${question.question} is required` })
              .email({ message: 'Please enter a valid email address' });
          } else if (question.question.toLowerCase().includes('phone')) {
            schema = z.string()
              .min(1, { message: `${question.question} is required` })
              .regex(/^\+?[0-9\s-()]{10,}$/, { 
                message: 'Please enter a valid phone number (at least 10 digits)' 
              });
          } else {
            schema = z.string()
              .min(1, { message: `${question.question} is required` });
          }
          break;
        case 'select':
          schema = z.string()
            .min(1, { message: `Please select an option for ${question.question.toLowerCase()}` });
          break;
        case 'radio':
          schema = z.string()
            .min(1, { message: `Please select an option for ${question.question.toLowerCase()}` });
          break;
        case 'file':
          schema = z.string()
            .min(1, { message: `Please upload a file for ${question.question.toLowerCase()}` });
          break;
        default:
          schema = z.string()
            .min(1, { message: `${question.question} is required` });
      }

      // Add required validation
      if (!question.required) {
        schema = schema.optional();
      }

      return {
        ...acc,
        [fieldName]: schema
      };
    }, {} as Record<string, z.ZodString | z.ZodOptional<z.ZodString>>);

    return z.object(schemaMap);
  };

  // Form setup with mode: "onSubmit" to only validate on submit
  const { register, handleSubmit, formState, reset, setValue, setError, trigger } = useForm({
    defaultValues: getDefaultValues(questions),
    resolver: zodResolver(buildFormSchema()),
    mode: "onSubmit", // Only validate on submit
    reValidateMode: "onSubmit" // Only revalidate on submit
  });

  // Effect: Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/dashboard/apply/${id}`);
    }
  }, [user, authLoading, router, id]);

  // Effect: Update form when questions change
  useEffect(() => {
    reset(getDefaultValues(questions));
  }, [questions, reset]);

  // Effect: Trigger validation when questions load
  useEffect(() => {
    if (questions.length > 0 && !questionsLoading) {
      trigger();
    }
  }, [questions, trigger, questionsLoading]);

  // Effect: Handle invalid job ID
  useEffect(() => {
    if (id === 'undefined' || !id) {
      toast.error('Invalid job application. Redirecting to jobs page...');
      router.push('/dashboard/jobs');
    }
  }, [id, router]);

  // Loading states
  const isLoading = authLoading || jobLoading || questionsLoading;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Authentication check
  if (!user) {
    return null; // The redirect will happen in the useEffect
  }

  // Job not found
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-semibold">Job Not Found</h1>
        <p className="text-gray-600">The job posting you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push('/dashboard/jobs')}>
          View All Jobs
        </Button>
      </div>
    );
  }

  const onSubmit: SubmitHandler<any> = async (data) => {
    // Clear previous errors
    setFormErrors([]);

    // Check for validation errors
    const errors = Object.entries(formState.errors).map(([field, error]) => error.message as string);
    if (errors.length > 0) {
      setFormErrors(errors);
      setShowErrorDialog(true);
      return;
    }

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

      // Format answers in the expected structure
      const answers = questions.map(q => {
        const questionId = q._id || q.id;
        const answer = data[questionId];
        
        // Additional validation for required fields
        if (q.required && (!answer || answer.trim() === '')) {
          throw new Error(`${q.question} is required`);
        }

        return {
          questionId,
          questionText: q.question,
          answer: answer || ''
        };
      });

      // Create the application data structure
      const applicationData = {
        jobId: id,
        answers,
        status: "New",
        appliedDate: new Date().toISOString(),
        userId: user.id
      };

      // Submit to application endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/applications`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getSession()?.token}`
        },
        body: JSON.stringify(applicationData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 400 && result.detail === "You have already applied for this position") {
          toast.error("You have already applied for this position");
          router.push('/dashboard/applications');
          return;
        }
        throw new Error(result.detail || 'Failed to submit application');
      }

      // Show success message and redirect
      toast.success('Application submitted successfully!');
      router.push('/dashboard/apply/thank-you');
    } catch (error: any) {
      setIsSubmitting(false);
      toast.error(error.message || 'Failed to submit application');
      setFormErrors([error.message || 'Failed to submit application']);
      setShowErrorDialog(true);
    }
  };

  // Render dynamic form fields
  const renderQuestionField = (question: any) => {
    const fieldName = question._id || question.id;
    
    const baseInputClasses = "w-full px-3 py-2 border rounded-md transition-all duration-200 focus:outline-none focus:ring-2";
    const normalClasses = "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
    const inputClasses = `${baseInputClasses} ${normalClasses}`;
    
    const renderLabel = () => (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {question.question}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );

    switch (question.type) {
      case 'text':
        return (
          <div key={fieldName} className="space-y-2">
            {renderLabel()}
            <div className="relative">
              <input
                {...register(fieldName)}
                className={inputClasses}
                placeholder={`Enter your ${question.question.toLowerCase()}`}
              />
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} className="space-y-2">
            {renderLabel()}
            <div className="relative">
              <select
                {...register(fieldName)}
                className={inputClasses}
                defaultValue=""
              >
                <option value="" disabled>Select an option</option>
                {question.options?.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'radio':
        return (
          <div key={fieldName} className="space-y-2">
            {renderLabel()}
            <div className="space-y-3 bg-white p-3 rounded-md border border-gray-200">
              {question.options?.map((option: string) => (
                <div key={option} className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      {...register(fieldName)}
                      value={option}
                      id={`${fieldName}-${option}`}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <label 
                    htmlFor={`${fieldName}-${option}`} 
                    className="ml-3 text-sm text-gray-700 select-none cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'file':
        return (
          <div key={fieldName} className="space-y-2">
            {renderLabel()}
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) { // 5MB limit
                      toast.error('File size should not exceed 5MB');
                      return;
                    }
                    setUploadedFile(file);
                    setIsUploading(true);
                    try {
                      // Try to upload with current token
                      const uploadFile = async (token: string) => {
                        const formData = new FormData();
                        formData.append('file', file);
                        const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/upload/`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          },
                          body: formData
                        });

                        if (response.status === 401) {
                          // Token expired, try to refresh
                          const refreshed = await authService.refreshToken();
                          if (refreshed) {
                            // Retry with new token
                            return uploadFile(authService.getSession()?.token || '');
                          }
                          throw new Error('Session expired. Please log in again.');
                        }

                        if (!response.ok) {
                          const error = await response.json();
                          throw new Error(error.detail || 'Upload failed');
                        }

                        return response.json();
                      };

                      const data = await uploadFile(authService.getSession()?.token || '');
                      setUploadedFileUrl(data.url);
                      setValue(fieldName, data.url);
                      toast.success('File uploaded successfully!');
                    } catch (error) {
                      console.error('Upload error:', error);
                      if (error.message === 'Session expired. Please log in again.') {
                        // Redirect to login
                        router.push(`/login?redirect=/dashboard/apply/${id}`);
                      } else {
                        toast.error(error.message || 'Failed to upload file. Please try again.');
                      }
                      setUploadedFile(null);
                      setValue(fieldName, '');
                    } finally {
                      setIsUploading(false);
                    }
                  }
                }}
                className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
              />
            </div>
            {uploadedFile && (
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <div className="flex items-center gap-2">
                  <DocumentIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">{uploadedFile.name}</span>
                </div>
                {uploadedFileUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      setUploadedFileUrl(null);
                      setValue(fieldName, '');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            {isUploading && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                  {questions.map(question => renderQuestionField(question))}
                </div>

                <div className="mt-8 pt-5 border-t border-gray-200">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full py-3 text-lg transition-all duration-200 ${
                      isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Submitting Application...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Send className="h-5 w-5" />
                        <span>Submit Application</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <ExclamationCircleIcon className="h-6 w-6" />
              Please Fix the Following Issues
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <ul className="list-disc pl-5 space-y-2">
              {formErrors.map((error, index) => (
                <li key={index} className="text-gray-700">{error}</li>
              ))}
            </ul>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

function getDefaultValues(questions: Array<{ _id?: string; id?: string; type: string }>) {
  return questions.reduce((acc, question) => {
    const fieldName = question._id || question.id;
    if (!fieldName) return acc;

    switch (question.type) {
      case 'text':
        acc[fieldName] = '';
        break;
      case 'select':
        acc[fieldName] = '';
        break;
      case 'radio':
        acc[fieldName] = '';
        break;
      case 'file':
        acc[fieldName] = '';
        break;
      default:
        acc[fieldName] = '';
    }
    return acc;
  }, {} as Record<string, string>);
}

export default function ApplyPage() {
  return <ApplicationForm />;
}


