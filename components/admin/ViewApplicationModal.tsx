import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Application } from "@/types/application";
import { useState } from "react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { 
  UserIcon, 
  BriefcaseIcon, 
  FileTextIcon, 
  FileIcon, 
  ArrowUpRightIcon 
} from "lucide-react";

interface ViewApplicationModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewApplicationModal({
  application,
  isOpen,
  onClose,
}: ViewApplicationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!application) return null;

  const handleViewResume = () => {
    if (application.cvUrl) {
      setIsLoading(true);
      const link = document.createElement("a");
      link.href = application.cvUrl;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsLoading(false);
    }
  };

  function getAnswer(answers: any[], question: string) {
    return answers?.find(a => 
      a.questionText.toLowerCase().includes(question.toLowerCase())
    )?.answer;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Application Details
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Comprehensive overview of candidate application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ID Section */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <span className="text-xs font-medium text-gray-400">Application ID</span>
            <p className="font-mono text-sm text-gray-700 mt-1">{application.id}</p>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <h4 className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                <UserIcon className="w-4 h-4 text-blue-500" />
                Candidate Info
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="text-gray-700 font-medium">
                    {application.name || 
                     `${getAnswer(application.answers, 'First Name')} ${getAnswer(application.answers, 'Last Name')}`.trim() || 
                     'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Contact Email</p>
                  <p className="text-gray-700 font-medium">
                    {application.email?.toLowerCase() || 
                     getAnswer(application.answers, 'Email') || 
                     'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone Number</p>
                  <p className="text-gray-700 font-medium">
                    {application.phoneNumber || 
                     getAnswer(application.answers, 'Phone') || 
                     'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <h4 className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                <BriefcaseIcon className="w-4 h-4 text-purple-500" />
                Position Info
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Applied Position</p>
                  <p className="text-gray-700 font-medium">
                    {application.position || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Application Date</p>
                  <p className="text-gray-700 font-medium">
                    {formatDate(application.appliedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Current Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    application.status === 'Hired' ? 'bg-green-100 text-green-700' :
                    application.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {application.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-4">
              <FileTextIcon className="w-4 h-4 text-green-500" />
              Application Responses
            </h4>
            <div className="space-y-4">
              {application.answers?.map((answer, index) => (
                <div key={index} className="group relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-200 before:rounded-full">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {answer.questionText}
                  </p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {answer.answer || 'No answer provided'}
                  </p>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-400">
                  No responses available
                </div>
              )}
            </div>
          </div>

          {/* CV Section */}
          {application.cvUrl && (
            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <h4 className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-4">
                <FileIcon className="w-4 h-4 text-orange-500" />
                Attached Documents
              </h4>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileTextIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Candidate CV</p>
                    <p className="text-xs text-gray-400">
                      Uploaded {formatDate(application.appliedDate)}
                    </p>
                  </div>
                </div>
                <Link
                  href={application.cvUrl}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1.5"
                >
                  View Document
                  <ArrowUpRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
