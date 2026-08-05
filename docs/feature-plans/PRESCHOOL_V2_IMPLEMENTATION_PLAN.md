# Preschool Program V2 Implementation Plan

## Goal

Replace the current preschool enrolment/invoicing model with a simpler booking-and-payment flow that behaves like holiday programs:

- Parents select one or more individual Acuity class slots.
- Parents pay in full at checkout before appointments are created.
- Acuity appointments are the source of truth for each booking.
- No Firestore enrolment document is created for each booking.
- The legacy preschool program remains untouched until the current term is complete and all invoices are paid.

## Core Product Decisions

- Build the new flow as `preschool-program-v2` alongside the current preschool implementation.
- Use one Acuity appointment type for the whole preschool program, with class slots across different studio calendars.
- Keep one checkout constrained to one studio for v1, matching holiday programs and avoiding mixed Square locations.
- Create one Acuity appointment per child per selected session.
- Store booking details, Square order ID, and Square line item identifier on each Acuity appointment.
- Use shadcn UI patterns from Play Lab, not the deprecated Ant Design holiday-program customer flow.
- Group bookable sessions visually by weekday and time, for example `Monday 11:00am`.
- Allow parents to select any mix of sessions across groups.
- Add a `Book into entire term` action per weekday/time group.
- Apply a 20% discount to sessions selected through a full-term group action.
- Support Square gift cards as a payment method.

## Important Existing Patterns To Reuse

- Holiday programs:
  - `apps/portal/src/components/holiday-programs/customer-booking-screen`
  - `apps/server/src/features/holiday-programs/core/book-holiday-program.ts`
  - `apps/server/src/features/holiday-programs/core/process-holiday-program-payment.ts`
  - Acuity-as-source booking model.
  - Square order line item metadata for refunds.
  - Gift-card-first split tender payment flow.
- Play Lab:
  - `apps/portal/src/components/play-lab/booking-form`
  - `apps/server/src/features/play-lab/core/book-play-lab.ts`
  - `apps/server/src/features/play-lab/core/process-play-lab-payment.ts`
  - Modern shadcn staged booking form.
  - Square wallet/card checkout UI.
  - Gift card input and cart store patterns.
- Current preschool:
  - Keep for legacy attendance/invoicing until cutover.
  - Avoid copying its Firestore enrolment/invoice model into v2.

## Important Risks

- Do not delete or change the legacy preschool flow until the current term is fully finished.
- Do not delete `apps/portal/src/components/preschool-program/booking-form/utils/resolve-calendar-studio.ts` without moving it first; holiday programs imports it.
- Current preschool attendance/invoicing depends on `preschoolProgramEnrolments`, Acuity appointment IDs, and Square invoice IDs.
- If v2 supports cancellation/refunds, every appointment must store `ORDER_ID` and `LINE_ITEM_IDENTIFIER`.
- Avoid Square order-level discounts for the full-term discount. Since bookings can mix full-term groups and ad-hoc sessions, full-term discounts must stay line-item scoped for refund/reconciliation.

## Progress Log

- Done: Created this implementation plan at `PRESCHOOL_V2_IMPLEMENTATION_PLAN.md`.
- Done: Added public placeholder route `/preschool-program-v2-booking`.
- Done: Added placeholder page at `apps/portal/src/components/preschool-program-v2/booking-form/pages/preschool-program-v2-booking-page.tsx`.
- Done: Added server tRPC namespace `preschoolProgramV2`.
- Done: Added initial `preschoolProgramV2.checkGiftCardBalance` mutation.
- Done: Added Acuity appointment type constants in `packages/core/src/acuity/constants/appointmentTypes.ts`:
  - `TEST_PRESCHOOL_PROGRAM: 94471769`.
  - `PRESCHOOL_PROGRAM: 94471796`.
- Done: Rebuilt the shared `core` package so the new appointment constants are available to Portal and server imports.
- Done: Added preschool-v2 Portal booking state shell:
  - Stage store.
  - Basic form schema.
  - Cart store with full-term discount tracking.
- Done: Added grouped preschool-v2 session selection UI:
  - Loads Acuity classes from `PRESCHOOL_PROGRAM` or `TEST_PRESCHOOL_PROGRAM` appointment type IDs.
  - Filters by studio.
  - Groups sessions by weekday and start time.
  - Supports individual session selection.
  - Supports `Book into entire term` per group with 20% line-level discount marking.
  - Shows a one-child cart summary.
- Done: Replaced the booking-page placeholder with the staged form shell so `/preschool-program-v2-booking` renders session selection.
- Done: Investigated empty local session list and corrected swapped appointment type IDs. Acuity test program with 3 classes is `94471769`; production program with 0 classes is `94471796`.
- Done: Fixed full-term discount behavior so unselecting one session from an entire-term group removes the 20% discount from the remaining sessions in that group.
- Done: Full-term discount now also applies when every available session in a day/time group is selected manually, including after unchecking and rechecking the final missing session.
- Decided: Preschool-v2 must use proper Square line-item scoped discounts for the 20% full-term discount, not hidden discounted prices. Square receipts/orders should explicitly show the discount for traceability.
- Done: Added preschool-v2 customer details form stage matching the current preschool details fields, with required PDF anaphylaxis plan upload when a child is anaphylactic.
- Done: Preschool-v2 date of birth is required but has no age-limit validation.
- Done: Cart totals now multiply by child count as children are added or removed in the details form.
- Done: Added preschool-v2 payment stage with Square card/wallet checkout and gift card support.
- Done: Added `preschoolProgramV2.book` server mutation.
- Done: Server booking flow now creates a Square order with real `LINE_ITEM` scoped full-term discounts, applies gift-card/card split payment, and schedules paid Acuity appointments.
- Done: Server stores anaphylaxis plan storage paths in the Acuity allergies field as `Anaphylaxis plan: <storagePath>`.
- Done: Added preschool-v2 confirmation email type/template and send it after successful Acuity scheduling.
- Done: Added discount-code UI above gift cards. Percentage discount codes are calculated after full-term line-item discounts and sent to Square as fixed order-level discounts so receipts match checkout maths.
- Done: Full-term booking now uses inferred term blocks split by 2-week-or-greater gaps, and the 20% option only appears/applies when the whole inferred term is still available and starts in the future.
- Done: Added cancellation/refund webhook handling with full-term discount clawback logic.
- Done: Added unit tests for preschool-v2 Portal cart pricing, inferred term grouping, server discount-code amount calculation, and server refund repricing/clawback helpers.
- Done: Replaced `/dashboard/preschool-program` with an Acuity-only preschool-v2 session selector and attendance screen.
- Done: Attendance rows support sign in, undo sign in, sign out, and undo sign out through Acuity labels, with no Firestore enrolment dependency.
- Done: Attendance rows show allergy/anaphylaxis/additional-information tags and expandable parent, emergency contact, allergy, and secure anaphylaxis-plan details.
- Done: Consolidated Holiday Program and preschool-v2 anaphylaxis plan signing into one shared server implementation with program-specific allowed path prefixes.
- Done: Narrowed existing holiday-program exhaustive appointment-type checks after adding preschool constants to the shared appointment type union.
- Next: Manually test preschool-v2 checkout and cancellation/refund flows in Square sandbox.

## Stage 1: Operational Setup

1. Create Acuity appointment type/category for v2:
   - Done in code as appointment type constants:
     - Production: `PRESCHOOL_PROGRAM = 94471796`.
     - Test: `TEST_PRESCHOOL_PROGRAM = 94471769`.
2. Configure one appointment type for the whole program.
3. Add Acuity class slots under that appointment type across studio calendars.
4. Confirm the Acuity appointment form contains the fields needed for:
   - Child name.
   - Child age.
   - Allergies.
   - Additional child information.
   - Emergency contact name, phone, and relation.
   - Square order ID.
   - Square line item identifier.
   - Optional full-term/discount marker if useful for reporting.
5. Create Square catalog objects for `Preschool Program Session` in dev and prod.
6. Confirm cancellation/refund policy. Recommended default: copy holiday programs and Play Lab, with automatic refunds only more than 48 hours before the session.
7. Confirm preschool age limits and terms and conditions copy.

## Stage 2: Feature Scaffolding

1. Done: Add Portal folder:
   - `apps/portal/src/components/preschool-program-v2/booking-form`.
2. Done: Add public route:
   - `/preschool-program-v2-booking`.
3. Done: Add server folder:
   - `apps/server/src/features/preschool-program-v2`.
4. Done: Add tRPC router:
   - `preschoolProgramV2`.
5. Keep this entirely separate from `preschoolProgram` legacy router.

## Stage 3: Shared Config And Types

1. Add preschool-v2 categories and Square catalog object IDs in server config.
2. Add booking input/result types.
3. Prefer Zod validation for v2 tRPC inputs instead of cast-only inputs.
4. Define a local line item type containing:
   - Acuity class ID.
   - Appointment type ID.
   - Calendar ID.
   - ISO start time.
   - Duration.
   - Child details.
   - Base amount in cents.
   - Square discount UID applied to the line, when eligible.
   - `lineItemIdentifier`.
   - Whether the line received the full-term discount.

## Stage 4: Portal Booking Flow

1. In progress: Build a staged booking page using Play Lab as the template:
   - `program-selection`.
   - Done: `form`.
   - Done: `payment`.
   - `success`.
2. In progress: Use shadcn components, React Hook Form, Zod, and Zustand.
3. Avoid Ant Design components.
4. Done: Start with one studio selector.
5. In progress: Use a cart store for selected sessions, discounts, gift card state, subtotal, total, and total shown to customer.
6. Done: Customer details form includes parent details, child details, allergies, anaphylaxis, emergency contact, terms, and mailing list opt-in.
7. Done: No preschool-v2 age limit is applied beyond requiring a date of birth.
8. Done: Payment stage supports Square card/wallet payments and gift cards.

## Stage 5: Session Selection UI

1. Changed: Use the configured v2 appointment type constants directly instead of fetching appointment types by category.
2. Done: Fetch classes using `trpc.acuity.classAvailability`.
3. Done: Filter classes by selected studio/calendar.
4. Done: Group classes by weekday plus start time:
   - Example group key: `Monday 11:00am`.
5. Done: Render each group as a visually separated section.
6. Done: Show session checkboxes inside each group.
7. Done: Show availability badges:
   - `Full` for no slots.
   - `Only X spots left` when low.
8. Done: Add `Book into entire term` per group.
9. Done: Selecting an entire term selects all available future sessions in that group.
10. Done: Parents can mix multiple groups and ad-hoc sessions in one checkout.
11. Done: Split same weekday/time groups into inferred term blocks using a 2-week-or-greater gap as the boundary between terms.
12. Done: Hide the `Book into entire term` action once the first class in the inferred term has passed or any class in that inferred term is full/unavailable.

## Stage 6: Pricing And Discounts

1. Subtotal = selected session base price multiplied by number of children.
2. Full-term discount = 20% off each selected session in that full-term group.
3. Apply the full-term discount as a real Square line-item scoped discount:
   - Add a top-level Square order discount with `scope: 'LINE_ITEM'`.
   - Use `type: 'FIXED_PERCENTAGE'` and `percentage: '20.00'`.
   - Give it a stable `uid`, for example `full-term-discount`.
   - Add `appliedDiscounts: [{ discountUid: 'full-term-discount' }]` only to qualifying Square line items.
4. Do not bake the discount into the line-item base price. Square line items should keep the normal base price so the receipt clearly shows why the final charged amount is lower.
5. Gift cards remain a payment method, not a discount. They reduce the amount still payable by card/wallet after Square calculates line-item discounts.
6. Done: Discount codes are order-level discounts stacked after full-term line-item discounts. Percentage codes are converted to fixed Square discounts using the post-full-term discounted subtotal so Square receipts match checkout totals.
7. Done: UI calculates displayed totals in cents using the same intended stacking order as Square:
   - Line-item full-term percentage discount.
   - Order-level discount-code percentage/fixed discount.
   - Gift card payment application.
8. The server must re-fetch Acuity classes and recompute all amounts before charging.
9. Done: Reject checkout if submitted amount does not match the server-created Square order total.
10. Do not trust client-submitted prices or discount eligibility.
11. Done: Refund logic reprices the remaining same-order booking rather than blindly refunding one line. This claws back the full-term discount when the remaining booking no longer includes every originally full-term-discounted session.
12. Done: Server independently recomputes full-term eligibility using the same inferred-term 2-week-gap boundary rule before applying Square line-item discounts.

## Stage 7: Server Booking Flow

1. Done: Add `bookPreschoolProgramV2` orchestration.
2. Done: Verify idempotency key using `DatabaseClient.createPaymentIdempotencyKey`.
3. Done: Re-fetch latest Acuity classes.
4. Done: Verify every class:
   - Exists.
   - Belongs to the preschool-v2 appointment type/category.
   - Belongs to the selected studio.
   - Has enough available slots for all submitted children.
5. Done: Recompute line items and full-term discount eligibility.
6. Done: Process Square payment:
   - Create Square customer.
   - Create Square order.
   - Add normal base-price session line items.
   - Add the 20% full-term Square discount with `scope: 'LINE_ITEM'` when at least one line qualifies.
   - Attach `appliedDiscounts` only to qualifying line items.
   - Apply gift card payment first if provided.
   - Charge remaining balance via card/wallet token.
   - Cancel gift card payment if card payment fails.
   - Finalize the Square order.
7. Done: Schedule Acuity appointments after successful payment.
8. Done: Store on each Acuity appointment:
   - Child details.
   - Emergency contact details.
   - Square order ID.
   - Square line item identifier.
   - Optional full-term discount marker.
9. Done: Send confirmation email.
10. Add Zoho/Mixpanel side effects only if needed for launch, and keep them non-blocking.

## Stage 8: Payment UI

1. Copy Play Lab's Square `PaymentForm` pattern.
2. Support:
   - Apple Pay.
   - Google Pay.
   - Credit card.
   - Partial gift card.
   - Full gift card checkout with no card token.
3. Include a stable idempotency key per checkout attempt.
4. Regenerate idempotency key after a failed payment attempt.
5. Show a booking summary by child and session.
6. Done: Clearly display discounted full-term rows, discount-code application, and gift card application.

## Stage 9: Emails And Success Screen

1. Done: Add a preschool-v2 booking confirmation email type and MJML template.
2. Done: Include:
   - Parent name.
   - Studio/address.
   - Child/session list.
   - Acuity confirmation page links.
   - Square receipt URL.
3. Done: Add a success page explaining that sessions are booked and paid.
4. Done: Add a cancellation email for automatic cancellation/refund outcomes.

## Stage 10: Cancellation And Refunds

1. Done: Extend Acuity cancellation webhook handling for preschool-v2.
2. Done: Identify preschool-v2 appointments by configured appointment type ID.
3. Done: Fetch cancelled appointment from Acuity.
4. Done: Read `ORDER_ID` and `LINE_ITEM_IDENTIFIER` from Acuity form fields.
5. Done: Fetch Square order.
6. Done: Find matching Square line item by metadata.
7. Done: Reprice remaining same-order appointments:
   - Keep full-term discount only if all originally full-term-discounted line items are still booked.
   - Recalculate discount codes against the repriced remaining subtotal.
   - Refund `max(0, net paid so far - repriced remaining total)`.
8. Done: Refund across available Square tenders/payments.
9. Done: Respect the 48-hour refund window.
10. Done: Send cancellation email.
11. Reschedules should need no database update because Acuity is the source of truth.

## Stage 11: Admin And Attendance

1. Done: Replace the existing `/dashboard/preschool-program` route in place; no separate v2 route is needed.
2. Done: Reuse and modernise Play Lab attendance patterns with shadcn UI.
3. Done: Source child, parent, allergy, additional-needs, and emergency-contact details from Acuity appointments.
4. Done: Use Acuity labels for check-in/check-out state and undo actions.
5. Done: Do not query or update `preschoolProgramEnrolments` for v2 attendance.
6. Done: Allow master users to select studios while franchise users remain scoped to their current studio selection UI.
7. Done: Support upcoming sessions from the single preschool-v2 Acuity appointment type; when requested, include previous sessions only from inferred term blocks that still have upcoming sessions.
8. Done: Add compact attendance counts and expandable child details.
9. Done: Add defensive unit tests for missing Acuity fields, allergy/anaphylaxis parsing, and unordered attendance labels.

## Stage 12: Legacy Cutover And Cleanup

1. Keep legacy routes active during the current term:
   - `/preschool-program-enrolment-form`.
   - `/dashboard/preschool-program`.
   - `/dashboard/preschool-program-invoicing`.
2. Once the old term is complete and all invoices are paid:
   - Redirect or replace `/preschool-program-enrolment-form` with v2.
   - Remove legacy preschool invoicing routes.
   - Remove old preschool enrolment creation flow.
   - Remove Firestore enrolment model only after confirming no historical admin flow still needs it.
3. Remove `v2` from names/routes only after cutover if desired.

## Stage 13: Verification Checklist

1. Run `vp check`.
2. Run `vp test --run`.
3. Run `vp build` when shared or build configuration changes.
4. Manually test:
   - Studio selection.
   - Session grouping by weekday/time.
   - Single ad-hoc session checkout.
   - Multiple sessions checkout.
   - Full-term group selection and 20% discount.
   - Mixed full-term and ad-hoc sessions.
   - Multiple children.
   - Partial gift card.
   - Full gift card.
   - Card failure after gift card authorization.
   - Acuity appointment fields.
   - Acuity reschedule.
   - Acuity cancellation refund.
   - Preschool dashboard session selection for master and franchise users.
   - Preschool child sign in, undo sign in, sign out, and undo sign out.
   - Preschool allergy/anaphylaxis badges and signed plan access.
8. Done: Added Portal unit tests for:
   - Full-term discount totals.
   - Discount-code totals after full-term discounts.
   - Gift card application after discounts.
   - Child-count recalculation.
   - Inferred term grouping and 2-week boundary behavior.
9. Done: Added server unit tests for:
   - Discount-code fixed amount calculation for Square orders.
   - Refund repricing when full-term discount remains eligible.
   - Refund repricing when full-term discount is clawed back.
   - Refund floor at `$0` when the repriced remaining booking exceeds net paid.

## Open Decisions

- Final public route name.
- Exact Acuity category names.
- Square catalog object IDs for dev and prod.
- Manual validation of cancellation/refund policy details in Square sandbox.
- Whether Zoho and Mixpanel are required for launch.
