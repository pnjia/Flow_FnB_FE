"use client";

import { useMemo } from "react";
import { Coffee, Flame, ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store";
import { KDSOrder } from "@/types";

export function TicketRecipeDialog({
  order,
  open,
  onClose,
}: {
  order: KDSOrder | null;
  open: boolean;
  onClose: () => void;
}) {
  const products = useAppStore((s) => s.products);
  const rawMaterials = useAppStore((s) => s.rawMaterials);

  // Computed Recipe State
  const recipeData = useMemo(() => {
    if (!order) return null;

    const groupedTotals: Record<
      string,
      { materialName: string; unit: string; totalQty: number }
    > = {};

    const breakdowns: {
      productName: string;
      quantity: number;
      ingredients: { materialName: string; unit: string; qty: number }[];
    }[] = [];

    let hasAnyRecipe = false;

    // Iterate through current order items
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);

      const ingredientsList: {
        materialName: string;
        unit: string;
        qty: number;
      }[] = [];

      if (product?.recipeIngredients && product.recipeIngredients.length > 0) {
        hasAnyRecipe = true;

        product.recipeIngredients.forEach((ri) => {
          const material = rawMaterials.find((rm) => rm.id === ri.materialId);
          if (!material) return; // Skip if material reference is broken

          const totalForThisItem = ri.qtyNeeded * item.quantity;

          // Add to grouped totals
          if (!groupedTotals[material.id]) {
            groupedTotals[material.id] = {
              materialName: material.name,
              unit: material.unit,
              totalQty: 0,
            };
          }
          groupedTotals[material.id].totalQty += totalForThisItem;

          // Add to line item breakdown
          ingredientsList.push({
            materialName: material.name,
            unit: material.unit,
            qty: totalForThisItem,
          });
        });
      }

      breakdowns.push({
        productName: item.productName,
        quantity: item.quantity,
        ingredients: ingredientsList,
      });
    });

    return {
      groupedTotals: Object.values(groupedTotals).sort((a, b) =>
        a.materialName.localeCompare(b.materialName),
      ),
      breakdowns,
      hasAnyRecipe,
    };
  }, [order, products, rawMaterials]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <ClipboardList className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">Kebutuhan Bahan</DialogTitle>
              <DialogDescription>
                {order?.tableName} • Pesanan #
                {order?.orderId.slice(-6).toUpperCase()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-5 overflow-y-auto">
          {!recipeData?.hasAnyRecipe ? (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-70">
              <Coffee className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-semibold text-muted-foreground">
                Tidak Ada Data Resep
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                Menu dalam pesanan ini tidak memiliki kaitan bahan baku (resep)
                yang diatur di sistem.
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-6">
              {/* Aggregated Totals */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-400 mb-3 uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  Total Kebutuhan Bahan
                </h4>
                <div className="space-y-2">
                  {recipeData.groupedTotals.map((rm, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2.5 bg-muted/30 rounded-lg border"
                    >
                      <span className="font-semibold text-sm">
                        {rm.materialName}
                      </span>
                      <Badge
                        variant="secondary"
                        className="font-mono text-sm bg-background"
                      >
                        {rm.totalQty} {rm.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Breakdown per Item */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Rincian per Menu
                </h4>
                <div className="space-y-4">
                  {recipeData.breakdowns.map((menu, idx) => (
                    <div key={idx} className="space-y-2">
                      <p className="text-sm font-bold flex gap-2">
                        <span className="text-orange-500">
                          {menu.quantity}x
                        </span>
                        {menu.productName}
                      </p>
                      <div className="pl-6 space-y-1">
                        {menu.ingredients.length > 0 ? (
                          menu.ingredients.map((ing, iIdx) => (
                            <div
                              key={iIdx}
                              className="flex justify-between text-[13px] text-muted-foreground"
                            >
                              <span>{ing.materialName}</span>
                              <span className="font-medium text-foreground">
                                {ing.qty} {ing.unit}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[12px] italic text-muted-foreground opacity-70">
                            Tidak ada resep sistem
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
