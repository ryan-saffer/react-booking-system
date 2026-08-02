---
title: Shifts & Payroll Integration
description: Pick the right Sling shift variant so cost of delivery and overheads stay accurate in Xero.
---

Our Sling roster drives every casual-timesheet we create in Xero. Treat it as the source of truth for who worked, what they did, and how they should be paid.

:::note[Casual staff only]
Only roster employees engaged as casual staff. Anyone else added to Sling receives an auto-generated Xero timesheet that payroll cannot use.
:::

Our Sling roster needs to reflect the service a team member delivered and whether the work was hands-on with kids or preparation. Accurate labels keep Xero labour costs split between Cost of Goods Sold (COGS) for service delivery, COGS Supervisor duties, and Non COGS for other miscellaneous tasks.

:::tip[Quick rules]

- Choose a _Facilitator_ shift whenever the person is actively running the service.
- Use the service-specific _[Supervisor]_ shift for all prep, packing, shopping, calls, or other support tasks.
- Every Facilitator shift has `[On Call]`, `[Superhero]`, and `[Sunday]` variants - match the correct label to the circumstance.
  :::

## Core services and shifts

All seven core services have the same structure. Facilitator variants post to one COGS wage account, while Supervisor variants post to a separate Supervisor COGS wage account. Exceptions listed below post to a NON-COGS wage account.

- **Party (in studio)**
- **Mobile Party**
- **Holiday Program**
- **Events and Activations**
- **After School Program**
- **Incursions**
- **Play Lab**

## Exceptions

| Exception              | Shift names                                                                                   | When to use                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Training               | <ul style="white-space:nowrap"><li>`Training`</li><li>`[Sunday] Training`</li></ul>           | Any structured training or shadowing block. Posts to Non COGS even if it happens during a program.                           |
| PIC (Person In Charge) | <ul style="white-space:nowrap"><li>` PIC`</li><li>`[Sunday] PIC`</li></ul>                    | On-call duty manager coverage. Pays the 10% standby rate - avoid rostering during active delivery.                           |
| Miscellaneous          | <ul style="white-space:nowrap"><li>`Miscellaneous`</li><li>`[Sunday] Miscellaneous`</li></ul> | Work that does not fit a specific service (e.g. customer service at Head Office). Use sparingly and flag in Slack if unsure. |

## Rate modifiers and budgeting

Use this reference when you need a modifier on a Facilitator or Supervisor shift.

| Modifier                                              | Rate impact                                             | When to use                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| <span style="white-space:nowrap">`[On Call]`</span>   | Pays 10% of the base rate and does not accrue overtime. | Someone is on standby (including PIC) rather than delivering the session.         |
| <span style="white-space:nowrap">`[Superhero]`</span> | Pays 150% of the base rate.                             | A team member jumps in at the last minute and genuinely saves the day.            |
| <span style="white-space:nowrap">`[Sunday]`</span>    | No rate change - label supports Sling budgeting only.   | The shift falls on a Sunday; payroll still calculates penalties by calendar date. |

## Laundry allowance

Payroll automatically adds a laundry allowance for staff who work eligible uniformed shifts. Managers do not need to add a separate shift or note in Sling.

### Eligible shifts

The allowance applies to hands-on facilitator shifts where staff wear the Fizz Kidz uniform, including standard, Sunday, and called-in variants for:

- Party Facilitator
- Mobile Party Facilitator
- Holiday Program Facilitator
- Events and Activations
- After School Program Facilitator
- Incursions
- Play Lab Facilitator

It does not apply to `[On Call]`, PIC, Supervisor, Training, Miscellaneous, or `[Superhero]` shifts.

### How the export creates rows

- The export adds one laundry allowance row for each eligible day worked, with quantity `1` at `$1.32`.
- Rows are created per day, rather than one combined weekly row, so each allowance can be tracked against the correct Xero activity.
- If someone works multiple eligible shifts on the same day, payroll uses the activity from their first eligible shift that day.
- If someone works eligible shifts in more than one location on the same day, payroll also uses the location from their first eligible shift that day.

### Weekly cap

The allowance is capped at `$6.62` per employee per week.

Five eligible days pays `$6.60` (`5 x $1.32`). If the employee works a 6th or 7th eligible day, payroll adds only the remaining `$0.02` needed to reach the cap. The export does this by adding one extra laundry allowance row with quantity `0.0152`, because `$1.32 x 0.0152 = $0.020064`, which Xero rounds to `$0.02`.

## Overtime thresholds in Sling

Sling flags overtime once someone hits 38 hours in a single week. Use the warning as a cue to redistribute hours so most staff stay below the limit.

Remember that `[On Call]` shifts do not count toward overtime in payroll but **do** count toward the Sling warning. If a roster is heavy on `[On Call]` coverage you may safely run over 38 rostered hours, but call it out for Finance so the discrepancy is understood.
