"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  UtensilsCrossed,
  Clock,
  Truck,
  Coffee,
  ChefHat,
  Send,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useAppStore } from "@/store";
import { Table, TableStatus, OrderItem } from "@/types";
import { cn } from "@/lib/utils";

// ============================================================
// Helper: format IDR
// ============================================================
function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getItemTotal(item: OrderItem) {
  const addonTotal = item.selectedAddons.reduce((a, ad) => a + ad.price, 0);
  return (item.price + addonTotal) * item.quantity;
}

// ============================================================
// Status configuration — follows .agents/04-ui-ux-rules.md
// ============================================================
const STATUS_CONFIG: Record<
  TableStatus,
  {
    label: string;
    dotColor: string;
    badgeClass: string;
    cardBorderClass: string;
    cardBgClass: string;
    icon: React.ElementType;
    blink: boolean;
  }
> = {
  empty: {
    label: "Empty",
    dotColor: "bg-emerald-500",
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    cardBorderClass: "border-emerald-500/30 hover:border-emerald-500/50",
    cardBgClass: "",
    icon: Coffee,
    blink: false,
  },
  new_order: {
    label: "New Order",
    dotColor: "bg-orange-500",
    badgeClass:
      "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
    cardBorderClass:
      "border-orange-500/50 hover:border-orange-500/70 shadow-orange-500/10 shadow-md",
    cardBgClass: "bg-orange-50/50 dark:bg-orange-950/20",
    icon: Clock,
    blink: true,
  },
  cooking: {
    label: "Cooking",
    dotColor: "bg-red-500",
    badgeClass:
      "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
    cardBorderClass:
      "border-red-500/50 hover:border-red-500/70 shadow-red-500/10 shadow-md",
    cardBgClass: "bg-red-50/50 dark:bg-red-950/20",
    icon: UtensilsCrossed,
    blink: false,
  },
  ready_deliver: {
    label: "Ready",
    dotColor: "bg-blue-500",
    badgeClass:
      "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    cardBorderClass:
      "border-blue-500/50 hover:border-blue-500/70 shadow-blue-500/10 shadow-md",
    cardBgClass: "bg-blue-50/50 dark:bg-blue-950/20",
    icon: Truck,
    blink: true,
  },
  eating: {
    label: "Eating",
    dotColor: "bg-gray-400",
    badgeClass:
      "border-gray-400/30 bg-gray-400/10 text-gray-600 dark:text-gray-400",
    cardBorderClass: "border-gray-300/50 hover:border-gray-400/50",
    cardBgClass: "bg-gray-50/50 dark:bg-gray-900/20",
    icon: Users,
    blink: false,
  },
};

// ============================================================
// Table Card Component
// ============================================================
function TableCard({
  table,
  onTableClick,
}: {
  table: Table;
  onTableClick: (table: Table) => void;
}) {
  const config = STATUS_CONFIG[table.status];
  const StatusIcon = config.icon;

  const itemCount = table.currentOrder.length;
  const orderTotal = table.currentOrder.reduce((sum, item) => {
    const addonTotal = item.selectedAddons.reduce((a, ad) => a + ad.price, 0);
    return sum + (item.price + addonTotal) * item.quantity;
  }, 0);

  return (
    <Card
      onClick={() => onTableClick(table)}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden group",
        config.cardBorderClass,
        config.cardBgClass,
      )}
    >
      {/* Blinking indicator bar for new_order and ready_deliver */}
      {config.blink && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1 animate-pulse",
            table.status === "new_order"
              ? "bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400"
              : "bg-gradient-to-r from-blue-400 via-sky-400 to-blue-400",
          )}
        />
      )}

      <CardContent className="p-5">
        {/* Top row: Table name + Status badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                table.status === "empty"
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : table.status === "new_order"
                    ? "bg-orange-100 dark:bg-orange-900/30"
                    : table.status === "cooking"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : table.status === "ready_deliver"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-gray-100 dark:bg-gray-800/30",
              )}
            >
              <StatusIcon
                className={cn(
                  "h-5 w-5",
                  table.status === "empty"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : table.status === "new_order"
                      ? "text-orange-600 dark:text-orange-400"
                      : table.status === "cooking"
                        ? "text-red-600 dark:text-red-400"
                        : table.status === "ready_deliver"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400",
                )}
              />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight">
                {table.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{table.id}</p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-medium gap-1.5 shrink-0",
              config.badgeClass,
              config.blink && "animate-pulse",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
            {config.label}
          </Badge>
        </div>

        {/* Bottom row: Order info */}
        {table.status !== "empty" ? (
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
            <span className="text-sm font-semibold">
              Rp {orderTotal.toLocaleString("id-ID")}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center pt-3 border-t border-border/50 gap-1.5">
            <ArrowRight className="h-3 w-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Tap to start a new order
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// Validation Sheet (for "new_order" tables)
// ============================================================
function ValidationSheet({
  table,
  open,
  onClose,
  onSendToKitchen,
}: {
  table: Table | null;
  open: boolean;
  onClose: () => void;
  onSendToKitchen: (table: Table) => void;
}) {
  if (!table) return null;

  const orderTotal = table.currentOrder.reduce(
    (sum, item) => sum + getItemTotal(item),
    0,
  );

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            Validasi Pesanan {table.name}
          </SheetTitle>
          <SheetDescription>
            Periksa pesanan pelanggan sebelum dikirim ke dapur.
          </SheetDescription>
        </SheetHeader>

        {/* Order items list */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-1">
            {table.currentOrder.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0"
              >
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400 shrink-0 w-6 text-right">
                  {item.quantity}x
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">
                    {item.productName}
                  </p>
                  {item.selectedAddons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.selectedAddons.map((addon) => (
                        <span
                          key={addon.id}
                          className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                        >
                          {addon.name}
                          {addon.price > 0 && ` +${formatRp(addon.price)}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-sm font-semibold shrink-0">
                  {formatRp(getItemTotal(item))}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Summary */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">
              {table.currentOrder.length} item
            </span>
            <span className="text-lg font-bold">{formatRp(orderTotal)}</span>
          </div>
        </div>

        <SheetFooter>
          <Button
            className="w-full bg-red-500 hover:bg-red-600 text-white gap-2 h-12 text-base font-semibold shadow-md shadow-red-500/25"
            onClick={() => onSendToKitchen(table)}
          >
            <Send className="h-5 w-5" />
            Kirim ke Dapur
            <ChefHat className="h-5 w-5" />
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">
            Pesanan akan dikirim ke Kitchen Display System
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================
// POS Page
// ============================================================
export default function POSPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const router = useRouter();
  const tables = useAppStore((s) => s.tables);
  const updateTableStatus = useAppStore((s) => s.updateTableStatus);
  const addKDSOrder = useAppStore((s) => s.addKDSOrder);

  // Validation sheet state
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const statusCounts = tables.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Legend items matching the mandatory color mapping
  const legendItems: { status: TableStatus; label: string }[] = [
    { status: "empty", label: "Empty" },
    { status: "new_order", label: "New Order" },
    { status: "cooking", label: "Cooking" },
    { status: "ready_deliver", label: "Ready" },
    { status: "eating", label: "Eating" },
  ];

  // ---- BUG FIX 3: Empty tables route to /menu/[tableId] ----
  // ---- BUG FIX 2: new_order tables open validation sheet ----
  const handleTableClick = (table: Table) => {
    if (table.status === "empty") {
      // Navigate waiter to the menu to manually input orders
      const tableNumber = table.id.replace("table-", "");
      const tableNum = parseInt(tableNumber);
      router.push(`/menu/${tableNum}`);
    } else if (table.status === "new_order") {
      // Open waiter validation sheet
      setSelectedTable(table);
      setSheetOpen(true);
    } else {
      // For other statuses, navigate to checkout
      const tableNumber = table.id.replace("table-", "");
      const tableNum = parseInt(tableNumber);
      router.push(`/checkout/${tableNum}`);
    }
  };

  // ---- BUG FIX 2: Send validated order to KDS ----
  const handleSendToKitchen = (table: Table) => {
    // 1. Change table status from "new_order" → "cooking"
    updateTableStatus(table.id, "cooking");

    // 2. Push items to KDS queue
    const orderId = `order-${Date.now()}`;
    addKDSOrder({
      orderId,
      tableId: table.id,
      tableName: table.name,
      items: table.currentOrder,
      status: "new",
      createdAt: new Date().toISOString(),
    });

    // 3. Close the sheet
    setSheetOpen(false);
    setSelectedTable(null);
  };

  // Hydration guard: render skeleton until client mount
  if (!isMounted) {
    return (
      <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/25">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Table Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Memuat data meja...
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-muted/50 animate-pulse border border-border/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
      {/* ---- Header ---- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/25">
            <LayoutGrid className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Table Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Select a table to start a new order or view an existing one.
            </p>
          </div>
        </div>

        {/* Status legend badges */}
        <div className="flex gap-2 flex-wrap">
          {legendItems.map(({ status, label }) => {
            const cfg = STATUS_CONFIG[status];
            return (
              <Badge
                key={status}
                variant="outline"
                className={cn("gap-1.5 text-xs", cfg.badgeClass)}
              >
                <span className={cn("h-2 w-2 rounded-full", cfg.dotColor)} />
                {label}: {statusCounts[status] || 0}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* ---- Table Grid ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onTableClick={handleTableClick}
          />
        ))}
      </div>

      {/* ---- Waiter Validation Sheet ---- */}
      <ValidationSheet
        table={selectedTable}
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setSelectedTable(null);
        }}
        onSendToKitchen={handleSendToKitchen}
      />
    </div>
  );
}
