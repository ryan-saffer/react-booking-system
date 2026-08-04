# Knowledge Base Notes

This is the internal Fizz Kidz technology knowledge base for staff and franchisees. Write for a busy, nontechnical team
member who wants a clear answer, not the implementation story.

## Purpose

- Explain Fizz technology from the team's point of view: what a feature does, what happens automatically, and what the
  person needs to do.
- Uncover useful behaviour that may not be obvious in the Portal, such as customer messages, booking rules, invoice
  statuses, cancellation outcomes, and scheduled reminders.
- Treat the Fizz Kidz Portal as the team's source of truth and usual starting point.
- Use application code to verify facts, but translate those facts into plain business outcomes.

This is not an engineering reference or a replacement for the franchisee and studio operations manuals.

## Do Not Include

- Servers, APIs, webhooks, databases, architecture, request sequencing, or other implementation details.
- Rollback behaviour, partial-success scenarios, orphaned records, best-effort integrations, or hypothetical system
  failures. These make dependable features sound fragile and are not useful to the reader.
- Advice to reconcile the Portal with an underlying system or manually keep several systems in sync. If the Portal is
  wrong, tell the reader to record and report the problem so it can be fixed.
- Generic explanations of how websites or forms work, such as telling someone to enter details, submit, and wait for a
  success message.
- Broad "who does what" guides, party-day instructions, franchise operations, safety manuals, or other established
  operational procedures.
- Dedicated documentation for retired or out-of-scope journeys, including legacy Preschool and Play Lab, unless the
  user explicitly requests it.
- A general payments handbook. Explain payments, invoices, gift cards, and refunds within the feature where they matter.

Deliberate product rules and normal user-facing conditions are still useful. For example, document an expired discount
code, a 48-hour refund cutoff, an invoice status, or an action that intentionally does not notify a customer.

## Voice

- Use light, friendly Fizz language, but keep it restrained. This is an internal guide, not customer marketing.
- Be direct and confident about the normal path. Do not repeatedly tell readers to double-check automation that normally
  works.
- Avoid technical jargon, condescending basics, excessive backstory, and whimsical filler.
- Prefer "The customer receives a confirmation" over "The server attempts to send an email."
- Call connected tools by name only when the reader will encounter them. Explain their role in one plain sentence.

## Page Design

- Keep pages short, scannable, and focused on one journey or task. Avoid walls of text.
- Lead with the useful answer, then add concise detail.
- Use short headings, tables, steps, cards, badges, asides, and related-page links where they improve scanning.
- Do not use components merely for decoration. Check that every icon is a supported Starlight icon and renders.
- When badges introduce card text, put the explanation on a new line and include explicit spacing between adjacent badges.
- Prefer a small number of meaningful callouts. Too many cautions make routine workflows feel unreliable.

A useful feature page will usually cover:

1. What the feature is for.
2. The normal customer or team journey.
3. What happens automatically, described as outcomes rather than implementation.
4. Important business rules or statuses.
5. A short, ordinary troubleshooting section only when readers can take a useful action.

## Portal-First Problems

If something looks wrong in the Portal, do not send the reader hunting through source systems. Ask them to record:

- the customer or booking;
- the studio and date;
- what they expected to see;
- what the Portal shows; and
- a screenshot of any error.

Then tell them to report it so the underlying issue can be fixed.

## Files And Checks

- Content lives in `src/content/docs`.
- Add sidebar entries in `astro.config.mjs`.
- Imported images go in `src/assets`; direct downloads go in `public`.
- Root `/docs` is engineering documentation and is not published here.

```bash
npm run docs
npm --workspace docs run check
npm run build --workspace docs
```

For content changes, open the affected page and check wording, links, navigation, components, icons, images, and mobile
readability. Build the docs before finishing.
