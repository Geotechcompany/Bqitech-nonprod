"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth-backend";

interface JobPosting {
  title: string;
  department: string;
  location: string;
  description: string;
  isActive: boolean;
}

export default function AddJobPostingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAdmin, authLoading } = useAuth();
  const [jobPosting, setJobPosting] = useState<JobPosting>({
    title: "",
    department: "",
    location: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom validation
    if (
      !jobPosting.title ||
      !jobPosting.department ||
      !jobPosting.location ||
      !jobPosting.description
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const session = authService.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/job-postings`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(jobPosting),
      });

      if (response.status === 401) {
        const refreshed = await authService.refreshToken();
        if (!refreshed) {
          router.push('/login');
          return;
        }

        // Retry with new token
        const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/admin/job-postings`, {
          method: "POST",
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshed.access_token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(jobPosting),
        });

        if (!retryResponse.ok) {
          throw new Error("Failed to create job posting");
        }
      } else if (!response.ok) {
        throw new Error("Failed to create job posting");
      }

      toast.success("Job posting created successfully!");
      router.push("/admin/job-postings");
    } catch (err) {
      console.error('Error creating job posting:', err);
      setError("Failed to create job posting. Please try again.");
      toast.error("Failed to create job posting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <AdminPageLayout title="Add New Job Posting" showSearch={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminPageLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Router will handle the redirect
  }

  return (
    <AdminPageLayout title="Add New Job Posting" showSearch={false}>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={jobPosting.title}
                onChange={(e) =>
                  setJobPosting({ ...jobPosting, title: e.target.value })
                }
                placeholder="Enter job title"
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={jobPosting.department}
                onChange={(e) =>
                  setJobPosting({ ...jobPosting, department: e.target.value })
                }
                placeholder="Enter department"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={jobPosting.location}
                onChange={(e) =>
                  setJobPosting({ ...jobPosting, location: e.target.value })
                }
                placeholder="Enter location"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={jobPosting.description}
                onChange={(e) => {
                  // Clean up HTML entities and normalize spaces
                  const cleanedValue = e.target.value
                    .replace(/&nbsp;/g, ' ')  // Replace &nbsp; with regular space
                    .replace(/\s+/g, ' ')     // Normalize multiple spaces
                    .trim();                  // Trim extra spaces
                  
                  setJobPosting({ ...jobPosting, description: cleanedValue });
                }}
                placeholder="Enter job description"
                rows={6}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/job-postings")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Job Posting"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminPageLayout>
  );
}
