"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Check, AlertCircle, Info, X } from "lucide-react"

interface NotificationButtonProps {
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
  className?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  date: string
  isRead: boolean
}

const fetcher = async (url: string): Promise<{ notifications: Notification[] }> => {
  const res = await fetch(url)
  return res.json()
}

export function NotificationButton({ 
  variant = "outline", 
  size = "sm",
  className 
}: NotificationButtonProps) {
  const router = useRouter()
  const { data } = useSWR('/api/admin/notifications', fetcher)

  const unreadCount = data?.notifications?.filter(n => !n.isRead).length || 0
  const recentNotifications = data?.notifications?.slice(0, 4) || []

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("relative", className)}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-[380px] p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>

        <AnimatePresence>
          {recentNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotifications.map((notification: any, index: number) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer",
                    !notification.isRead && "bg-blue-50/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium text-gray-900 truncate",
                        !notification.isRead && "font-semibold"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {new Date(notification.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <DropdownMenuSeparator className="my-4" />
        
        <Button 
          variant="outline" 
          className="w-full justify-center hover:bg-gray-50"
          onClick={() => router.push('/admin/notifications')}
        >
          View All Notifications
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 