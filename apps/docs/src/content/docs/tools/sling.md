---
title: Sling Rostering Rules
description: How to roster shifts in Sling so Xero timesheets stay accurate for Fizz Kidz.
---

Our Sling roster drives every casual-timesheet we create in Xero. Treat it as the source of truth for who worked, what they did, and how they should be paid.

:::note[Casual staff only]
Only roster employees engaged as casual staff. Anyone else added to Sling receives an auto-generated Xero timesheet that payroll cannot use.
:::

## How Sling syncs to Xero

- Each shift becomes a Xero pay item. Service delivery shifts post to Cost of Goods Sold (COGS); administrative shifts use Non COGS items so they appear as business expenses in the Profit & Loss.
- The integration tags every shift with a Xero tracking category that highlights the activity (e.g. in-studio party, mobile party, holiday program, Play Lab).
- Pay items and tracking categories determine where labour costs surface, so double-check the shift name before publishing.

## Day-specific shift labels

- Each core shift has a `[Sunday]` variant used only for Sling budgeting. Payroll applies Sunday loadings based on the calendar date, not the label.
- On Call and Superhero variants do change the Xero rate (10% and 150% respectively), so select them only when that pay treatment is intended.

## Rate-sensitive shifts

- Any shift containing `On Call` or `PIC` pays 10% of the usual rate. Use these only when the employee is genuinely on standby.
- Shifts containing `Superhero` pay 150% of the base rate and should be reserved for premium, hero-led experiences.
- All other shifts pay the ordinary rate. If you intend a premium or standby payment, pick the matching shift name instead of editing timesheets later.

:::caution[Xero review]
Mislabelled rates flow straight into payroll. Validate rate-sensitive shifts in the published schedule before the pay run.
:::

## Choosing the right shift

1. Ask whether the work is a direct cost of delivering a service. If yes, select the relevant service shift so it posts to a COGS pay item.
2. If the work is a general business expense (training, admin, supervisor errands), choose a Non COGS shift from the list below.
3. When unsure, default to `Miscellaneous` (Non COGS) and flag the situation in Slack so Finance can confirm the correct mapping.

## Shift reference

Use this table to confirm how each active Sling shift maps into Xero.

| Shift                                            | Pay Item | Rate          |
| ------------------------------------------------ | -------- | ------------- |
| After School Program Facilitator                 | COGS     | Ordinary rate |
| Events & Activations                             | COGS     | Ordinary rate |
| Holiday Program Facilitator                      | COGS     | Ordinary rate |
| Incursion                                        | COGS     | Ordinary rate |
| Miscellaneous                                    | Non COGS | Ordinary rate |
| Mobile Party Facilitator                         | COGS     | Ordinary rate |
| Party Facilitator                                | COGS     | Ordinary rate |
| PIC                                              | Non COGS | 10% rate      |
| Play Lab Facilitator                             | COGS     | Ordinary rate |
| Supervisor                                       | Non COGS | Ordinary rate |
| Training                                         | Non COGS | Ordinary rate |
| [Sunday] After School Program Facilitator        | COGS     | Ordinary rate |
| [Sunday] Events & Activations                    | COGS     | Ordinary rate |
| [Sunday] Holiday Program Facilitator             | COGS     | Ordinary rate |
| [Sunday] Incursion                               | COGS     | Ordinary rate |
| [Sunday] Miscellaneous                           | Non COGS | Ordinary rate |
| [Sunday] Mobile Party Facilitator                | COGS     | Ordinary rate |
| [Sunday] Party Facilitator                       | COGS     | Ordinary rate |
| [Sunday] PIC                                     | Non COGS | 10% rate      |
| [Sunday] Play Lab Facilitator                    | COGS     | Ordinary rate |
| [Sunday] Supervisor                              | Non COGS | Ordinary rate |
| [Sunday] Training                                | Non COGS | Ordinary rate |
| [On Call] After School Program Facilitator       | COGS     | 10% rate      |
| [On Call] Events & Activations                   | COGS     | 10% rate      |
| [On Call] Holiday Program Facilitator            | COGS     | 10% rate      |
| [On Call] Incursion                              | COGS     | 10% rate      |
| [On Call] Mobile Party Facilitator               | COGS     | 10% rate      |
| [On Call] Party Facilitator                      | COGS     | 10% rate      |
| [On Call] Play Lab Facilitator                   | COGS     | 10% rate      |
| [On Call] [Sunday] After School Facilitator      | COGS     | 10% rate      |
| [On Call] [Sunday] Events & Activations          | COGS     | 10% rate      |
| [On Call] [Sunday] Holiday Program Facilitator   | COGS     | 10% rate      |
| [On Call] [Sunday] Incursion                     | COGS     | 10% rate      |
| [On Call] [Sunday] Mobile Party Facilitator      | COGS     | 10% rate      |
| [On Call] [Sunday] Party Facilitator             | COGS     | 10% rate      |
| [On Call] [Sunday] Play Lab Facilitator          | COGS     | 10% rate      |
| [Superhero] After School Program Facilitator     | COGS     | 150% rate     |
| [Superhero] Events & Activations                 | COGS     | 150% rate     |
| [Superhero] Holiday Program Facilitator          | COGS     | 150% rate     |
| [Superhero] Incursion                            | COGS     | 150% rate     |
| [Superhero] Mobile Party Facilitator             | COGS     | 150% rate     |
| [Superhero] Party Facilitator                    | COGS     | 150% rate     |
| [Superhero] Play Lab Facilitator                 | COGS     | 150% rate     |
| [Superhero] [Sunday] After School Program        | COGS     | 150% rate     |
| [Superhero] [Sunday] Events & Activations        | COGS     | 150% rate     |
| [Superhero] [Sunday] Holiday Program Facilitator | COGS     | 150% rate     |
| [Superhero] [Sunday] Incursion                   | COGS     | 150% rate     |
| [Superhero] [Sunday] Mobile Party Facilitator    | COGS     | 150% rate     |
| [Superhero] [Sunday] Party Facilitator           | COGS     | 150% rate     |
| [Superhero] [Sunday] Play Lab Facilitator        | COGS     | 150% rate     |
