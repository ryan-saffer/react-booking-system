# Knowledge Base Notes

Write for a busy staff member who wants the answer, not the backstory.

- Content lives in `src/content/docs`.
- Keep headings and steps short.
- Add sidebar entries in `astro.config.mjs`.
- Imported images go in `src/assets`; direct downloads go in `public`.
- Root `/docs` is engineering documentation and is not published here.

```bash
npm run docs
npm --workspace docs run check
npm run build --workspace docs
```

For content changes, open the affected page and check links, navigation, images, and mobile readability.
