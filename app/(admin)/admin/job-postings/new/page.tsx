"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import Quill styles

export default function AddJobPostingPage() {
  const router = useRouter();
  const [jobPosting, setJobPosting] = useState({
    title: "",
    department: "",
    location: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJobPosting((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setJobPosting((prev) => ({ ...prev, description: value }));
  };

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

    setIsLoading(true); // Set loading state

    try {
      const response = await fetch("/api/admin/job-postings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobPosting),
      });

      if (!response.ok) {
        throw new Error("Failed to create job posting");
      }

      toast.success("Job posting created successfully!"); // Success toast
      router.push("/admin/job-postings");
    } catch (err) {
      setError("Failed to create job posting. Please try again.");
      toast.error("Failed to create job posting. Please try again."); // Error toast
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Add New Job Posting</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
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
            required
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
            required
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
            required
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
            {isLoading ? "Creating..." : "Create Job Posting"}
          </Button>
        </div>
      </form>
    </div>
  );
}
