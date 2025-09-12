# Overview

A form for customers to book their children into the Fizz Kidz holiday programs.

Provides ability to select multiple programs at once, individually add each child they are booking for, automatically apply same day discounts, and the ability to apply discount codes and pay.

# Architecture

All program information, including times, slots and available coupons are stored inside [Acuity Scheduling](https://acuityscheduling.com/) and accesed through the [developer API](https://developers.acuityscheduling.com/reference).

Payments are processed via [Square](https://developer.squareup.com/reference/square) for all consumer payments.
Note: B2B invoices are sent directly through Xero (outside this flow).

## Flow

When form loads, customers selects their store, and available programs are listed. If two programs on the same day are selected, the 'allday' coupon of $5 off is applied.

> A customer cannot select classes across two stores. When changing stores, their class selection is cleared.

When adding children to the form, you can only add as many as the spots available. If multiple classes selected, the class with the least spots is used to determine this.

### Payment Screen

On checkout, the client collects a Square card token and buyer verification token (3DS) and sends them to the server.
The server creates a Square Order (line items per child/session, including an optional order-level discount) and then charges the payment using the submitted token.
Orders include metadata for `classId` and a `lineItemIdentifier` to support accurate refunds.

### Processing Payment

When the customer presses 'Confirm and pay', the server:
- Creates/updates a Square Order with line items and any discount.
- Charges the payment via Square using the provided token and buyer verification token.
- Immediately books the programs into Acuity with `paid: true`, attaching the Square `orderId` and the `lineItemIdentifier` on the appointment for traceability.

## Discount Codes

Only one discount code can be applied to a booking in Acuity at a time. Therefore if the customer enters a discount code, the 'same day discount' is removed from their pricing.

With Square, discounts are applied at the Order level as either a fixed percentage or fixed amount. Line items capture the final price (after discount), and metadata is used for reconciliation and refunds.

### ⚠️ **Note about discount codes** ⚠️

Discounts affect payment totals (in Square) but are not applied within Acuity.
All-day identification still uses the Acuity certificate (`allday`).
Order/line-item amounts in Square reflect discounts and are used for refunds and reconciliation.

## Booking into Acuity & Refunds

Bookings are scheduled into Acuity immediately after successful payment (no payment webhook required). Each appointment stores the Square `orderId` and `lineItemIdentifier`.

If a customer cancels via Acuity, the Acuity webhook triggers server logic to identify the correct Square Order line item and calculate the refund amount based on the charged price (after discounts). Refunds are issued via Square, and a confirmation email is sent to the customer with the Square receipt URL when available.

## Known Limitations

-   If someone books in for the day, then cancels on of the two appointments, they will still be seen as 'allday'.
-   Conversely, if someone books in a program, and later returns to book in the other program on that day, it will not mark both programs as 'allday'.
