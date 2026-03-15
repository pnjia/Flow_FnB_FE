"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Receipt,
  Search,
  Calendar,
  CreditCard,
  QrCode,
  Banknote,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/store";
import { Transaction, OrderItem } from "@/types";
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
// Format relative time
// ============================================================
function formatRelativeTime(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function formatDateTime(isoString: string) {
  return new Date(isoString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================
// Transaction Detail Dialog
// ============================================================
function TransactionDetailDialog({
  transaction,
  open,
  onClose,
}: {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Detail Transaksi
          </DialogTitle>
          <DialogDescription>
            #{transaction.id.slice(-6).toUpperCase()} • {transaction.tableName}{" "}
            • {formatDateTime(transaction.paidAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Items */}
          <div className="space-y-2">
            {transaction.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">
                      {item.quantity}x
                    </span>{" "}
                    {item.productName}
                  </p>
                  {item.selectedAddons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
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
                <span className="font-semibold shrink-0 ml-3">
                  {formatRp(getItemTotal(item))}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {formatRp(transaction.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pajak (10%)</span>
              <span className="font-medium">{formatRp(transaction.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Total</span>
              <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
                {formatRp(transaction.total)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Payment Info */}
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Metode</span>
                <Badge variant="outline" className="gap-1.5 text-xs">
                  {transaction.paymentMethod === "cash" ? (
                    <>
                      <Banknote className="h-3 w-3" />
                      Tunai
                    </>
                  ) : (
                    <>
                      <QrCode className="h-3 w-3" />
                      QRIS
                    </>
                  )}
                </Badge>
              </div>
              {transaction.paymentMethod === "cash" &&
                transaction.cashReceived && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Uang Diterima
                      </span>
                      <span className="font-medium">
                        {formatRp(transaction.cashReceived)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kembalian</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatRp(transaction.change ?? 0)}
                      </span>
                    </div>
                  </>
                )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Transactions Page
// ============================================================
export default function TransactionsPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const transactionHistory = useAppStore((s) => s.transactionHistory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "today">("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filtered transactions
  const filtered = useMemo(() => {
    let txs = transactionHistory;

    // Date filter
    if (filter === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      txs = txs.filter(
        (tx) => new Date(tx.paidAt).getTime() >= todayStart.getTime(),
      );
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      txs = txs.filter(
        (tx) =>
          tx.tableName.toLowerCase().includes(q) ||
          tx.id.toLowerCase().includes(q) ||
          tx.items.some((i) => i.productName.toLowerCase().includes(q)),
      );
    }

    return txs;
  }, [transactionHistory, filter, searchQuery]);

  // Summary stats
  const totalRevenue = filtered.reduce((sum, tx) => sum + tx.total, 0);
  const cashCount = filtered.filter((tx) => tx.paymentMethod === "cash").length;
  const qrisCount = filtered.filter((tx) => tx.paymentMethod === "qris").length;

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setDetailOpen(true);
  };

  // Hydration guard
  if (!isMounted) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background max-w-7xl mx-auto items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-sky-500/20" />
          <h1 className="text-xl font-bold tracking-tight text-muted-foreground/50">
            Memuat Riwayat Transaksi...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
      {/* ---- Header ---- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 shadow-md shadow-sky-500/25">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Riwayat Transaksi
            </h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} transaksi • Total {formatRp(totalRevenue)}
            </p>
          </div>
        </div>

        {/* Stats badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="gap-1.5 text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          >
            <Banknote className="h-3 w-3" />
            Tunai: {cashCount}
          </Badge>
          <Badge
            variant="outline"
            className="gap-1.5 text-xs border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400"
          >
            <QrCode className="h-3 w-3" />
            QRIS: {qrisCount}
          </Badge>
        </div>
      </div>

      {/* ---- Filter Bar ---- */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari meja, ID transaksi, atau nama menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border bg-muted/30 outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50 transition-all"
          />
        </div>

        {/* Date filter */}
        <div className="flex gap-2">
          <Button
            variant={filter === "today" ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-1.5",
              filter === "today" && "bg-sky-500 hover:bg-sky-600 text-white",
            )}
            onClick={() => setFilter("today")}
          >
            <Calendar className="h-3.5 w-3.5" />
            Hari Ini
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-1.5",
              filter === "all" && "bg-sky-500 hover:bg-sky-600 text-white",
            )}
            onClick={() => setFilter("all")}
          >
            <Clock className="h-3.5 w-3.5" />
            Semua
          </Button>
        </div>
      </div>

      {/* ---- Transaction Table ---- */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Tidak ada transaksi ditemukan</p>
          <p className="text-xs mt-1">
            {filter === "today"
              ? "Belum ada transaksi hari ini."
              : "Riwayat transaksi masih kosong."}
          </p>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Meja</TableHead>
                  <TableHead className="text-center">Item</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Metode</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(tx)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{tx.id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {tx.tableName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {tx.items.reduce((sum, i) => sum + i.quantity, 0)} item
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      {formatRp(tx.total)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 text-[11px]",
                          tx.paymentMethod === "cash"
                            ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                            : "border-violet-500/30 text-violet-700 dark:text-violet-400",
                        )}
                      >
                        {tx.paymentMethod === "cash" ? (
                          <Banknote className="h-3 w-3" />
                        ) : (
                          <QrCode className="h-3 w-3" />
                        )}
                        {tx.paymentMethod === "cash" ? "Tunai" : "QRIS"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatRelativeTime(tx.paidAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ---- Detail Dialog ---- */}
      <TransactionDetailDialog
        transaction={selectedTx}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedTx(null);
        }}
      />
    </div>
  );
}
