"use client";

import Link from "next/link";
import {
  LayoutGrid,
  UtensilsCrossed,
  MonitorDot,
  CreditCard,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    href: "/pos",
    icon: LayoutGrid,
    title: "POS — Table View",
    description:
      "Manage restaurant tables, view statuses, and start new orders.",
    gradient: "from-orange-500 to-amber-500",
    shadow: "shadow-orange-500/20",
  },
  {
    href: "/menu/1",
    icon: UtensilsCrossed,
    title: "Menu & Ordering",
    description:
      "Browse menu items, add add-ons, and send orders to the kitchen.",
    gradient: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    href: "/kds",
    icon: MonitorDot,
    title: "Kitchen Display",
    description:
      "Real-time kitchen queue with order status tracking for the chef.",
    gradient: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/20",
  },
  {
    href: "/checkout/1",
    icon: CreditCard,
    title: "Checkout",
    description: "Review order summary, apply discounts, and process payments.",
    gradient: "from-sky-500 to-blue-500",
    shadow: "shadow-sky-500/20",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 md:py-24">
      {/* ---- Hero ---- */}
      <div className="text-center max-w-2xl mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
            MVP Prototype
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Mangkasir
          </span>{" "}
          F&B
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          A streamlined point-of-sale system for food & beverage businesses.
          Manage tables, orders, kitchen flow, and payments — all in one place.
        </p>
      </div>

      {/* ---- Feature Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl w-full">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} className="group">
            <div className="relative flex flex-col gap-4 rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-orange-500/30">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} shadow-md ${feature.shadow}`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">{feature.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400 mt-auto">
                Open
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ---- Footer note ---- */}
      <div className="mt-16 text-center">
        <p className="text-xs text-muted-foreground">
          Built with Next.js, Tailwind CSS, shadcn/ui & Zustand •{" "}
          <Link
            href="/pos"
            className="text-xs font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 underline-offset-4 hover:underline"
          >
            Get started →
          </Link>
        </p>
      </div>
    </div>
  );
}
