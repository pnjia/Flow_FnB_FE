# State Schema

Define the exact structure of our simulated Global State. You must strictly follow these interfaces in all phases:

1. **Tables:** Array of objects.
   - `id`: string/number
   - `name`: string (e.g., "Meja 1")
   - `status`: MUST BE ONE OF ["empty", "new_order", "cooking", "ready_deliver", "eating"]
   - `currentOrder`: Array of cart items

2. **Products:** Array of objects.
   - `id`: string
   - `name`: string
   - `price`: number
   - `addons`: Object containing `mandatory` (array of {name, price}) and `optional` (array of {name, price}).

3. **KDSQueue:** Array of objects.
   - `orderId`: string
   - `tableId`: string
   - `items`: Array of items
   - `status`: MUST BE ONE OF ["new", "processing", "done"]
