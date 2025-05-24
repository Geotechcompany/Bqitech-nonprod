import { getProviders } from "next-auth/react"
import { LoginForm } from "../../../components/LoginForm"
import FloatingShapes from "../../../components/FloatingShapes"

export default async function LoginPage() {
  let providers = {}
  
  try {
    providers = await getProviders() || {}
  } catch (error) {
    console.error("Failed to fetch providers:", error)
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#31CDFF]/10 to-blue-500/10">
      <FloatingShapes />
      <div className="relative z-10 bg-background p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            Welcome Back
          </h2>
          <p className="text-muted-foreground">
            Sign in to your account
          </p>
        </div>
        <LoginForm providers={providers} />
      </div>
    </div>
  );
} 