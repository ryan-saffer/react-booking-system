# Overview
A form for customers to book their children into the Fizz Kidz holiday programs.

Provides ability to select multiple programs at once, individually add each child they are booking for, automatically apply same day discounts, and the ability to apply discount codes and pay.

# Architecture
All program information, including times, slots and available coupons are stored inside [Acuity Scheduling](https://acuityscheduling.com/) and accesed through the [developer API](https://developers.acuityscheduling.com/reference).

Payments are made through [Stripe](https://stripe.com/docs/api).

## Flow
When form loads, customers selects their store, and available programs are listed. If two programs on the same day are selected, the 'allday' coupon of $5 off is applied.
> A customer cannot select classes across two stores. When changing stores, their class selection is cleared.

When adding children to the form, you can only add as many as the spots available. If multiple classes selected, the class with the least spots is used to determine this.

### Payment Screen
As soon as the customer navigates to the payment screen, a [PaymentIntent](https://stripe.com/docs/api/payment_intents) is created in Stripe. This payment intent will include a [Metadata](https://stripe.com/docs/api/metadata) field `programType: holiday_program` to help identify it.

### Processing Payment
When the customer presses 'Confirm and pay', all their program details are stored into firestore under their `paymentIntent.id`, and the program is marked as `booked: false`.
> This is done due to asynchronous and complicated nature of payment flows. In order to ensure that the program is only booked into once payment succeeds, the booking is performed inside a webhook, which is listening for successful payment events. Once a successful event occurs where the paymentIntent's `programType === holiday_program`, check firestore if `booked === false`, and proceed to book the programs in.

## Discount Codes
Only one discount code can be applied to a booking in acuity at a time. Therefore if the customer enters a discount code, the 'same day discount' is removed from their booking.

Whenever a discount code is applied or removed, the `paymentIntent` is updated to reflect the new price. Additionally, a key value pair for each program for each child is added into the `metadata`, along with a `discount` key with a value `Certificate | null`. The reason for this is explained below.

### ⚠️ **Note about discount codes** ⚠️
While discount codes are used to calculate to the total cost of the payment, **they are not actually applied inside acuity**.

This is because of the way customers attending the entire day can be identified in acuity. So if a 10% discount is applied, while their same day discount of $5 off (to eligible programs) will not be applied to the price, it will still be applied to the acuity booking.

**But then how are payments tracked, for use in refunds etc?**

For this reason, the `metadata` in the `paymentIntent` will track the price charged for each individual program, along with any discounts on the entire booking. Additionally a `programCount` field will keep track of the number of programs booked. This will help to calculate refunds, and leave a trail for Fizz Kidz to understand how the total charge was calculated.

## Booking into Acuity (Stripe Webhook)
Booking into acuity is performed inside a stripe webhook, once the payment is completed.

Each program is booked in individually, along with the `paymentIntent.id` and the `amount` charged for that program. These are included to easily issue automatic refunds when an appointment is cancelled, by looking at the `amount` field in acuity, and the `discount` field in the `paymentIntent.metadata` to calculate how much should be refunded.
> For example: A cancelled program that was booked without any discount codes, but on the same day as another program, will be refunded $40. However another person in the same situation, but booked using a 20% discount code, will be refunded $45 - 20%. Also important to note is 'amount' discounts (as opposed to percentage discounts) are only applied to the last program in a booking. This is where the `metadata.programCount` field comes in handy.

Finally, a confirmation email is sent to the customer by Fizz Kidz with a link to cancel each individual program. Stripe will additionally send a separate receipt.

## Known Limitations
- If someone books in for the day, then cancels on of the two appointments, they will still be seen as 'allday'.
- Conversely, if someone books in a program, and later returns to book in the other program on that day, it will not mark both programs as 'allday'.


