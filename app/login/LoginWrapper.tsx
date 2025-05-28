"use client"

import { LoginForm } from "@/components/LoginForm"
import { toast } from "react-hot-toast"

export default function LoginWrapper({ providers }: { providers: any }) {
  const handleLoginError = (error: string) => {
    if (error === "VERIFICATION_REQUIRED") {
      toast.error("Email verification required - check your inbox", {
        position: "top-center",
        style: { background: '#fff', color: '#dc2626' }
      });
    } else {
      toast.error(error || "Invalid credentials", {
        position: "top-center",
        style: { background: '#fff', color: '#dc2626' }
      });
    }
  }

  return <LoginForm providers={providers} onError={handleLoginError} />
} 