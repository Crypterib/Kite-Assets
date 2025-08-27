
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { MoreHorizontal, QrCode, Edit, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Asset, User } from "@/lib/types"
import { QrCodeDialog } from "./qr-code-dialog"
import { AddAssetDialog } from "./add-asset-dialog"
import { getCurrentUser } from "@/lib/auth"
import { deleteAsset } from "@/data/assets"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const AssetActions = ({ asset, onAssetUpdated, onAssetDeleted }: { asset: Asset, onAssetUpdated: () => void, onAssetDeleted: (id: string) => void }) => {
  const [isQrDialogOpen, setIsQrDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)
  const { toast } = useToast()

  React.useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleDelete = async () => {
    if (!user?.organizationId) {
        toast({ title: "Operation Failed", description: "Could not determine organization.", variant: "destructive" });
        return;
    }
    try {
      await deleteAsset(asset.id, user.organizationId)
      onAssetDeleted(asset.id)
      toast({
        title: "Asset Deleted",
        description: `Asset "${asset.name}" has been successfully deleted.`,
      })
    } catch (error) {
       if (error instanceof Error) {
        toast({
          title: "Operation Failed",
          description: error.message,
          variant: "destructive"
        })
      }
    }
    setIsDeleteDialogOpen(false)
  }

  const canEdit = user?.role === 'Admin' || user?.role === 'Manager'
  const canDelete = user?.role === 'Admin'
  const organizationId = user?.organizationId;


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsQrDialogOpen(true)}>
            <QrCode className="mr-2 h-4 w-4" />
            <span>View QR Code</span>
          </DropdownMenuItem>
          {canEdit && (
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Asset</span>
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <QrCodeDialog isOpen={isQrDialogOpen} setIsOpen={setIsQrDialogOpen} asset={asset} />
      
      {canEdit && organizationId && (
        <AddAssetDialog isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} asset={asset} onAssetUpdated={onAssetUpdated} organizationId={organizationId} />
      )}

      {canDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will mark the asset as deleted. It can be recovered later from the database by an administrator.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}



interface AssetsTableProps {
    assets: Asset[];
    onAssetUpdated: () => void;
    onAssetDeleted: (id: string) => void;
}

export function AssetsTable({ assets, onAssetUpdated, onAssetDeleted }: AssetsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<Asset>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "assetTag",
      header: "Asset Tag",
      cell: ({ row }) => <div>{row.getValue("assetTag")}</div>,
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => <div>{row.getValue("categoryName")}</div>,
    },
    {
      accessorKey: "locationName",
      header: "Location",
      cell: ({ row }) => <div>{row.getValue("locationName")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variant = {
          "InUse": "default",
          "InStorage": "secondary",
          "UnderMaintenance": "outline",
          "Retired": "destructive",
        }[status] ?? "default"
  
        return <Badge variant={variant as any}>{status.replace(/([A-Z])/g, ' $1').trim()}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <AssetActions asset={row.original} onAssetUpdated={onAssetUpdated} onAssetDeleted={onAssetDeleted} />,
    },
  ]

  const table = useReactTable({
    data: assets,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter assets by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
