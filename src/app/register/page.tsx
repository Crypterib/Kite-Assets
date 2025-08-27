
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Wind } from "lucide-react"
import { login } from "@/lib/auth"
import { createOrganizationAndFirstUser } from "@/data/organizations"


const registerFormSchema = z.object({
  orgName: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  userName: z.string().min(2, {
    message: "Your name must be at least 2 characters.",
  }),
  userEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  userPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

type RegisterFormValues = z.infer<typeof registerFormSchema>


export default function RegisterPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            orgName: "",
            userName: "",
            userEmail: "",
            userPassword: "",
        },
    })

    async function onSubmit(data: RegisterFormValues) {
        setIsLoading(true);
        try {
            const user = await createOrganizationAndFirstUser(data);
            if (user) {
                login(user);
                toast({
                    title: "Registration Successful",
                    description: `Welcome to Kite Assets, ${user.name}!`,
                })
                router.push("/dashboard")
            }
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: "Registration Failed",
                    description: error.message,
                    variant: "destructive",
                })
            } else {
                 toast({
                    title: "Registration Failed",
                    description: "An unexpected error occurred. Please try again.",
                    variant: "destructive",
                })
            }
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <div className="bg-primary p-3 rounded-full">
                    <Wind className="h-8 w-8 text-primary-foreground" />
                </div>
            </div>
          <CardTitle className="text-2xl font-bold">Create your Account</CardTitle>
          <CardDescription>
            Join Kite Assets and start managing your inventory seamlessly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="orgName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Inc." {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. john@acme.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter a secure password" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
               <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                    Log in
                </Link>
                </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
