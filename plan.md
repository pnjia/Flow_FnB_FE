Plan: Mangkasir F&B MVP Architecture Refactor
This roadmap restructures the current frontend-only prototype into a waiter-validated order pipeline, replaces /checkout with in-flow payment, adds per-unit split billing, introduces raw material/recipe state, consolidates cashier operations into /cashier, and extends KDS with ingredient visibility. The sequence minimizes breakage by first stabilizing state contracts, then migrating flows route-by-route, and finally deprecating legacy paths.

Steps 1 — Phase 1: Core Domain & State Contract (foundation first)
Define new core types in types: RawMaterial, RecipeIngredient, OrderItemUnit, PaymentSelection, TableStatus transition guards including new_order -> cooking.
Extend store schema in store with rawMaterials state and actions addRawMaterial, updateRawMaterial, deleteRawMaterial, linkProductRecipe, flattenOrderItemsToUnits, computeSelectedTotals.
Evolve product model in types and dummy-data: add recipe: RecipeIngredient[] while keeping old textual recipe field temporarily for compatibility.
Add migration-safe seed data in dummy-data: initial rawMaterials array and product-to-material mappings using consistent IDs (rm-_, prod-_, ord-_, unit-_).
Preserve existing symbols while introducing new selectors/helpers in store so current pages still render during phased route migration.
Further Considerations 1
Keep temporary dual fields for product recipe (string + structured array) until all pages switch.
Prefer deterministic unit IDs (${orderItemId}-${index}) to avoid checkbox/state mismatch.
Confirm whether to enforce strict finite-state transitions in actions or only at UI level.
Plan: Phase 2 — Remove /checkout and Rewire Customer Payment Flow
Payment moves into /menu/[tableId] dialog and waiter validation remains mandatory before KDS enqueueing.

Steps 2 — Route and flow migration
Delete checkout route and remove all links/usages in home, navbar, and any /checkout/_ hardcoded navigation.
Add PaymentDialog UI to menu page using Dialog, RadioGroup, Checkbox, ScrollArea, Button, showing Tunai/QRIS and split-bill controls.
Update order submit logic in menu page: Pesan Sekarang opens payment dialog, records payment, sets table status to new_order, redirects to /pos.
Ensure waiter validation in POS page and OrderDetailDialog flow remains gatekeeper: only Kirim ke Dapur triggers updateTableStatus(tableId, "cooking") and addToKDSQueue(order).
Remove any remaining direct kitchen push from customer flow by auditing store actions in store and route handlers for accidental addToKDSQueue calls outside POS validation.
Further Considerations 2
Keep a temporary redirect strategy for stale /checkout/_ bookmarks (Option A: notFound, Option B: redirect to /menu/[tableId]).
Show a success state in payment dialog before navigation to reduce UX ambiguity.
Decide if unpaid orders remain ordering and blocked from waiter validation.
Plan: Phase 3 — Advanced Split Bill (Flatten Quantity to Item Units)
Split logic becomes unit-based in both customer dialog and cashier dashboard.

Steps 3 — Unitized billing engine and UI adoption
Implement flatten helper in store converting OrderItem(quantity > 1) into OrderItemUnit[] with independent selection checkboxes.
Replace row-based checkbox UI in menu payment dialog within page to render one checkbox per unit instance.
Update totals calculation in store: subtotal, tax, grand total computed strictly from selected OrderItemUnit[].
Refactor payOrder behavior in store for partial quantity payments: decrement matching order item quantities or remove fully-paid units only.
Ensure transaction persistence in store and types captures exact paid units, payment method, and tax derived from selected units.
Further Considerations 3
Decide tax basis for split mode: per selected unit rounded line-by-line vs rounded final subtotal.
Retain non-split “select all units” quick action for speed.
Confirm addons pricing should clone to each unit or remain shared per line item.
Plan: Phase 4 — Admin Raw Materials + Product Recipe Linking
Admin expands from product-only CRUD to full inventory and recipe relations.

Steps 4 — Admin IA and CRUD composition
Create admin index as navigation hub to products/materials management sections.
Upgrade admin products page: add recipe-link UI (select material + qtyNeeded + unit display) and persist via linkProductRecipe.
Create admin raw materials page with CRUD table/form for name, stock, unit using Dialog, Input, Select, Table, AlertDialog.
Add reusable admin form blocks in components (e.g., product-form.tsx, raw-material-form.tsx, recipe-builder.tsx) to keep route files lean.
Update global types/store consistency in types and store so product CRUD and recipe linking are transactional in-memory operations.
Further Considerations 4
Enforce prevention of deleting materials currently referenced by product recipes.
Consider read-only “estimated remaining stock” preview (non-deducting MVP) for transparency.
Confirm unit strategy: free text vs constrained enum (g, ml, pcs, siung).
Plan: Phase 5 — Build /cashier All-in-One Dashboard
/transactions is superseded by a unified cashier workspace.

Steps 5 — Dashboard replacement and feature merge
Create cashier dashboard route combining transaction list, table grid, and order/payment panel in one page layout.
Reuse POS-style table grid behavior from POS page to select table context inside cashier for order input and payment.
Port and adapt transaction features from transactions page into cashier transaction section (filter/search/detail dialog).
Add cashier order-entry catalog section in cashier page: add products to selected table, then launch split-capable payment dialog using the same unitized logic as /menu/[tableId].
Migrate navigation and legacy route handling in navbar: replace /transactions menu with /cashier; optionally keep transactions page as redirect shim.
Further Considerations 5
Choose reuse strategy: shared PaymentDialog component vs duplicated route-local dialog.
Keep cashier capable of paying existing new_order and served statuses with guardrails.
Confirm whether cashier can bypass waiter validation or must follow same gate as /menu.
Plan: Phase 6 — KDS “Lihat Resep” Raw Material Pop-up
Each ticket can display computed ingredient requirements based on product recipe mappings.

Steps 6 — Ticket recipe computation and dialog
Extend KDS page ticket card with Lihat Resep button opening Dialog.
Compute per-ticket material requirements in store selector/helper: aggregate sum(orderQty \* qtyNeeded) grouped by materialId.
Resolve material metadata via rawMaterials from store and display normalized output in dialog table/list (Nasi: 500 g, Bawang: 4 siung).
Add reusable presentation component in components (e.g., ticket-recipe-dialog.tsx) using Dialog, Table, Separator, ScrollArea.
Handle missing recipe/material references gracefully in KDS page with warning badges instead of blocking workflow.
Further Considerations 6
Keep KDS popup informational only (no stock deduction in this MVP phase).
Include both grouped total and per-menu-item breakdown for kitchen clarity.
Decide fallback when product has no recipe links: hide button or show empty-state dialog.
Plan: Phase 7 — Cleanup, Compatibility, and Sequencing
Finalize migration safely and ensure old paths/components no longer leak legacy behavior.

Steps 7 — Deletion and stabilization sequence
Remove deprecated checkout artifacts after migration validation: checkout page and any checkout-specific helpers.
Decide final fate of transactions page: delete or convert to redirect page to cashier.
Normalize link targets in home and navbar to /cashier, /admin, /pos, /kds, /menu/[tableId].
Align all table-state transitions in store: available, ordering, new_order, cooking, served with explicit transition rules.
Consolidate shared UI/state logic into reusable components under components to avoid route-level duplication for split bill and payment.
