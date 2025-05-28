"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface PasswordRequirement {
  label: string
  check: (password: string) => boolean
  hint?: string
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', check: (p) => p.length >= 8 },
  { label: '1 uppercase letter', check: (p) => /[A-Z]/.test(p) },
  { label: '1 lowercase letter', check: (p) => /[a-z]/.test(p) },
  { label: '1 number', check: (p) => /[0-9]/.test(p) },
  { label: '1 special character', check: (p) => /[^A-Za-z0-9]/.test(p) },
]

export function PasswordStrengthMeter({ 
  password,
  strengthResult 
}: { 
  password: string
  strengthResult: { score: number } 
}) {
  
  const [isVisible, setIsVisible] = useState(false)

  const getStrengthLabel = () => {
    const labels = [
      'Very Weak',
      'Weak - Add more complexity',
      'Fair - Could be stronger',
      'Strong - Good job!',
      'Very Strong'
    ]
    return labels[strengthResult.score] || ''
  }

  if (!password) return null

  return (
    <div className="space-y-4">

      {/* Strength Bars */}
      <div className="flex gap-1.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 w-full rounded-full transition-all duration-500",
              i < strengthResult.score + 1
                ? strengthResult.score >= 3
                  ? "bg-green-500"
                  : strengthResult.score >= 2
                  ? "bg-amber-400"
                  : "bg-red-500"
                : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        ))}
      </div>

      {/* Strength Text */}
      <p className={cn(
        "text-sm font-medium transition-colors duration-300",
        strengthResult.score >= 3 ? "text-green-600 dark:text-green-400" :
        strengthResult.score >= 2 ? "text-amber-600 dark:text-amber-400" :
        "text-red-600 dark:text-red-400"
      )}>
        {getStrengthLabel()}
      </p>

      {/* Validation Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {requirements.map((req, i) => {
          const isMet = req.check(password)
          return (
            <div 
              key={i}
              className="flex items-center gap-2 text-sm transition-opacity"
              style={{ opacity: password.length > 0 ? 1 : 0.6 }}
            >
              {isMet ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <span className={cn(
                "transition-colors",
                isMet ? "text-green-700 dark:text-green-300" : 
                password.length > 0 ? "text-red-700 dark:text-red-300" : 
                "text-gray-600 dark:text-gray-400"
              )}>
                {req.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
} 