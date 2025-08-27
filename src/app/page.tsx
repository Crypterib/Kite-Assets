
import Link from 'next/link';
import { Wind, ArrowRight, ShieldCheck, Zap, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center justify-start">
            <Wind className="h-6 w-6 text-primary" />
            <span className="ml-2 font-bold">Kite Assets</span>
          </Link>
          <nav className="ml-auto flex items-center space-x-2">
            <Button asChild>
              <Link href="/login">
                Get Started <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container text-center">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Effortless Asset Management
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Kite Assets provides a seamless solution to track, manage, and optimize your company's valuable assets from anywhere.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/login">
                  Access Your Dashboard
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container grid gap-12 px-4 md:px-6 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary p-4 text-primary-foreground">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">Real-Time Tracking</h3>
              <p className="mt-2 text-muted-foreground">
                Instantly locate any asset with QR code integration and live location updates.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary p-4 text-primary-foreground">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">Secure & Reliable</h3>
              <p className="mt-2 text-muted-foreground">
                Your data is protected with enterprise-grade security and reliable cloud infrastructure.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary p-4 text-primary-foreground">
                <Server className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">Centralized System</h3>
              <p className="mt-2 text-muted-foreground">
                Manage your entire inventory from a single, intuitive dashboard.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Kite Assets. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
