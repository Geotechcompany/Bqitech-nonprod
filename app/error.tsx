'use client';

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="p-4 bg-background text-foreground">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Application Error</h1>
          <pre className="mb-4 p-4 bg-destructive/10 rounded-md overflow-auto">
            {error.message}
          </pre>
          <div className="flex gap-4">
            <Button onClick={() => reset()}>Try Again</Button>
            <Button variant="outline" asChild>
              <a href="/">Return Home</a>
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
} 