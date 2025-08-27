
import Link from 'next/link'
import {
  Bell,
  Wind,
  PanelLeft,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserNav } from '@/components/user-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { DashboardNav } from './dashboard-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Wind className="h-6 w-6 text-primary" />
              <span className="">Kite Assets</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <DashboardNav />
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <a href="mailto:suleezee123@gmail.com?subject=Request%20to%20Upgrade%20to%20Kite%20Assets%20Pro">
                  <Button size="sm" className="w-full">
                    Upgrade
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                    >
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                    <DashboardNav mobile />
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1" />
            <ThemeToggle />
            <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background/95">
          {children}
        </main>
      </div>
    </div>
  )
}
