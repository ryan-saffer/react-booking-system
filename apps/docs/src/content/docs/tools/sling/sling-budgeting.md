---
title: Budgeting in Sling
description: Understand how Sling estimates payroll costs and why the numbers may differ from the final pay run.
---

Sling’s budgeting feature estimates payroll for the current roster so you can see labour costs before the pay run lands in Xero. The estimate pulls the wage assigned to each employee-position combination, then applies the correct loading for the shift label they are rostered into (including `[On Call]`, `[Superhero]`, and `[Sunday]` combinations). Those base wages sync from Xero automatically.

## How wage data stays current

- Wages sync from Xero every Friday at 6:00 a.m., immediately after the Thursday payroll run.
- Each employee in Sling is assigned to every position, even the ones they rarely work, so a published shift never receives a $0 estimate.

## When budgets diverge from payroll

Even with fresh wage data, Sling’s estimate will not always match the final payroll figure.

- New starters do not receive a wage in Sling until after their first payroll is processed, so their shifts show $0 until the next Friday sync.
- Birthdays inside the pay period raise the base rate inside Xero from that date onward; Sling may show the lower rate until the weekly sync runs.
- Travel allowances and other extras are added in Xero payroll only - they never appear in Sling’s budgeting view.
- Sling does not calculate overtime penalties, so large week totals can underestimate the final pay.

## Overtime thresholds in Sling

Sling flags overtime once someone hits 38 hours in a single week. Use the warning as a cue to redistribute hours so most staff stay below the limit.

Remember that `[On Call]` shifts do not count toward overtime in payroll but **do** count toward the Sling warning. If a roster is heavy on `[On Call]` coverage you may safely run over 38 rostered hours, but call it out for Finance so the discrepancy is understood.
