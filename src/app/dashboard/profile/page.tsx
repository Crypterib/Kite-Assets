
'use client';

import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, updateUserInSession } from '@/lib/auth';
import { updateUser } from '@/data/users';
import type { User } from '@/lib/types';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters."}).optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    setUser(getCurrentUser());
  }, []);
  

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    },
  })

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: "",
        confirmPassword: ""
      })
    }
  }, [user, form]);
  
  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    try {
        const updatedUser = await updateUser(user.id, {
            name: data.name,
            password: data.password || undefined,
        });
        
        if (updatedUser) {
        updateUserInSession(updatedUser);
        toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully.",
        })
        // Force a re-render of nav by reloading the page
        window.location.reload();
        } else {
        toast({
            title: "Update Failed",
            description: "Could not update your profile.",
            variant: 'destructive',
        })
        }
    } catch(error) {
        toast({
            title: "Update Failed",
            description: "An unexpected error occurred.",
            variant: 'destructive',
        })
    }
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            Update your account details and password here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. john.doe@kite.com" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='text-sm font-medium'>Change Password</div>
               <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter a new secure password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">Update Profile</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
