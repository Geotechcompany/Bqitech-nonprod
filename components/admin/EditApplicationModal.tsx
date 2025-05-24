import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Application } from "@/types/application";
import { motion } from "framer-motion";
import { SelectItemIndicator, SelectItemText } from "@radix-ui/react-select";

interface EditApplicationModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedApplication: Application) => void;
}

const statusOptions = [
  { value: "Application", color: "text-gray-500" },
  { value: "Shortlisted", color: "text-yellow-500" },
  { value: "Technical Assessment", color: "text-blue-500" },
  { value: "Interviewing", color: "text-purple-500" },
  { value: "Disqualified", color: "text-red-500" },
  { value: "Hired", color: "text-green-500" },
];

export function EditApplicationModal({
  application,
  isOpen,
  onClose,
  onSave,
}: EditApplicationModalProps) {
  const [editedApplication, setEditedApplication] =
    useState<Application | null>(null);

  useEffect(() => {
    setEditedApplication(application);
  }, [application]);

  if (!editedApplication) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedApplication((prev) => ({ ...prev!, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setEditedApplication((prev) => ({ ...prev!, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedApplication);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <Input
              id="name"
              name="name"
              value={editedApplication.name}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={editedApplication.email}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-gray-700"
            >
              Position
            </label>
            <Input
              id="position"
              name="position"
              value={editedApplication.position}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <Select
              value={editedApplication.status}
              onValueChange={(value) => setEditedApplication(prev => ({ ...prev!, status: value }))}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.value}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
