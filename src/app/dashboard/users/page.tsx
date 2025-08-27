
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { UsersTable } from '@/app/dashboard/users/users-table'
import { AddUserDialog } from '@/app/dashboard/users/add-user-dialog'
import { getUsers } from '@/data/users';
import type { User } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user?.organizationId) {
      setIsLoading(true);
      getUsers(user.organizationId)
        .then(setUsers)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleUserAdded = (newUser: User) => {
    setUsers((prevUsers) => [newUser, ...prevUsers]);
  };
  
  const handleUserDeleted = (deletedUserId: string) => {
    setUsers((prevUsers) => prevUsers.filter(user => user.id !== deletedUserId));
  }

  const isAdmin = currentUser?.role === 'Admin';
  const organizationId = currentUser?.organizationId;


  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>
      <div>
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>
                A list of all users in your organization.
              </CardDescription>
            </div>
            {isAdmin && organizationId && <AddUserDialog organizationId={organizationId} onUserAdded={handleUserAdded} />}
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <UsersTable users={users} onUserDeleted={handleUserDeleted} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
