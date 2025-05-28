"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import OtpInput from 'react-otp-input'

const otpSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits')
})

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const { handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(otpSchema)
  })

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleSubmit(onSubmit)()
    }
  }, [otp])

  const onSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp })
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      toast.success('Email verified successfully!')
      // Redirect logic here
    } catch (error) {
      toast.error(error.message || 'Verification failed')
      setOtp('') // Reset OTP on error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Verify Your Email</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="!w-10 h-12 text-center border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                )}
                containerStyle="flex justify-center gap-2"
                inputType="number"
                shouldAutoFocus
              />
              {errors.code?.message && (
                <p className="text-sm text-destructive text-center">
                  {errors.code.message.toString()}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Email
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            <Button 
              variant="link" 
              className="h-auto p-0 text-blue-600"
              onClick={() => toast.success('New code sent!')}
            >
              Resend code
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 