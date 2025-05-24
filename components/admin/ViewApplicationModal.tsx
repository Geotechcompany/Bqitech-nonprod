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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Application</DialogTitle>
          <DialogDescription>
            Detailed information about the application.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <h3 className="font-semibold">Name</h3>
            <p>{application.name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Email</h3>
            <p>{application.email}</p>
          </div>
          <div>
            <h3 className="font-semibold">Phone Number</h3>
            <p>{application.phoneNumber}</p>
          </div>
          <div>
            <h3 className="font-semibold">Position</h3>
            <p>{application.position}</p>
          </div>
          <div>
            <h3 className="font-semibold">Applied Date</h3>
            <p>{formatDate(application.appliedDate)}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <p>{application.status}</p>
          </div>
          {application.cvUrl && (
            <div className="flex space-x-4 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewResume}
                className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 focus:outline-none"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "VIEW CV"}
              </motion.button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
