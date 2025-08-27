
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getCurrentUser } from '@/lib/auth';
import { getAllOrganizations } from '@/data/organizations';
import { getUsers, updateUserPassword } from '@/data/users';
import type { Organization, User } from '@/lib/types';
import { KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface OrganizationWithUsers extends Organization {
  users?: User[];
}

function UserList({ users, onPasswordReset }: { users: User[], onPasswordReset: (user: User) => void }) {

  const handleResetPassword = (user: User) => {
    if (confirm(`Are you sure you want to reset the password for ${user.name}? This cannot be undone.`)) {
        onPasswordReset(user);
    }
  }

  return (
    <div className="pl-4 pr-4 pb-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {user.role === 'Admin' && (
                  <Button variant="outline" size="sm" onClick={() => handleResetPassword(user)}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Reset Password
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function PlatformAdminPage() {
  const [organizations, setOrganizations] = React.useState<OrganizationWithUsers[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [openAccordion, setOpenAccordion] = React.useState<string | undefined>();
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    const user = getCurrentUser();
    // Use role for authorization, not email
    if (user?.role !== 'PlatformAdmin') {
      toast({ title: "Unauthorized", description: "You don't have access to this page.", variant: "destructive"});
      router.push('/dashboard');
      return;
    }

    setIsLoading(true);
    getAllOrganizations()
      .then(orgs => {
        setOrganizations(orgs);
      })
      .catch(error => {
        toast({
          title: "Error",
          description: (error as Error).message,
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [toast, router]);

  const fetchUsersForOrg = async (orgId: string) => {
    // Avoid refetching if users are already loaded
    const org = organizations.find(o => o.id === orgId);
    if (org && org.users) return;

    try {
        const fetchedUsers = await getUsers(orgId);
        setOrganizations(prevOrgs =>
            prevOrgs.map(o =>
            o.id === orgId ? { ...o, users: fetchedUsers } : o
            )
        );
    } catch(error) {
        const err = error as Error;
        toast({ title: "Error fetching users", description: err.message, variant: "destructive" });
    }
  };
  
  const handlePasswordReset = async (userToReset: User) => {
      try {
        const newPassword = 'password123';
        await updateUserPassword(userToReset.id, newPassword);
        toast({
            title: "Password Reset Successful",
            description: `Password for ${userToReset.name} has been reset to "${newPassword}".`,
        });
      } catch(error) {
        const err = error as Error;
        toast({ title: "Password Reset Failed", description: err.message, variant: "destructive" });
      }
  }

  const handleAccordionChange = (value?: string) => {
      setOpenAccordion(value);
      if (value) {
          fetchUsersForOrg(value);
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Platform Management</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Registered Organizations</CardTitle>
          <CardDescription>
            View and manage all organizations on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Accordion type="single" collapsible value={openAccordion} onValueChange={handleAccordionChange}>
              {organizations.map(org => (
                <AccordionItem value={org.id} key={org.id}>
                  <AccordionTrigger className="p-4 hover:bg-muted/50">
                    <div className="flex justify-between items-center w-full pr-4">
                        <span className="font-semibold text-lg">{org.name}</span>
                        <span className="text-sm text-muted-foreground">
                            Created: {format(new Date(org.createdAt), 'PPP')}
                        </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {org.users ? <UserList users={org.users} onPasswordReset={handlePasswordReset} /> : <div className="p-4 text-center">Loading users...</div>}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
