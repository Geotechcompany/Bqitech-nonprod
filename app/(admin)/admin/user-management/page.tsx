"use client";

import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { 
  User,
  UserCog,
  Shield,
  Mail
} from "lucide-react";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User as UserType } from "@/src/types/user";
import { toast } from "react-hot-toast";
import { Pagination } from "@/components/Pagination";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EditUserModal } from "@/components/admin/EditUserModal";

export default function UserManagementPage() {
  const { user } = useAuth();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedBulkAction, setSelectedBulkAction] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', currentPage],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/users?page=${currentPage}&limit=${itemsPerPage}`
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json() as Promise<{
        data: UserType[];
        total: number;
      }>;
    },
  });

  const queryClient = useQueryClient();

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete user');
    }
  });

  const handleViewProfile = (userId: string) => {
    // Implement navigation to user profile
    window.open(`/admin/users/${userId}`, '_blank');
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to reset password');
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser.mutate(userId);
    }
  };

  const bulkUpdate = useMutation({
    mutationFn: async (role: string) => {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUsers,
          role
        })
      });
      if (!response.ok) throw new Error('Bulk update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUsers([]);
      toast.success('Bulk update successful');
    }
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedUsers([]);
  };

  const bulkActions = [
    { value: "USER", label: "Set to User" },
    { value: "ADMIN", label: "Set to Admin" },
    { value: "DELETE", label: "Delete Selected" },
  ];

  const handleBulkAction = (action: string) => {
    if (!selectedUsers.length) {
      toast.error("Please select users first");
      return;
    }

    if (action === "DELETE") {
      if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
        bulkDelete.mutate(selectedUsers);
      }
    } else {
      bulkUpdate.mutate(action);
    }
  };

  const bulkDelete = useMutation({
    mutationFn: async (userIds: string[]) => {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds })
      });
      if (!response.ok) throw new Error('Bulk delete failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUsers([]);
      toast.success('Bulk delete successful');
    }
  });

  return (
    <>
      <AdminPageLayout
        title="User Management"
        breadcrumb="User Management"
        headerActions={
          <div className="flex gap-4">
            <Select onValueChange={handleBulkAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bulk Actions" />
              </SelectTrigger>
              <SelectContent>
                {bulkActions.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <UserCog className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </div>
        }
      >
        <UserManagementTable
          users={usersData?.data || []}
          isLoading={isLoading || deleteUser.isPending}
          selectedUsers={selectedUsers}
          onSelectionChange={setSelectedUsers}
          onViewProfile={handleViewProfile}
          onResetPassword={handleResetPassword}
          onDelete={handleDeleteUser}
          onEdit={(user) => setEditingUser(user)}
        />
        
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil((usersData?.total || 0) / itemsPerPage)}
          onPageChange={handlePageChange}
          className="mt-6"
        />
      </AdminPageLayout>

      <EditUserModal
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />
    </>
  );
} 