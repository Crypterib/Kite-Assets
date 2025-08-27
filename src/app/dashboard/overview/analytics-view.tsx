
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, Legend, Tooltip as RechartsTooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Asset } from "@/lib/types"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

interface AnalyticsViewProps {
    assets: Asset[];
}

export function AnalyticsView({ assets }: AnalyticsViewProps) {
  const assetsByStatus = React.useMemo(() => {
    const statusCounts: { [key: string]: number } = {
      "InUse": 0,
      "InStorage": 0,
      "UnderMaintenance": 0,
      "Retired": 0,
    }
    assets.forEach(asset => {
      if (statusCounts[asset.status] !== undefined) {
        statusCounts[asset.status]++
      }
    })
    return Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/([A-Z])/g, ' $1').trim(), value }))
  }, [assets])

  const assetsByCategory = React.useMemo(() => {
    const categoryCounts: { [key: string]: number } = {}
    assets.forEach(asset => {
      const categoryName = asset.categoryName;
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    })
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
  }, [assets])
  
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Assets by Status</CardTitle>
          <CardDescription>Distribution of assets across different statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="min-h-[300px] w-full">
            <BarChart data={assetsByStatus} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 15)}
              />
              <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={8}>
                 {assetsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assets by Category</CardTitle>
          <CardDescription>Distribution of assets across different categories.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={{}} className="min-h-[300px] w-full">
              <PieChart>
                 <RechartsTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={assetsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {assetsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
