"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Mail, Lock, Github, Chrome, ArrowRight, UserPlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "next-auth/react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export function LoginForm({ 
  providers,
  onError 
}: { 
  providers: any,
  onError?: (error: string) => void 
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        ...data,
        redirect: false
      })

      if (result?.error) {
        const errorMessage = result.error.includes("does not exist") || 
                            result.error.includes("Incorrect password")
                          ? "Invalid email or password"
                          : result.error;
        
        onError?.(errorMessage);
      }

      const session = await getSession()
      
      if (result?.ok) {
        if (!session?.user?.emailVerified) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
        } else {
          window.location.href = "/dashboard"
        }
      }
    } catch (error) {
      onError?.(error.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-8"
    >
      <div className="text-center space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Welcome Back
        </motion.h1>
        <p className="text-muted-foreground">
          Sign in to your account
        </p>
      </div>

      <motion.form
        onSubmit={form.handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...form.register("email", { required: true })}
              className="h-12 focus:ring-2 focus:ring-[#31CDFF]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#31CDFF] hover:text-[#31CDFF]/90"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register("password", { required: true })}
              className="h-12 focus:ring-2 focus:ring-[#31CDFF]"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base bg-gradient-to-r from-[#31CDFF] to-blue-500 hover:from-[#31CDFF]/90 hover:to-blue-500/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-[#31CDFF] hover:underline"
          >
            Sign up
          </Link>
        </div>
      </motion.form>
    </motion.div>
  )
} 