// app/dashboard/jobs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Calendar, ArrowRight } from "lucide-react";
import { JobPosting } from "@/types/jobPosting";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";

export default function JobListingsPage() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchJobPostings = async () => {
      const response = await fetch("/api/admin/job-postings");
      const data = await response.json();
      setJobPostings(data);
      setIsLoading(false);
    };

    fetchJobPostings();
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Open Positions
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobPostings.map((job) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
          >
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-gray-600 font-medium">{job.department}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Posted {new Date(job.postedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  onClick={() => router.push(`/dashboard/apply/${job._id}`)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/careers/jobs`)}
                  className="px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-lg text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  View Details
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {jobPostings.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No open positions</h3>
          <p className="mt-2 text-gray-500">Check back later for new opportunities.</p>
        </div>
      )}
    </div>
  );
}
