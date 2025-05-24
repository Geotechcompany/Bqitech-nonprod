"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobPosting } from "@/types/jobPosting";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import Loader from "@/components/Loader";

export default function EditJobPostingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobPosting() {
      // Validate id parameter
      if (!id) {
        setError("Invalid job ID");
        return;
      }

      if (id === "new") {
        const initialJobPosting: JobPosting = {
          _id: "",
          id: "",
          title: "",
          department: "",
          location: "",
          description: "",
          postedDate: new Date().toISOString(),
          employmentType: "Full-time",
          category: "",
          questions: [],
          isActive: true,
        };
        setJobPosting(initialJobPosting);
        return;
      }

      try {
        const response = await fetch(`/api/admin/job-postings/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch job posting");
        }
        const data = await response.json();
        setJobPosting(data);
      } catch (err) {
        setError("Failed to load job posting. Please try again.");
      }
    }

    fetchJobPosting();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJobPosting((prev) => ({ ...prev!, [name]: value }));
  };

  const handleDescriptionChange = (value: string) => {
    if (jobPosting) {
      setJobPosting((prev) => ({ ...prev!, description: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobPosting) return;

    // Custom validation
    if (!jobPosting.title || !jobPosting.department || !jobPosting.location || !jobPosting.description) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true); // Set loading state

    try {
      const url =
        id === "new"
          ? "/api/admin/job-postings"
          : `/api/admin/job-postings/${id}`;
      const method = id === "new" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobPosting),
      });

      if (!response.ok) {
        throw new Error("Failed to save job posting");
      }

      toast.success("Job posting saved successfully!"); // Success toast
      router.push("/admin/job-postings");
    } catch (err) {
      setError("Failed to save job posting. Please try again.");
      toast.error("Failed to save job posting. Please try again."); // Error toast
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  if (!jobPosting) return <Loader/> ;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        {id === "new" ? "Add New Job Posting" : "Edit Job Posting"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Job Title
          </label>
          <Input
            id="title"
            name="title"
            value={jobPosting.title}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
        <div>
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700"
          >
            Department
          </label>
          <Input
            id="department"
            name="department"
            value={jobPosting.department}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <Input
            id="location"
            name="location"
            value={jobPosting.location}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Job Description
          </label>
          <ReactQuill
            value={jobPosting.description}
            onChange={handleDescriptionChange}
            className="mt-1"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Job Posting"}
          </Button>
        </div>
      </form>
    </div>
  );
}
