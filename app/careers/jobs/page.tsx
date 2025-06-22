"use client";
 
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Clock, ChevronDown, X, Briefcase, Calendar } from "lucide-react";
import { JobPosting } from "@/types/jobPosting";
import Loader from "@/components/Loader";
import { SafeHtml } from "@/components/ui/safe-html";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
 
export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const isSignedIn = isAuthenticated;
 
  const {
    data: jobs,
    isLoading,
    error,
  } = useQuery<JobPosting[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL}/api/jobs`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();
        return data.jobs || [];
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load job listings');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2, // Retry failed requests up to 2 times
  });
 
  const uniqueLocations = Array.from(
    new Set(jobs?.map((job) => job.location) || [])
  );
  const uniqueDepartments = Array.from(
    new Set(jobs?.map((job) => job.department).filter(Boolean) || [])
  );
 
  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.department?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
 
    const matchesLocation =
      !selectedLocation || job.location === selectedLocation;
    const matchesDepartment =
      !selectedDepartment || job.department === selectedDepartment;
 
    return matchesSearch && matchesLocation && matchesDepartment;
  });
 
  const handleApply = (_id: string) => {
    if (!isSignedIn) {
      sessionStorage.setItem("pendingJobApplication", _id);
      router.push("/login?redirect=/dashboard/apply");
      return;
    }
 
    router.push(`/dashboard/apply/${_id}`);
  };
 
  if (isLoading) return <Loader />;
  if (error) return <div>Failed to load jobs</div>;
 
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white -mt-[80px]">
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-r from-[#0A2540] via-[#1E4D8A] to-[#0066CC] text-white pb-4 py-32 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(51,204,255,0.15),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.15),transparent_70%)]"></div>
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-5xl sm:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-[#33CCFF]">
              Open Positions
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-blue-100 max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Join a team where innovation meets impact and shape the
            future of technology!
          </motion.p>
        </motion.div>
      </div>
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Enhanced Search Section */}
        <motion.div
          className="mb-8 sm:mb-12 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for jobs or keywords"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#33CCFF] focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#272055] to-[#1D1840] hover:from-[#1D1840] hover:to-[#272055] text-white rounded-xl transition-all duration-300 transform hover:scale-105">
              Search
            </Button>
          </div>
 
          {/* Enhanced Filters */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="w-full px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all duration-200"
              >
                <MapPin className="w-4 h-4 text-gray-500" />
                {selectedLocation || "Location"}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {isLocationOpen && uniqueLocations.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl">
                  {uniqueLocations.map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSelectedLocation(location);
                        setIsLocationOpen(false);
                      }}
                      className="w-full px-6 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors duration-200"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
 
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => setIsDepartmentOpen(!isDepartmentOpen)}
                className="w-full px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all duration-200"
              >
                {selectedDepartment || "Department"}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {isDepartmentOpen && uniqueDepartments.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl">
                  {uniqueDepartments.map((department) => (
                    <button
                      key={department}
                      onClick={() => {
                        setSelectedDepartment(department || "");
                        setIsDepartmentOpen(false);
                      }}
                      className="w-full px-6 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors duration-200"
                    >
                      {department}
                    </button>
                  ))}
                </div>
              )}
            </div>
 
            {(selectedLocation || selectedDepartment) && (
              <button
                onClick={() => {
                  setSelectedLocation("");
                  setSelectedDepartment("");
                }}
                className="flex-1 sm:flex-none px-6 py-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all duration-200 text-red-500"
              >
                Clear Filters
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
 
        {/* Enhanced Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8 relative">
          {/* Left Side - Job Listings */}
          <div
            className={`flex-1 transition-all duration-300 ${
              selectedJob ? "lg:max-w-[50%]" : "max-w-full"
            }`}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {filteredJobs?.length || 0} Jobs Found
              </h2>
            </div>
 
            <div className="space-y-4">
              {filteredJobs?.map((job) => (
                <motion.div
                  key={job.id}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:transform hover:scale-[1.02] group
                    ${
                      selectedJob?.id === job.id
                        ? "bg-gradient-to-br from-blue-50/50 to-white border-2 border-blue-200 shadow-lg"
                        : "bg-white border border-gray-100/80 hover:border-blue-100 hover:shadow-md"
                    }`}
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      {new Date(job.postedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    
                    <div className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {job.description?.replace(/<[^>]*>/g, '').slice(0, 120).trim() + (job.description?.length > 120 ? '...' : '')}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        <Briefcase className="w-4 h-4 text-blue-500" />
                        {job.employmentType}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600">
                        {job.department || 'General'}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-blue-600 hover:bg-blue-50 group-hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(job.id);
                        }}
                      >
                        Quick Apply →
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
 
          {/* Right Side - Job Details */}
          <AnimatePresence mode="wait">
            {selectedJob && (
              <motion.div
                className={`fixed lg:relative inset-0 lg:inset-auto lg:w-[50%] bg-white z-50 lg:z-auto
                  ${selectedJob ? "lg:sticky lg:top-4" : ""}
                  h-screen lg:h-[calc(100vh-8rem)] overflow-hidden rounded-2xl shadow-xl border border-gray-100`}
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 180 }}
              >
                <div className="h-full overflow-y-auto flex flex-col">
                  <div className="p-6 sm:p-8 border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {selectedJob.title}
                      </h2>
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
 
                  <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { label: "Department", value: selectedJob.department },
                          { label: "Location", value: selectedJob.location },
                          { label: "Position Type", value: "Full time" },
                          { label: "Posted Date", value: new Date(selectedJob.postedDate).toLocaleDateString() }
                        ].map((item) => (
                          <div key={item.label} className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">
                              {item.label}
                            </h3>
                            <p className="text-gray-900 font-medium">{item.value}</p>
                          </div>
                        ))}
                      </div>
 
                      <div className="prose max-w-none">
                        <SafeHtml html={selectedJob.description} />
                      </div>
                    </div>
                  </div>

                  {/* Sticky Apply Button */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-100/80">
                    <div className="p-6 sm:p-8 bg-gradient-to-t from-white/90 to-white/50 backdrop-blur-sm">
                      <Button
                        onClick={() => handleApply(selectedJob.id)}
                        className="w-full py-6 bg-gradient-to-r from-[#33CCFF] to-[#272055] hover:from-[#272055] hover:to-[#33CCFF] text-white rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
 
 