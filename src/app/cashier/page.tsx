"use client";

import { useState } from "react";
import { PosView } from "@/components/cashier/pos-view";
import { TransactionsView } from "@/components/cashier/transactions-view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, ScrollText } from "lucide-react";

export default function CashierPage() {
  const [activeTab, setActiveTab] = useState("pos");

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-muted/5">
      {/* Header Tabs Navigation */}
      <div className="flex items-center justify-between border-b px-6 py-3 bg-card shrink-0 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Ruang Kerja Kasir
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola pesanan, meja, dan riwayat transaksi restoran
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-lg">
            <TabsTrigger
              value="pos"
              className="data-[state=active]:bg-sky-500 data-[state=active]:text-white rounded-md transition-all font-medium py-2 flex gap-2"
            >
              <Calculator className="h-4 w-4" />
              Kasir & POS
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-sky-500 data-[state=active]:text-white rounded-md transition-all font-medium py-2 flex gap-2"
            >
              <ScrollText className="h-4 w-4" />
              Riwayat Transaksi
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "pos" ? <PosView /> : <TransactionsView />}
      </div>
    </div>
  );
}
