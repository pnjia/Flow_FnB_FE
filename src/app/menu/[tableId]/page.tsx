import { dummyTables } from "@/store/dummy-data";
import { MenuContent } from "./menu-content";

/**
 * generateStaticParams() diperlukan karena menggunakan output: export
 * untuk membuat file statis saat build.
 */
export function generateStaticParams() {
  // Mengambil ID dari data dummy meja (menghilangkan prefix "table-" jika ada)
  // Namun berdasarkan logika di MenuContent, params.tableId adalah angka murni
  // yang kemudian dipad dengan prefix "table-".
  // Jadi kita return angka 1 sampai 10 sebagai string.
  return dummyTables.map((table) => {
    // table.id formatnya "table-01", "table-02", dst.
    // Kita butuh tableId yang masuk ke URL, yaitu "1", "2", dst.
    const numericId = table.id.replace("table-", "").replace(/^0+/, "");
    return { tableId: numericId };
  });
}

export default function Page() {
  return <MenuContent />;
}
