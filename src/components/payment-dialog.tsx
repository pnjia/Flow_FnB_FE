"use client";

import { useState, useEffect } from "react";
import { Receipt, Wallet, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store";
import {
  Table,
  OrderItem,
  OrderItemUnit,
  PaymentSelection,
  TableStatus,
} from "@/types";
import { cn } from "@/lib/utils";

function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function PaymentDialog({
  open,
  onOpenChange,
  table,
  pendingItems,
  onConfirmOrder,
  statusOnConfirm,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  pendingItems?: OrderItem[];
  onConfirmOrder?: (items: OrderItem[]) => void;
  statusOnConfirm?: TableStatus;
  onSuccess?: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [splitUnits, setSplitUnits] = useState<OrderItemUnit[]>([]);
  const [paymentSelections, setPaymentSelections] = useState<
    PaymentSelection[]
  >([]);
  const [isSplitBillActive, setIsSplitBillActive] = useState(false);

  const flattenUnits = useAppStore((s) => s.flattenOrderItemsToUnits);
  const computeTotals = useAppStore((s) => s.computeSelectedTotals);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const payItems = useAppStore((s) => s.payItems);

  // Initialize split units when dialog opens
  useEffect(() => {
    if (open && table) {
      const allItems = [...table.currentOrder, ...(pendingItems || [])];

      if (allItems.length > 0) {
        const units = flattenUnits(allItems);
        setSplitUnits(units);
        setPaymentSelections(
          units.map((u) => ({ unitId: u.unitId, selected: true })),
        );
      }
    }
  }, [open, table, flattenUnits, pendingItems]);

  const handleTogglePaymentUnit = (unitId: string, checked: boolean) => {
    setPaymentSelections((prev) =>
      prev.map((p) => (p.unitId === unitId ? { ...p, selected: checked } : p)),
    );
  };

  const handleSelectAllUnits = (selected: boolean) => {
    setPaymentSelections((prev) => prev.map((p) => ({ ...p, selected })));
  };

  // Handle effect of Split Bill toggle
  useEffect(() => {
    if (!isSplitBillActive) {
      handleSelectAllUnits(true);
    }
  }, [isSplitBillActive]);

  const handleProcessPayment = () => {
    if (!table) return;

    const selectedUnitIds = new Set(
      paymentSelections.filter((s) => s.selected).map((s) => s.unitId),
    );
    if (selectedUnitIds.size === 0) return; // Must select at least one item

    const paidUnits = splitUnits.filter((u) => selectedUnitIds.has(u.unitId));
    const paidItemIds = paidUnits.map((u) => u.orderItemId);

    const totals = computeTotals(splitUnits, paymentSelections);

    // If there are pending items, commit them to the store first
    if (pendingItems && pendingItems.length > 0 && onConfirmOrder) {
      onConfirmOrder(pendingItems);
    }

    addTransaction({
      id: `tx-${Date.now()}`,
      tableId: table.id,
      tableName: table.name,
      items: paidUnits,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      paymentMethod,
      paidAt: new Date().toISOString(),
      cashReceived: paymentMethod === "cash" ? totals.total : undefined,
      change: 0,
    });

    payItems(table.id, paidItemIds, statusOnConfirm);

    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const totals = computeTotals(splitUnits, paymentSelections);
  const isSelectAllEnabled =
    paymentSelections.length > 0 && paymentSelections.every((s) => s.selected);
  const hasSelectedUnits = paymentSelections.some((s) => s.selected);

  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="px-5 pt-5 pb-4 border-b">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <Receipt className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">Pembayaran Tagihan</DialogTitle>
              <DialogDescription>
                {table.name} — Pilih item yang ingin dibayar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-5 overflow-y-auto">
          {/* ---- Split Bill Selection ---- */}
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <Switch
                  id="split-bill-toggle"
                  checked={isSplitBillActive}
                  onCheckedChange={setIsSplitBillActive}
                />
                <Label
                  htmlFor="split-bill-toggle"
                  className="font-semibold cursor-pointer"
                >
                  Aktifkan Split Bill
                </Label>
              </div>
              {isSplitBillActive && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={isSelectAllEnabled}
                    onCheckedChange={(checked) =>
                      handleSelectAllUnits(!!checked)
                    }
                  />
                  <Label
                    htmlFor="select-all"
                    className="text-xs cursor-pointer"
                  >
                    Semua
                  </Label>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {splitUnits.map((unit) => {
                const isSelected =
                  paymentSelections.find((s) => s.unitId === unit.unitId)
                    ?.selected ?? false;
                let unitTotal = unit.price;
                unit.selectedAddons.forEach((a) => (unitTotal += a.price));

                return (
                  <label
                    key={unit.unitId}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                      isSelected
                        ? "border-orange-500 bg-orange-50/30 dark:bg-orange-950/20 shadow-sm"
                        : "border-border/50 hover:bg-muted/50 hover:border-border",
                    )}
                  >
                    {isSplitBillActive && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleTogglePaymentUnit(unit.unitId, !!checked)
                        }
                        className="mt-1"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">
                        {unit.productName}
                      </p>
                      {unit.selectedAddons.length > 0 && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {unit.selectedAddons.map((a) => a.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold shrink-0">
                      {formatRp(unitTotal)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ---- Payment Methods ---- */}
          <div className="pb-6">
            <Label className="text-sm font-bold mb-3 block">
              Metode Pembayaran
            </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val as "cash" | "qris")}
              className="grid grid-cols-2 gap-3"
            >
              <div>
                <RadioGroupItem
                  value="cash"
                  id="cash"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="cash"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50/50 dark:peer-data-[state=checked]:bg-orange-950/20 peer-data-[state=checked]:text-orange-600 dark:peer-data-[state=checked]:text-orange-400 cursor-pointer transition-all"
                >
                  <Wallet className="h-6 w-6" />
                  <span className="text-sm font-bold">Tunai</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="qris"
                  id="qris"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="qris"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50/50 dark:peer-data-[state=checked]:bg-orange-950/20 peer-data-[state=checked]:text-orange-600 dark:peer-data-[state=checked]:text-orange-400 cursor-pointer transition-all"
                >
                  <QrCode className="h-6 w-6" />
                  <span className="text-sm font-bold">QRIS</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </ScrollArea>

        <div className="p-5 bg-muted/30 border-t mt-auto">
          {/* Calculation details */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Subtotal ({paymentSelections.filter((s) => s.selected).length}{" "}
                item)
              </span>
              <span>{formatRp(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pajak (10%)</span>
              <span>{formatRp(totals.tax)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Dibayar</span>
              <span className="text-orange-600 dark:text-orange-400">
                {formatRp(totals.total)}
              </span>
            </div>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
            onClick={handleProcessPayment}
            disabled={!hasSelectedUnits}
          >
            {isSplitBillActive
              ? "Bayar Sebagian"
              : "Proses Pembayaran Seluruhnya"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
