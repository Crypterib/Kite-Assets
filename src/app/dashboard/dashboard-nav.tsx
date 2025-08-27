
'use client';

import Link from 'next/link';
import { Home, Package, Users, Settings, Wind, Globe } from 'lucide-react';
import { NavLink } from './nav-link';
import { getCurrentUser } from '@/lib/auth';
import * as React from 'react';
import type { User } from '@/lib/types';

interface DashboardNavProps {
    mobile?: boolean;
}

export function DashboardNav({ mobile = false }: DashboardNavProps) {
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    const isAdmin = user?.role === 'Admin';
    const isPlatformAdmin = user?.role === 'PlatformAdmin';

    if (mobile) {
        return (
            <nav className="grid gap-2 text-lg font-medium">
                <Link
                    href="#"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                    <Wind className="h-6 w-6 text-primary" />
                    <span className="sr-only">Kite Assets</span>
                </Link>
                <NavLink href="/dashboard" mobile>
                    <Home className="h-5 w-5" />
                    Dashboard
                </NavLink>
                <NavLink href="/dashboard/assets" mobile>
                    <Package className="h-5 w-5" />
                    Assets
                </NavLink>
                {isAdmin && !isPlatformAdmin && (
                  <>
                    <NavLink href="/dashboard/users" mobile>
                        <Users className="h-5 w-5" />
                        Users
                    </NavLink>
                    <NavLink href="/dashboard/settings" mobile>
                        <Settings className="h-5 w-5" />
                        Settings
                    </NavLink>
                  </>
                )}
                 {isPlatformAdmin && (
                    <NavLink href="/dashboard/platform" mobile>
                        <Globe className="h-5 w-5" />
                        Platform
                    </NavLink>
                )}
            </nav>
        )
    }

    return (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <NavLink href="/dashboard">
                <Home className="h-4 w-4" />
                Dashboard
            </NavLink>
            <NavLink href="/dashboard/assets">
                <Package className="h-4 w-4" />
                Assets
            </NavLink>
            {isAdmin && !isPlatformAdmin && (
                <>
                  <NavLink href="/dashboard/users">
                      <Users className="h-4 w-4" />
                      Users
                  </NavLink>
                  <NavLink href="/dashboard/settings">
                      <Settings className="h-4 w-4" />
                      Settings
                  </NavLink>
                </>
            )}
             {isPlatformAdmin && (
                <NavLink href="/dashboard/platform">
                    <Globe className="h-4 w-4" />
                    Platform
                </NavLink>
            )}
        </nav>
    );
}
