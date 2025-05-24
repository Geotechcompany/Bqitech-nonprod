"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Clock, CheckCircle, XCircle, Calendar, Eye } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import DashboardOverview from "@/components/user/DashboardOverview";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Application {
  id: string;
  position: string;
  status: string;
  appliedDate: string;
  lastUpdated: string;
  name: string;
  email: string;
  resumeUrl?: string;
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        setApplications(data.applications || []);
      } catch (error) {
        console.error(error);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchApplications();
    }
  }, [user]);

  const handleViewApplication = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch application details');
      }
      const data = await response.json();
      setSelectedApp(data);
    } catch (error) {
      console.error(error);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10";
      case "Under Review":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-700/10";
      case "Interview Scheduled":
        return "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10";
      case "Offer Extended":
        return "bg-green-50 text-green-700 ring-1 ring-inset ring-green-700/10";
      case "Rejected":
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-700/10";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-700/10";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "Applied":
        return <Briefcase className="w-5 h-5" />;
      case "Shortlisted":
        return <Clock className="w-5 h-5" />;
      case "Interview Scheduled":
        return <Calendar className="w-5 h-5" />;
      case "Offer Extended":
        return <CheckCircle className="w-5 h-5" />;
      case "Rejected":
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (isLoading)
    return (
      <Loader/>
    );

  return (
    <div className="space-y-6">
     

      <DashboardOverview />

      <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
        Recent Applications
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applications.slice(0, 3).map((app, index) => (
          <motion.div
            key={app.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">
                  {app.position}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewApplication(app.id)}
                  className="hover:bg-gray-100"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusColor(
                    app.status
                  )} transition-colors duration-200`}
                >
                  {statusIcon(app.status)}
                  <span className="ml-2">{app.status}</span>
                </span>

                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <p>Applied: {new Date(app.appliedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <p>Last Updated: {new Date(app.lastUpdated || app.appliedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Position</h3>
                <p>{selectedApp.position}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center ${statusColor(selectedApp.status)}`}>
                  {statusIcon(selectedApp.status)}
                  <span className="ml-1">{selectedApp.status}</span>
                </span>
              </div>
              <div>
                <h3 className="font-semibold">Applied Date</h3>
                <p>{new Date(selectedApp.appliedDate).toLocaleDateString()}</p>
              </div>
              {selectedApp.resumeUrl && (
                <div>
                  <h3 className="font-semibold">Resume</h3>
                  <a 
                    href={selectedApp.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Resume
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
