
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Download, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateFullInventoryReport, generateMaintenanceReport, generateRetiredAssetsReport } from "@/lib/reports"
import type { Asset, User } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"

interface ReportsViewProps {
  assets: Asset[];
}

export function ReportsView({ assets }: ReportsViewProps) {
    const { toast } = useToast()
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    const orgName = user?.organization?.name || "Your Organization";

    const handleDownload = (reportGenerator: (assets: Asset[], orgName: string) => void, reportName: string) => {
        toast({
            title: "Report Generation Started",
            description: `Your "${reportName}" is being generated and will download shortly.`,
        })
        try {
            reportGenerator(assets, orgName)
        } catch (error) {
            console.error("Failed to generate report:", error);
            toast({
                title: "Report Generation Failed",
                description: `Could not generate the "${reportName}". Please try again.`,
                variant: 'destructive',
            })
        }
    }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>
            Download detailed reports for your assets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <h3 className="font-semibold">Full Inventory Report</h3>
                        <p className="text-sm text-muted-foreground">A complete list of all assets in your inventory.</p>
                    </div>
                </div>
                <Button onClick={() => handleDownload(generateFullInventoryReport, 'Full Inventory Report')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </Button>
            </div>
             <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <h3 className="font-semibold">Maintenance Report</h3>
                        <p className="text-sm text-muted-foreground">List of all assets currently under maintenance.</p>
                    </div>
                </div>
                <Button onClick={() => handleDownload(generateMaintenanceReport, 'Maintenance Report')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </Button>
            </div>
             <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <h3 className="font-semibold">Retired Assets Report</h3>
                        <p className="text-sm text-muted-foreground">All assets that have been marked as retired.</p>
                    </div>
                </div>
                <Button onClick={() => handleDownload(generateRetiredAssetsReport, 'Retired Assets Report')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
