"use client";

import { useEffect, useState } from "react";
import {
  MonitorDot,
  ChefHat,
  Clock,
  Flame,
  CheckCircle2,
  ArrowRight,
  Bell,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store";
import { KDSOrder, KDSStatus } from "@/types";
import { cn } from "@/lib/utils";

// ============================================================
// Helper: format IDR
// ============================================================
function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// ============================================================
// Column Configuration
// ============================================================
interface ColumnConfig {
  status: KDSStatus;
  title: string;
  icon: React.ElementType;
  emptyLabel: string;
  headerGradient: string;
  headerShadow: string;
  dotColor: string;
  badgeBg: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: "new",
    title: "Antrean Baru",
    icon: Bell,
    emptyLabel: "Tidak ada antrean baru",
    headerGradient: "from-red-500 to-rose-500",
    headerShadow: "shadow-red-500/25",
    dotColor: "bg-red-500",
    badgeBg: "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400",
  },
  {
    status: "processing",
    title: "Sedang Dimasak",
    icon: Flame,
    emptyLabel: "Tidak ada yang dimasak",
    headerGradient: "from-amber-500 to-orange-500",
    headerShadow: "shadow-amber-500/25",
    dotColor: "bg-amber-500",
    badgeBg:
      "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400",
  },
  {
    status: "done",
    title: "Selesai",
    icon: CheckCircle2,
    emptyLabel: "Belum ada yang selesai",
    headerGradient: "from-emerald-500 to-green-500",
    headerShadow: "shadow-emerald-500/25",
    dotColor: "bg-emerald-500",
    badgeBg:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
  },
];

// ============================================================
// Elapsed Timer Hook (hydration-safe)
// ============================================================
function useElapsedTime(createdAt: string) {
  // Start with a stable placeholder so SSR and initial client render match
  const [elapsed, setElapsed] = useState("--:--");

  useEffect(() => {
    // Only compute after mount (client-side) to avoid hydration mismatch
    const compute = () => {
      const diff = Date.now() - new Date(createdAt).getTime();
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      if (mins >= 60) {
        const hrs = Math.floor(mins / 60);
        setElapsed(`${hrs}h ${mins % 60}m`);
      } else {
        setElapsed(`${mins}m ${secs.toString().padStart(2, "0")}s`);
      }
    };
    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return elapsed;
}

// ============================================================
// Urgency Hook (hydration-safe)
// ============================================================
function useIsUrgent(createdAt: string, status: KDSStatus) {
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const check = () => {
      const elapsedMs = Date.now() - new Date(createdAt).getTime();
      setIsUrgent(elapsedMs > 10 * 60000 && status !== "done");
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  return isUrgent;
}

// ============================================================
// KDS Order Ticket
// ============================================================
function KDSTicket({
  order,
  onProcess,
  onDone,
}: {
  order: KDSOrder;
  onProcess: (orderId: string) => void;
  onDone: (orderId: string) => void;
}) {
  const elapsed = useElapsedTime(order.createdAt);
  const isUrgent = useIsUrgent(order.createdAt, order.status);

  return (
    <Card
      className={cn(
        "transition-all duration-300",
        order.status === "new" && "border-red-500/40 shadow-sm",
        order.status === "processing" && "border-amber-500/40 shadow-sm",
        order.status === "done" && "border-emerald-500/30 opacity-80",
        isUrgent && "ring-2 ring-red-500/50 animate-pulse",
      )}
    >
      <CardContent className="p-4">
        {/* ---- Header: Table name + Timer ---- */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ChefHat
              className={cn(
                "h-4 w-4",
                order.status === "new"
                  ? "text-red-500"
                  : order.status === "processing"
                    ? "text-amber-500"
                    : "text-emerald-500",
              )}
            />
            <span className="font-bold text-sm">{order.tableName}</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 text-[11px] font-mono tabular-nums",
              isUrgent
                ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400"
                : "text-muted-foreground",
            )}
          >
            <Clock className="h-3 w-3" />
            {elapsed}
          </Badge>
        </div>

        {/* ---- Order ID ---- */}
        <p className="text-[11px] text-muted-foreground mb-2 font-mono">
          #{order.orderId.slice(-6).toUpperCase()}
        </p>

        <Separator className="mb-3" />

        {/* ---- Item List ---- */}
        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start gap-2">
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
                        className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded"
                      >
                        {addon.name}
                        {addon.price > 0 && ` +${formatRp(addon.price)}`}
                      </span>
                    ))}
                  </div>
                )}
                {item.notes && (
                  <p className="text-[10px] text-muted-foreground italic mt-0.5">
                    📝 {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ---- Action Buttons ---- */}
        {order.status === "new" && (
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2"
            onClick={() => onProcess(order.orderId)}
          >
            <Flame className="h-4 w-4" />
            Proses
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {order.status === "processing" && (
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
            onClick={() => onDone(order.orderId)}
          >
            <CheckCircle2 className="h-4 w-4" />
            Selesai Masak
          </Button>
        )}

        {order.status === "done" && (
          <div className="flex items-center justify-center gap-2 py-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Siap Diantar</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// KDS Column
// ============================================================
function KDSColumn({
  config,
  orders,
  onProcess,
  onDone,
}: {
  config: ColumnConfig;
  orders: KDSOrder[];
  onProcess: (orderId: string) => void;
  onDone: (orderId: string) => void;
}) {
  const Icon = config.icon;

  return (
    <div className="flex flex-col min-h-0">
      {/* Column Header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br shadow-md",
            config.headerGradient,
            config.headerShadow,
          )}
        >
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold">{config.title}</h2>
        </div>
        <Badge
          variant="outline"
          className={cn("gap-1.5 text-xs font-bold", config.badgeBg)}
        >
          <span className={cn("h-2 w-2 rounded-full", config.dotColor)} />
          {orders.length}
        </Badge>
      </div>

      {/* Column Content */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4 min-h-[200px]">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
            <Icon className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-xs">{config.emptyLabel}</p>
          </div>
        ) : (
          orders.map((order) => (
            <KDSTicket
              key={order.orderId}
              order={order}
              onProcess={onProcess}
              onDone={onDone}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================
// KDS Page
// ============================================================
export default function KDSPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const kdsQueue = useAppStore((s) => s.kdsQueue);
  const updateKDSStatus = useAppStore((s) => s.updateKDSStatus);
  const markKDSDone = useAppStore((s) => s.markKDSDone);
  const updateTableStatus = useAppStore((s) => s.updateTableStatus);

  // Sort: newest first for "new", oldest first for "processing"
  const ordersByStatus: Record<KDSStatus, KDSOrder[]> = {
    new: kdsQueue
      .filter((o) => o.status === "new")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    processing: kdsQueue
      .filter((o) => o.status === "processing")
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    done: kdsQueue
      .filter((o) => o.status === "done")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
  };

  const handleProcess = (orderId: string) => {
    // Move ticket from "new" -> "processing"
    // Also update table to "cooking"
    const ticket = kdsQueue.find((o) => o.orderId === orderId);
    updateKDSStatus(orderId, "processing");
    if (ticket) {
      updateTableStatus(ticket.tableId, "cooking");
    }
  };

  const handleDone = (orderId: string) => {
    // CRITICAL: Mark KDS done + table -> ready_deliver
    markKDSDone(orderId);
  };

  const totalActive =
    ordersByStatus.new.length + ordersByStatus.processing.length;

  // Hydration guard: render skeleton until client mount
  if (!isMounted) {
    return (
      <div className="px-4 md:px-6 py-6 max-w-[1400px] mx-auto h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 shadow-md shadow-violet-500/25">
            <MonitorDot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kitchen Display System
            </h1>
            <p className="text-sm text-muted-foreground">Memuat pesanan...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          {COLUMNS.map((col) => (
            <div key={col.status} className="flex flex-col min-h-0">
              <div className="flex items-center gap-3 mb-4 px-1">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br shadow-md",
                    col.headerGradient,
                    col.headerShadow,
                  )}
                >
                  <col.icon className="h-4.5 w-4.5 text-white" />
                </div>
                <h2 className="text-sm font-bold flex-1">{col.title}</h2>
              </div>
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p className="text-xs animate-pulse">Memuat...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-6 max-w-[1400px] mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* ---- Header ---- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 shadow-md shadow-violet-500/25">
            <MonitorDot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kitchen Display System
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalActive} pesanan aktif • Perbarui status masakan secara
              real-time
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {COLUMNS.map((col) => (
            <Badge
              key={col.status}
              variant="outline"
              className={cn("gap-1.5 text-xs", col.badgeBg)}
            >
              <span className={cn("h-2 w-2 rounded-full", col.dotColor)} />
              {col.title}: {ordersByStatus[col.status].length}
            </Badge>
          ))}
        </div>
      </div>

      {/* ---- Kanban Board (3-column grid) ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {COLUMNS.map((col) => (
          <KDSColumn
            key={col.status}
            config={col}
            orders={ordersByStatus[col.status]}
            onProcess={handleProcess}
            onDone={handleDone}
          />
        ))}
      </div>
    </div>
  );
}
