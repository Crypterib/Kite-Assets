
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDepartments, addDepartment, removeDepartment } from '@/lib/departments';
import { getAssetCategoriesForOrg, addAssetCategory, removeAssetCategory } from '@/lib/assetCategories';
import { getAssetLocationsForOrg, addAssetLocation, removeAssetLocation } from '@/lib/assetLocations';
import { getCurrentUser } from '@/lib/auth';
import type { Department, AssetCategory, AssetLocation, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ManagementSectionProps<T extends { id: string; name: string }> {
  title: string;
  description: string;
  items: T[];
  onAddItem: (name: string) => Promise<void>;
  onRemoveItem: (item: T) => Promise<void>;
  newItemPlaceholder: string;
  newItemId: string;
  isLoading: boolean;
}

const ManagementSection = <T extends { id: string; name: string }>({
  title,
  description,
  items,
  onAddItem,
  onRemoveItem,
  newItemPlaceholder,
  newItemId,
  isLoading,
}: ManagementSectionProps<T>) => {
  const [newItem, setNewItem] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) {
        toast({ title: "Input Required", description: "Please enter a name.", variant: 'destructive'});
        return;
    }
    if (items.find(i => i.name.toLowerCase() === newItem.toLowerCase())) {
        toast({ title: "Duplicate", description: `"${newItem}" already exists.`, variant: 'destructive'});
        return;
    }
      
    setIsSubmitting(true);
    await onAddItem(newItem);
    setNewItem('');
    setIsSubmitting(false);
  };
  
  const handleRemoveItem = async (item: T) => {
    await onRemoveItem(item);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-32 w-full" /> : (
            <div className="space-y-4">
            <div className="space-y-2">
                <Label>{title}</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                    <span className="font-medium">{item.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    </div>
                ))}
                {items.length === 0 && <p className="text-sm text-muted-foreground">No items added yet.</p>}
                </div>
            </div>

            <form onSubmit={handleAddItem} className="flex items-end gap-2">
                <div className="grid flex-1 gap-2">
                <Label htmlFor={newItemId}>Add New {title.slice(0, -1)}</Label>
                <Input
                    id={newItemId}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={newItemPlaceholder}
                    disabled={isSubmitting}
                />
                </div>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add"}</Button>
            </form>
            </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [categories, setCategories] = React.useState<AssetCategory[]>([]);
  const [locations, setLocations] = React.useState<AssetLocation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const organizationId = user?.organizationId;

  React.useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser?.organizationId) {
      const orgId = currentUser.organizationId;
      setIsLoading(true);
      Promise.all([
        getDepartments(orgId),
        getAssetCategoriesForOrg(orgId),
        getAssetLocationsForOrg(orgId)
      ]).then(([depts, cats, locs]) => {
        setDepartments(depts);
        setCategories(cats);
        setLocations(locs);
      }).finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, []);

  const handleAdd = async (
    name: string, 
    addFn: (name: string, orgId: string) => Promise<any>, 
    updateFn: React.Dispatch<React.SetStateAction<any[]>>,
    itemType: string
  ) => {
    if (!organizationId) return;
    try {
        const newItem = await addFn(name, organizationId);
        if (newItem) {
            updateFn(prev => [newItem, ...prev]);
            toast({
            title: `${itemType} Added`,
            description: `"${name}" has been added.`,
            });
        }
    } catch (error) {
        const err = error as Error;
        toast({ title: "Error", description: err.message || `Failed to add ${itemType}.`, variant: 'destructive'});
    }
  };

  const handleRemove = async (
    item: { id: string; name: string },
    removeFn: (id: string, orgId: string) => Promise<void>,
    updateFn: React.Dispatch<React.SetStateAction<any[]>>,
    itemType: string
  ) => {
    if (!organizationId) return;
    try {
        await removeFn(item.id, organizationId);
        updateFn(prev => prev.filter(i => i.id !== item.id));
        toast({
        title: `${itemType} Removed`,
        description: `"${item.name}" has been removed.`,
        });
    } catch (error) {
        const err = error as Error;
        toast({ title: "Error", description: err.message || `Failed to remove ${itemType}.`, variant: 'destructive'});
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ManagementSection 
          title="Departments"
          description="Manage departments for your organization."
          items={departments}
          onAddItem={(name) => handleAdd(name, addDepartment, setDepartments, 'Department')}
          onRemoveItem={(item) => handleRemove(item, removeDepartment, setDepartments, 'Department')}
          newItemPlaceholder="e.g. Finance"
          newItemId="new-department"
          isLoading={isLoading}
        />

        <ManagementSection 
          title="Asset Categories"
          description="Manage categories for your assets."
          items={categories}
          onAddItem={(name) => handleAdd(name, addAssetCategory, setCategories, 'Category')}
          onRemoveItem={(item) => handleRemove(item, removeAssetCategory, setCategories, 'Category')}
          newItemPlaceholder="e.g. Laptops"
          newItemId="new-category"
          isLoading={isLoading}
        />

        <ManagementSection 
          title="Asset Locations"
          description="Manage locations where assets are stored."
          items={locations}
          onAddItem={(name) => handleAdd(name, addAssetLocation, setLocations, 'Location')}
          onRemoveItem={(item) => handleRemove(item, removeAssetLocation, setLocations, 'Location')}
          newItemPlaceholder="e.g. Main Office"
          newItemId="new-location"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
