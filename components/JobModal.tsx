import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { JobPosting } from '@/types/jobPosting'
import Link from "next/link"
import { SafeHtml } from '@/components/ui/safe-html'

interface JobModalProps {
  job: JobPosting | null;
  onClose: () => void;
}

const JobModal = ({ job, onClose }: JobModalProps) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full overflow-y-auto max-h-[80vh]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <h2 className="text-2xl font-semibold mb-4">{job.title}</h2>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium">Details</h3>
          <p className="text-gray-700 mb-2"><strong>Department:</strong> {job.department}</p>
          <p className="text-gray-700 mb-2"><strong>Location:</strong> {job.location}</p>
          <p className="text-gray-700 mb-2"><strong>Posted on:</strong> {new Date(job.postedDate).toLocaleDateString()}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium">Job Description</h3>
          <div className="prose max-w-none">
            <SafeHtml 
              html={job.description}
              className="text-gray-700"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Close
          </Button>
          <Link href={`/careers/apply/${job.id}`}>
            <Button className="bg-green-600 hover:bg-green-700">
              Apply Now
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default JobModal;
