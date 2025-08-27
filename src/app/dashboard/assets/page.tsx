
'use client';

import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { AssetsTable } from '@/app/dashboard/assets-table'
import { AddAssetDialog } from '@/app/dashboard/add-asset-dialog'
import { getAssets } from '@/data/assets'
import type { Asset, User } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function AssetsPage() {
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

  const handleAssetAdded = (newAsset: Asset) => {
    setAssets((prevAssets) => [newAsset, ...prevAssets]);
  };
  
  const handleAssetUpdated = () => {
    if (user?.organizationId) {
        fetchAssets(user.organizationId);
    }
  }

  const handleAssetDeleted = (deletedAssetId: string) => {
    setAssets((prevAssets) => prevAssets.filter(asset => asset.id !== deletedAssetId));
  }

  const canAddAsset = user?.role === 'Admin' || user?.role === 'Manager';
  const organizationId = user?.organizationId;

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
      </div>
      <div>
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Your Inventory</CardTitle>
              <CardDescription>
                A list of all assets in your inventory.
              </CardDescription>
            </div>
            {canAddAsset && organizationId && <AddAssetDialog organizationId={organizationId} onAssetAdded={handleAssetAdded} onAssetUpdated={handleAssetUpdated} />}
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <AssetsTable assets={assets} onAssetUpdated={handleAssetUpdated} onAssetDeleted={handleAssetDeleted} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
