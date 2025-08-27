
'use client'
import { Package, Wrench, Archive } from 'lucide-react'
import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { AssetsTable } from '@/app/dashboard/assets-table'
import { getAssets } from '@/data/assets'
import { AnalyticsView } from './analytics-view'
import { ReportsView } from './reports-view'
import type { Asset, User } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth'
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardOverviewPage() {
    const [assets, setAssets] = React.useState<Asset[]>([]);
    const [user, setUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchAssets = React.useCallback(async (orgId: string) => {
        if (!orgId) return;
        setIsLoading(true);
        try {
            const fetchedAssets = await getAssets(orgId);
            setAssets(fetchedAssets);
        } catch (error) {
            console.error("Failed to fetch assets:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        if (currentUser?.organizationId) {
            fetchAssets(currentUser.organizationId);
        } else {
            setIsLoading(false);
        }
    }, [fetchAssets]);

  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const inMaintenance = assets.filter(a => a.status === 'UnderMaintenance').length;
  const retired = assets.filter(a => a.status === 'Retired').length;

  const handleAssetUpdated = () => {
    if (user?.organizationId) {
        fetchAssets(user.organizationId);
    }
  }

  const handleAssetDeleted = (deletedAssetId: string) => {
    setAssets((prevAssets) => prevAssets.filter(asset => asset.id !== deletedAssetId));
  }
  
  const organizationId = user?.organizationId;

  const renderOverviewCards = () => {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
        )
    }
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Assets
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAssets}</div>
                <p className="text-xs text-muted-foreground">
                  Across all locations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Asset Value
                </CardTitle>
                <span className="text-muted-foreground text-lg font-bold">₦</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total purchase value
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{inMaintenance}</div>
                <p className="text-xs text-muted-foreground">
                  Assets currently being repaired
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retired</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{retired}</div>
                <p className="text-xs text-muted-foreground">
                  Assets no longer in service
                </p>
              </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
           Welcome {user?.name ?? ''}
        </h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports">
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          {renderOverviewCards()}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Assets</CardTitle>
                <CardDescription>
                  A list of recently added assets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 {isLoading ? <Skeleton className="h-48" /> : <AssetsTable assets={assets.slice(0, 5)} onAssetUpdated={handleAssetUpdated} onAssetDeleted={handleAssetDeleted} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          {isLoading ? <Skeleton className="h-80" /> : organizationId && <AnalyticsView assets={assets} />}
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <ReportsView assets={assets} />
        </TabsContent>
      </Tabs>
    </>
  )
}
