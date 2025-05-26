"use client"

import { cn } from "@/lib/utils"

export function PasswordStrengthMeter({ strengthResult }: { strengthResult: { score: number } }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-full rounded-full transition-all",
              i < strengthResult.score + 1
                ? strengthResult.score === 3
                  ? "bg-green-500"
                  : strengthResult.score === 2
                  ? "bg-yellow-500"
                  : "bg-red-500"
                : "bg-gray-200"
            )}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {['Very Weak', 'Weak', 'Fair', 'Strong'][strengthResult.score]}
      </p>
    </div>
  )
} 