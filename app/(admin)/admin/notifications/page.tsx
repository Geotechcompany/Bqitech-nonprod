"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { notificationService } from "@/lib/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Trash2, 
  Bell, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  Filter,
  X 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { adminApi } from "@/lib/api-backend";
import { getSession } from "@/lib/auth-backend";

type FilterType = 'all' | 'unread' | 'read';
type NotificationType = 'all' | 'info' | 'warning' | 'error' | 'success';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getNotificationColors = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 hover:border-green-300 dark:bg-green-950/20 dark:border-green-800';
    case 'error':
      return 'bg-red-50 border-red-200 hover:border-red-300 dark:bg-red-950/20 dark:border-red-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 hover:border-yellow-300 dark:bg-yellow-950/20 dark:border-yellow-800';
    default:
      return 'bg-blue-50 border-blue-200 hover:border-blue-300 dark:bg-blue-950/20 dark:border-blue-800';
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType>('all');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const { data = [], isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => adminApi.getNotifications(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => adminApi.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('Notification marked as read');
    },
    onError: () => {
      toast.error('Failed to mark notification as read');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) => adminApi.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('Notification deleted');
    },
    onError: () => {
      toast.error('Failed to delete notification');
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => adminApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark all notifications as read');
    }
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const session = getSession();
      if (!session?.token) {
        throw new Error('No auth token available');
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:9000'}/api/admin/notifications/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to seed notifications');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('Sample notifications created');
    },
    onError: () => {
      toast.error('Failed to create sample notifications');
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const filteredNotifications = data.filter(notification => {
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'unread' ? !notification.isRead :
      notification.isRead;

    const matchesType = 
      typeFilter === 'all' ? true :
      notification.type === typeFilter;

    return matchesStatus && matchesType;
  });

  const unreadCount = data.filter(n => !n.isRead).length;

  if (authLoading || isLoadingNotifications) {
    return (
      <AdminPageLayout title="Notifications">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-primary border-t-transparent"></div>
        </div>
      </AdminPageLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <>
      <AdminPageHeader title="Notifications" />
      
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-muted-foreground mt-2">
                {unreadCount 
                  ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                  : 'All caught up!'
                }
              </p>
            </div>

            {/* Desktop Actions and Filters */}
            <div className="hidden sm:flex items-center gap-3">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Mark All Read
                </Button>
              )}

              <Select value={statusFilter} onValueChange={(value: FilterType) => setStatusFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(value: NotificationType) => setTypeFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Actions and Filters */}
            <div className="sm:hidden space-y-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="w-full flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Mark All Read
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {(statusFilter !== 'all' || typeFilter !== 'all') && (
                      <Badge variant="secondary" className="ml-2">
                        {((statusFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0))}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('all')}
                    className={statusFilter === 'all' ? 'bg-primary/10' : ''}
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('unread')}
                    className={statusFilter === 'unread' ? 'bg-primary/10' : ''}
                  >
                    Unread
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('read')}
                    className={statusFilter === 'read' ? 'bg-primary/10' : ''}
                  >
                    Read
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => setTypeFilter('all')}
                    className={typeFilter === 'all' ? 'bg-primary/10' : ''}
                  >
                    All Types
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTypeFilter('info')}
                    className={typeFilter === 'info' ? 'bg-primary/10' : ''}
                  >
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    Info
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTypeFilter('success')}
                    className={typeFilter === 'success' ? 'bg-primary/10' : ''}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Success
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTypeFilter('warning')}
                    className={typeFilter === 'warning' ? 'bg-primary/10' : ''}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                    Warning
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTypeFilter('error')}
                    className={typeFilter === 'error' ? 'bg-primary/10' : ''}
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    Error
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active Filters */}
          {(statusFilter !== 'all' || typeFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4">
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1">
                  {statusFilter}
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className="ml-2 hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {typeFilter !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1">
                  {typeFilter}
                  <button 
                    onClick={() => setTypeFilter('all')}
                    className="ml-2 hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16 bg-gradient-to-b from-background to-muted rounded-xl border border-border/50"
            >
              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full"></div>
                <Bell className="h-16 w-16 text-primary relative" />
              </div>
              <p className="text-xl font-semibold mt-6 text-foreground">No notifications found</p>
              <p className="text-muted-foreground">Try adjusting your filters</p>
              <div className="flex gap-2 mt-4">
                {(statusFilter !== 'all' || typeFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                {statusFilter === 'all' && typeFilter === 'all' && (
                  <Button 
                    variant="default"
                    onClick={() => seedMutation.mutate()}
                    disabled={seedMutation.isPending}
                  >
                    {seedMutation.isPending ? 'Creating...' : 'Create Sample Notifications'}
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "rounded-lg border transition-all duration-200",
                    "hover:shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02]",
                    !notification.isRead && "ring-2 ring-primary/20",
                    getNotificationColors(notification.type)
                  )}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">
                            {notification.title}
                          </h3>
                          <Badge variant={
                            notification.type === 'error' ? 'destructive' :
                            notification.type === 'warning' ? 'secondary' :
                            notification.type === 'success' ? 'default' :
                            'outline'
                          }>
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-2">Mark as read</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(notification.id)}
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}