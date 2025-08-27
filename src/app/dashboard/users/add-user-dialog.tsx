
"use client"

import * as React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PlusCircle } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'
import type { User, Department, UserRole } from '@/lib/types'
import { getDepartments } from '@/lib/departments'
import { addUser } from '@/data/users'

const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters."}),
  role: z.enum(['Admin', 'Manager', 'Staff']),
  department: z.string().min(1, { message: 'Please select a department.' }),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface AddUserDialogProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  user?: User;
  onUserAdded?: (user: User) => void;
  organizationId: string;
}

export function AddUserDialog({ 
  isOpen: controlledIsOpen, 
  setIsOpen: setControlledIsOpen, 
  user,
  onUserAdded,
  organizationId
}: AddUserDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false)
  const { toast } = useToast()
  const [departments, setDepartments] = React.useState<Department[]>([]);

  React.useEffect(() => {
    if (organizationId) {
        getDepartments(organizationId).then(setDepartments);
    }
  }, [organizationId]);

  const isOpen = controlledIsOpen ?? internalIsOpen
  const setIsOpen = setControlledIsOpen ?? setInternalIsOpen

  const isEditMode = !!user

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role: user?.role || undefined,
      department: user?.departmentName || undefined,
    },
  })

  React.useEffect(() => {
    if (user) {
      form.reset({
        ...user,
        department: user.departmentName,
        password: ""
      })
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
        role: undefined,
        department: undefined,
      })
    }
  }, [user, form, isOpen])

  async function onSubmit(data: UserFormValues) {
    try {
        if (isEditMode) {
        // Logic for editing user will go here
        // For now, we just show a toast
        toast({
            title: "User Updated (Not Implemented)",
            description: `Editing for "${data.name}" is not yet connected.`,
        })
        } else {
        const newUser = await addUser({...data, organizationId}, organizationId);
        toast({
            title: "User Created",
            description: `User "${data.name}" has been successfully added.`,
        })
        if (onUserAdded) {
            onUserAdded(newUser);
        }
        }
        setIsOpen(false)
    } catch(e) {
        const error = e as Error;
        toast({
            title: "Operation failed",
            description: error.message,
            variant: "destructive"
        });
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (setControlledIsOpen) {
      setControlledIsOpen(open);
    } else {
      setInternalIsOpen(open);
    }
  }
  
  const trigger = !isEditMode ? (
    <DialogTrigger asChild>
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" /> Add User
      </Button>
    </DialogTrigger>
  ) : null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit User" : "Register New User"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of the user." : "Fill in the details to register a new user."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                    <Input placeholder="e.g. john.doe@kite.com" {...field} disabled={isEditMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEditMode && (<FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter a secure password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />)}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditMode ? "Save Changes" : "Register User"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
