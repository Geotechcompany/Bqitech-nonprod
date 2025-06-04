"use client";

import { User as UserType } from "@/src/types/user";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  User,
  Shield,
  Mail,
  Loader,
  Trash2,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PropTypes from 'prop-types';

interface UserManagementTableProps {
  users: UserType[];
  isLoading?: boolean;
  noDataMessage?: string;
  onEdit?: (user: UserType) => void;
  onViewProfile?: (userId: string) => void;
  onResetPassword?: (userId: string) => void;
  onDelete?: (userId: string) => void;
  selectedUsers?: string[];
  onSelectionChange?: (userIds: string[]) => void;
}

export function UserManagementTable({
  users,
  isLoading,
  noDataMessage = "No users found",
  onEdit,
  onViewProfile,
  onResetPassword,
  onDelete,
  selectedUsers,
  onSelectionChange
}: UserManagementTableProps) {
  const queryClient = useQueryClient();

  const { mutate: updateRole } = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (!response.ok) throw new Error("Failed to update role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("Role updated");
    },
    onError: () => toast.error("Failed to update role"),
  });

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: ({ row }: { row: any }) => (
        <Select
          value={row.original.role}
          onValueChange={(value) => updateRole({ userId: row.original.id, role: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      )
    }
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        {noDataMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 md:px-6">
                Name
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-slate-700 md:table-cell md:px-6">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 md:px-6">
                Role
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 md:px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-800 md:px-6">
                  <div className="flex items-center">
                    <div className="md:hidden mr-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="font-medium">{user.name}</span>
                    <div className="md:hidden ml-2 text-slate-500 text-sm">
                      {user.email}
                    </div>
                  </div>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-slate-800 md:table-cell md:px-6">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-800 md:px-6">
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium md:px-6">
                  <div className="flex items-center justify-end space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="md:hidden">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => {
                          try {
                            if (onEdit) {
                              onEdit(user);
                            } else {
                              console.warn("No edit handler provided");
                            }
                          } catch (error) {
                            console.error("Error handling edit:", error);
                            toast.error("Failed to initiate edit");
                          }
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onDelete(user.id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="hidden md:flex md:space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          try {
                            if (onEdit) {
                              onEdit(user);
                            } else {
                              console.warn("No edit handler provided");
                            }
                          } catch (error) {
                            console.error("Error handling edit:", error);
                            toast.error("Failed to initiate edit");
                          }
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Edit"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(user.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

UserManagementTable.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onViewProfile: PropTypes.func,
  onResetPassword: PropTypes.func,
  onDelete: PropTypes.func,
  selectedUsers: PropTypes.array,
  onSelectionChange: PropTypes.func,
}; 