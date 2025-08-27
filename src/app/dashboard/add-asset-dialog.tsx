
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
import type { Asset, AssetCategory, AssetLocation, AssetStatus } from '@/lib/types'
import { getAssetCategoriesForOrg } from '@/lib/assetCategories'
import { getAssetLocationsForOrg } from '@/lib/assetLocations'
import { addAsset, updateAsset } from '@/data/assets'


const assetFormSchema = z.object({
  name: z.string().min(2, {
    message: "Asset name must be at least 2 characters.",
  }),
  assetTag: z.string().min(1, { message: "Asset Tag is required." }),
  categoryName: z.string().min(1, { message: "Please select a category."}),
  locationName: z.string().min(1, { message: "Please select a location."}),
  value: z.coerce.number().min(0, { message: "Value must be a positive number."}),
  status: z.enum(['InUse', 'InStorage', 'UnderMaintenance', 'Retired'], {
    required_error: "You need to select an asset status.",
  }),
})

type AssetFormValues = z.infer<typeof assetFormSchema>

interface AddAssetDialogProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  asset?: Asset;
  onAssetAdded?: (asset: Asset) => void;
  onAssetUpdated?: () => void;
  organizationId: string;
}

export function AddAssetDialog({ 
  isOpen: controlledIsOpen, 
  setIsOpen: setControlledIsOpen, 
  asset,
  onAssetAdded,
  onAssetUpdated,
  organizationId,
}: AddAssetDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false)
  const [categories, setCategories] = React.useState<AssetCategory[]>([]);
  const [locations, setLocations] = React.useState<AssetLocation[]>([]);
  const { toast } = useToast()
  
  const statuses: AssetStatus[] = ['InUse', 'InStorage', 'UnderMaintenance', 'Retired'];

  React.useEffect(() => {
    if (organizationId) {
        getAssetCategoriesForOrg(organizationId).then(setCategories);
        getAssetLocationsForOrg(organizationId).then(setLocations);
    }
  }, [organizationId]);


  const isOpen = controlledIsOpen ?? internalIsOpen
  const setIsOpen = setControlledIsOpen ?? setInternalIsOpen

  const isEditMode = !!asset

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: asset?.name || "",
      assetTag: asset?.assetTag || "",
      categoryName: asset?.categoryName || undefined,
      locationName: asset?.locationName || undefined,
      value: asset?.value || 0,
      status: asset?.status || undefined,
    },
  })

  React.useEffect(() => {
    if (asset) {
      form.reset({
          name: asset.name,
          assetTag: asset.assetTag,
          categoryName: asset.categoryName,
          locationName: asset.locationName,
          value: asset.value,
          status: asset.status
      })
    } else {
      form.reset({
        name: "",
        assetTag: "",
        categoryName: undefined,
        locationName: undefined,
        value: 0,
        status: 'InStorage',
      })
    }
  }, [asset, form, isOpen])

  async function onSubmit(data: AssetFormValues) {
    try {
      if (isEditMode && asset) {
        await updateAsset(asset.id, data, organizationId);
        toast({
          title: "Asset Updated",
          description: `Asset "${data.name}" has been successfully updated.`,
        })
        if (onAssetUpdated) {
          onAssetUpdated();
        }
      } else {
        const newAsset = await addAsset({...data, organizationId }, organizationId);
        toast({
          title: "Asset Created",
          description: `Asset "${data.name}" has been successfully registered.`,
        })
        if (onAssetAdded) {
          onAssetAdded(newAsset);
        }
      }
      setIsOpen(false)
    } catch (error) {
      if (error instanceof Error) {
         toast({
          title: "Operation Failed",
          description: error.message,
          variant: "destructive"
        })
      }
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (setControlledIsOpen) {
        setControlledIsOpen(open)
    } else {
        setInternalIsOpen(open)
    }
  }
  
  const trigger = !isEditMode ? (
    <DialogTrigger asChild>
      <Button onClick={() => setInternalIsOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Asset
      </Button>
    </DialogTrigger>
  ) : null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Asset" : "Register New Asset"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of the asset." : "Fill in the details to register a new asset."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MacBook Pro 16&quot;" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assetTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Tag</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. KITE-011" {...field} disabled={isEditMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="locationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 1500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>{status.replace(/([A-Z])/g, ' $1').trim()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEditMode ? "Save Changes" : "Register Asset"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
