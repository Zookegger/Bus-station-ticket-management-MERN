---
mode: ask
---
# Database Schema Refactoring: Add Order/Booking Model

## Context
I need to refactor my bus ticketing system to support batch ticket purchases with granular refund capabilities. Currently, tickets are created individually without a way to group them as a single purchase transaction. I need to add an Order/Booking table to group tickets bought together, enable individual ticket refunds within an order, and properly track coupon usage per order instead of per ticket.

## Current Schema Issues
1. No way to group multiple tickets bought together in one transaction
2. CouponUsage links to individual tickets, making batch purchases awkward
3. Cannot refund individual tickets from a batch purchase
4. No tracking of "one coupon per user" globally
5. Payment links to tickets via junction table but no order-level grouping

## Required Changes

### 1. Create New Order Model
Create a new Sequelize model called `Order` with the following attributes:
- `id` (UUID, primary key)
- `userId` (UUID, foreign key to Users)
- `totalBasePrice` (DECIMAL 10,2)
- `totalDiscount` (DECIMAL 10,2, default 0)
- `totalFinalPrice` (DECIMAL 10,2)
- `paymentId` (UUID, foreign key to Payments, nullable)
- `status` (ENUM: 'pending', 'confirmed', 'cancelled', 'partially_refunded', 'refunded', default 'pending')
- `createdAt`, `updatedAt` (timestamps)

**Associations:**
- Order belongs to User
- Order has many Tickets
- Order belongs to Payment (nullable)
- Order has one CouponUsage (optional)

### 2. Update Ticket Model
Add new field to existing Ticket model:
- `orderId` (UUID, foreign key to Orders, required)

**Update associations:**
- Ticket belongs to Order
- Keep existing associations (User, Seat)

### 3. Update CouponUsage Model
**Remove:**
- `ticketId` field and its foreign key

**Add:**
- `orderId` (UUID, foreign key to Orders, required)
- `userId` (UUID, foreign key to Users, required)

**Update unique constraint:**
- Remove: `UNIQUE(couponId, ticketId)`
- Add: `UNIQUE(couponId, userId)` - ensures one coupon per user globally

**Update associations:**
- CouponUsage belongs to Order (instead of Ticket)
- CouponUsage belongs to User
- CouponUsage belongs to Coupon

### 4. Update Coupon Model
Add new fields to track usage limits:
- `discountValue` (DECIMAL 10,2, required) - the actual discount amount or percentage value
- `maxUsagePerUser` (INTEGER, default 1) - how many times one user can use this coupon
- `maxUsageTotal` (INTEGER, nullable) - total global usage limit across all users
- `currentUsageCount` (INTEGER, default 0) - current number of times coupon has been used
- `minPurchaseAmount` (DECIMAL 10,2, nullable) - minimum order total required to use coupon

### 5. Update Payment Model
Add new field:
- `userId` (UUID, foreign key to Users, required) - track which user made the payment

**Update associations:**
- Payment belongs to User
- Keep existing association with Order

### 6. Create Migration Files
Using Sequelize migrations, create migration files in the correct order:
1. Create `orders` table
2. Add `orderId` to `tickets` table
3. Add `userId` to `payments` table
4. Update `coupon_usages` table (add orderId and userId, remove ticketId, update unique constraint)
5. Update `coupons` table (add new fields for usage tracking)

Ensure all migrations handle:
- Foreign key constraints with proper ON DELETE and ON UPDATE actions
- Indexes for foreign keys and frequently queried fields
- Data type consistency with existing schema

### 7. Update Service Layer
Please help refactor the ticket creation logic:

**OLD FLOW (to be replaced):**
```
CreateTicket(dto) → Creates individual ticket → Applies coupon to ticket
```

**NEW FLOW (implement this):**
```
CreateOrder(dto) → 
  1. Validate seats availability
  2. Calculate total base price
  3. Validate and apply coupon (if provided)
  4. Create Order record
  5. Create CouponUsage record (if coupon applied)
  6. Create all Ticket records linked to Order
  7. Update seat statuses
  8. Return Order with tickets
```

**Key business rules to implement:**
- One coupon can only be used once per user (globally, not per order)
- Coupon validation must check: isActive, date range, min purchase amount, usage limits
- Discount is calculated at order level and distributed across tickets
- All operations must be wrapped in a database transaction
- If any step fails, rollback entire order creation

### 8. Implement Refund Logic
Create a new service function to handle individual ticket refunds:

**Requirements:**
- Allow refunding individual tickets from an order
- Update order status to 'partially_refunded' if some tickets remain
- Update order status to 'refunded' if all tickets are refunded
- Only revert coupon usage if entire order is refunded (not for partial refunds)
- Release the seat back to available status
- Decrement coupon usage count only if entire order is refunded
- Process payment refund through payment gateway
- All operations must be in a transaction

### 9. Update Existing Code References
Search and update all references to:
- Ticket creation logic to use new Order-based flow
- CouponUsage queries that reference ticketId
- Any queries that group tickets by payment (now use orderId)

## Expected Final Schema Relationships

```
User
  ├── has many Orders
  ├── has many Tickets (through Orders)
  └── has many CouponUsages

Order
  ├── belongs to User
  ├── has many Tickets
  ├── belongs to Payment (optional)
  └── has one CouponUsage (optional)

Ticket
  ├── belongs to Order
  ├── belongs to User (optional, for guest context)
  └── belongs to Seat

CouponUsage
  ├── belongs to Order
  ├── belongs to User
  └── belongs to Coupon

Coupon
  └── has many CouponUsages

Payment
  ├── belongs to User
  └── has many Orders (through Order.paymentId)
```

## Important Notes
- Use Sequelize transactions for all order creation and refund operations
- Maintain backward compatibility during migration if there's existing data
- Add appropriate indexes for performance (userId, orderId, status fields)
- Ensure TypeScript types are updated to match new schema
- Update any DTOs (Data Transfer Objects) used in controllers
- Test coupon validation logic thoroughly (expiry, usage limits, min purchase)

## Testing Checklist
After implementation, verify:
1. Can create order with multiple tickets
2. Coupon applies to entire order, not individual tickets
3. User cannot reuse same coupon on different orders
4. Can refund individual tickets without affecting other tickets in same order
5. Order status updates correctly (pending → confirmed → partially_refunded → refunded)
6. Coupon usage count only reverted on full order refund
7. Seats are properly released on ticket refund
8. Payment tracking works correctly with new order structure

## Questions to Consider
- Should guest users (non-registered) be able to create orders? If yes, userId should be nullable
- What happens to orders if user account is deleted? (Current FK: ON DELETE CASCADE)
- Should there be a time limit for pending orders before auto-cancellation?
- How to handle payment failures after order creation?

---

Please help me implement these changes systematically, starting with the migration files, then models, then service layer refactoring. Let me know if any part of this specification is unclear or needs additional details.