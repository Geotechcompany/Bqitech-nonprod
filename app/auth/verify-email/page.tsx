"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'

const otpSchema = z.object({
  code: z.string().length(6, 'Code must be 6 characters')
})

export default function VerifyEmailPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(otpSchema)
  })

  const onSubmit = async (data: z.infer<typeof otpSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.code })
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      toast.success('Email verified successfully!')
      // Redirect or update UI state here
    } catch (error) {
      toast.error(error.message || 'Verification failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Verify Your Email</h1>
          <p className="text-muted-foreground mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              {...register('code')}
              id="code"
              placeholder="123456"
              className="text-center text-xl font-mono tracking-[0.5em]"
              maxLength={6}
              autoComplete="one-time-code"
            />
            {errors.code?.message && (
              <p className="text-sm text-destructive">
                {String(errors.code.message)}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Email
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Didn't receive the code?{' '}
          <Link href="/resend-verification" className="text-primary underline">
            Resend code
          </Link>
        </div>
      </div>
    </div>
  )
} 