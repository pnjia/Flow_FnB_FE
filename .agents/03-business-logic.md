# Business Logic

Detail the core operational flows:

- **QR Menu Flow:** When a customer orders via QR, the Table status becomes "new_order" (needs Waiter validation) and a ticket is pushed to KDSQueue.
- **KDS Routing:** When a Chef marks an order as "done" in KDS, the ticket is removed from KDSQueue, and the associated Table status changes to "ready_deliver" so the Waiter knows to serve it.
- **Split Bill Logic:** Split bill is done strictly by selecting specific items (checkboxes), NOT by dividing the total amount. Subtotal and Tax must recalculate dynamically based only on checked items.
- **Payment:** Once paid, specific items are removed from the table's `currentOrder`. If `currentOrder` becomes empty, Table status reverts to "empty".
