
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wind } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { login } from "@/data/users"
import { login as loginInSession } from "@/lib/auth"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"


export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = React.useState(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL || "")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false);
  const [isForgotPassDialogOpen, setIsForgotPassDialogOpen] = React.useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    try {
      const user = await login(email, password)
      if (user) {
        loginInSession(user)
        router.push("/dashboard")
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
        })
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: "An unexpected error occurred.",
      })
    } finally {
        setIsLoading(false);
    }
  }
  
  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsForgotPassDialogOpen(true);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full shadow-lg">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <div className="bg-primary p-3 rounded-full">
                    <Wind className="h-8 w-8 text-primary-foreground" />
                </div>
            </div>
          <CardTitle className="text-2xl font-bold">Kite Assets</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@kite.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" onClick={handleForgotPasswordClick} className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
               <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline">
                    Sign up
                </Link>
                </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <AlertDialog open={isForgotPassDialogOpen} onOpenChange={setIsForgotPassDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              To reset your password, please contact the platform administrator at <span className="font-semibold text-primary">{process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL}</span>.
              They will provide you with a temporary password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsForgotPassDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
