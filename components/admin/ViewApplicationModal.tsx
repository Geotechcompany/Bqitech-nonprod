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
  ArrowUpRightIcon,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

  function getAnswer(answers: any[] | undefined, question: string) {
    if (!answers || !Array.isArray(answers)) return '';
    
    return answers.find(a => 
      a?.questionText?.toLowerCase().includes(question.toLowerCase())
    )?.answer || '';
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95vw] max-w-4xl h-[95vh] max-h-[95vh] p-0 rounded-xl sm:rounded-2xl overflow-hidden"
      >
        {/* Mobile-friendly header with close button */}
        <DialogHeader className="relative p-4 sm:p-6 pb-2 sm:pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Application Details
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-xs sm:text-sm mt-1">
                Comprehensive overview of candidate application
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 flex-shrink-0 sm:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* ID Section */}
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
              <span className="text-xs font-medium text-gray-400">Application ID</span>
              <p className="font-mono text-xs sm:text-sm text-gray-700 mt-1 break-all">{application.id}</p>
            </div>

            {/* Main Info Grid - Stack on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-4 sm:p-5 bg-white border border-gray-100 rounded-lg sm:rounded-xl shadow-sm">
                <h4 className="text-sm sm:text-base font-semibold text-gray-500 flex items-center gap-2 mb-3 sm:mb-4">
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span>Candidate Info</span>
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Full Name</p>
                    <p className="text-sm sm:text-base text-gray-700 font-medium break-words">
                      {application.name || 
                       `${getAnswer(application.answers, 'First Name')} ${getAnswer(application.answers, 'Last Name')}`.trim() || 
                       'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Contact Email</p>
                    <p className="text-sm sm:text-base text-gray-700 font-medium break-all">
                      {application.email?.toLowerCase() || 
                       getAnswer(application.answers, 'Email') || 
                       'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Phone Number</p>
                    <p className="text-sm sm:text-base text-gray-700 font-medium break-words">
                      {application.phoneNumber || 
                       getAnswer(application.answers, 'Phone') || 
                       'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white border border-gray-100 rounded-lg sm:rounded-xl shadow-sm">
                <h4 className="text-sm sm:text-base font-semibold text-gray-500 flex items-center gap-2 mb-3 sm:mb-4">
                  <BriefcaseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                  <span>Position Info</span>
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Applied Position</p>
                    <p className="text-sm sm:text-base text-gray-700 font-medium break-words">
                      {application.position || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Application Date</p>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">
                      {formatDate(application.appliedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Current Status</p>
                    <span className={`inline-flex px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${
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
            <div className="p-4 sm:p-5 bg-white border border-gray-100 rounded-lg sm:rounded-xl shadow-sm">
              <h4 className="text-sm sm:text-base font-semibold text-gray-500 flex items-center gap-2 mb-4 sm:mb-5">
                <FileTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span>Application Responses</span>
              </h4>
              <div className="space-y-4 sm:space-y-5">
                {application.answers?.map((answer, index) => (
                  <div key={index} className="group relative">
                    <div className="border-l-2 border-gray-200 pl-4 sm:pl-6">
                      <p className="text-sm sm:text-base font-medium text-gray-700 mb-2 leading-relaxed">
                        {answer.questionText}
                      </p>
                      <div className="text-sm sm:text-base text-gray-600 bg-gray-50 rounded-lg p-3 sm:p-4 leading-relaxed break-words">
                        {answer.answer || 'No answer provided'}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-6 sm:py-8 text-gray-400">
                    <FileTextIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                    <p className="text-sm sm:text-base">No responses available</p>
                  </div>
                )}
              </div>
            </div>

            {/* CV Section */}
            {application.cvUrl && (
              <div className="p-4 sm:p-5 bg-white border border-gray-100 rounded-lg sm:rounded-xl shadow-sm">
                <h4 className="text-sm sm:text-base font-semibold text-gray-500 flex items-center gap-2 mb-4 sm:mb-5">
                  <FileIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                  <span>Attached Documents</span>
                </h4>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm flex-shrink-0">
                      <FileTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium text-gray-700 truncate">
                        Candidate CV
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Uploaded {formatDate(application.appliedDate)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={application.cvUrl}
                    target="_blank"
                    className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 text-sm sm:text-base font-medium bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-all duration-200 flex-shrink-0"
                  >
                    <span>View Document</span>
                    <ArrowUpRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom padding for mobile scroll */}
            <div className="h-4 sm:h-0" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
