"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  UtensilsCrossed,
  MonitorDot,
  CreditCard,
  Menu,
  Receipt,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navLinks = [
  {
    href: "/pos",
    label: "POS (Tables)",
    icon: LayoutGrid,
    description: "Table management",
  },
  {
    href: "/menu/1",
    label: "Menu Order",
    icon: UtensilsCrossed,
    description: "Order menu items",
  },
  {
    href: "/kds",
    label: "Kitchen Display",
    icon: MonitorDot,
    description: "Kitchen queue",
  },
  {
    href: "/checkout/1",
    label: "Checkout",
    icon: CreditCard,
    description: "Payment screen",
  },
  {
    href: "/transactions",
    label: "Transaksi",
    icon: Receipt,
    description: "Riwayat pembayaran",
  },
  {
    href: "/admin/products",
    label: "Admin",
    icon: Settings,
    description: "Kelola produk",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* ---- Logo ---- */}
        <Link href="/" className="mr-6 flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/25 transition-shadow group-hover:shadow-lg group-hover:shadow-orange-500/30">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight leading-none">
              Mangkasir
            </span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
              F&B POS
            </span>
          </div>
        </Link>

        {/* ---- Desktop Nav ---- */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              pathname.startsWith(link.href.split("/").slice(0, 2).join("/"));
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 text-sm font-medium transition-all",
                    isActive &&
                      "bg-orange-500/10 text-orange-600 hover:bg-orange-500/15 dark:text-orange-400",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* ---- Right side spacer ---- */}
        <div className="ml-auto" />

        {/* ---- Mobile Nav ---- */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="md:hidden"
            render={<Button variant="ghost" size="icon" />}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <SheetTitle className="px-5 pt-5 pb-2 text-base font-bold">
              Navigation
            </SheetTitle>
            <Separator />
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(
                    link.href.split("/").slice(0, 2).join("/"),
                  );
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-12",
                        isActive &&
                          "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {link.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {link.description}
                        </span>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
