"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { User as UserType } from "@/src/types/user";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface EditUserModalProps {
  user: UserType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditUserModal({ user, open, onOpenChange, onSuccess }: EditUserModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm<UserType>();

  const updateUser = useMutation({
    mutationFn: async (data: UserType) => {
      const response = await fetch(`/api/admin/users/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("User updated successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: () => toast.error("Failed to update user"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit User
          </DialogTitle>
        </DialogHeader>

        <form 
          onSubmit={handleSubmit((data) => updateUser.mutate(data))}
          className="space-y-4"
        >
          <Input
            label="Name"
            {...register("name", { required: true })}
            defaultValue={user?.name}
          />
          
          <Input
            label="Email"
            type="email"
            {...register("email", { required: true })}
            defaultValue={user?.email}
          />

          <Select
            onValueChange={(value) => setValue("role", value as "USER" | "ADMIN")}
            defaultValue={user?.role}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? <Loader className="animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 