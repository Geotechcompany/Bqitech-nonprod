import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold mb-4">Admin Resource Not Found</h2>
      <p className="text-gray-600 mb-8">
        The requested admin resource could not be found
      </p>
      <Button asChild>
        <Link href="/admin">Return to Dashboard</Link>
      </Button>
    </div>
  )
} 