# Changelog

## 2.0 — 2026-11-06

A rebuild of the single-file worksheet.

### Fixed

- **The chart was not a Mandal chart.** The eight cells ringing the centre block were
  treated as ordinary action cells, so the sheet had 72 action cells while the counter
  read `x/64` — it could show `72/64`. Those eight cells are the focus areas, mirrored
  live to the centre of each outer block, and the arithmetic now closes at exactly 81.
- **Arrow keys fought the cursor.** They moved between cells unconditionally, so you could
  not move the caret inside a cell's text. Arrows now move the caret and only cross into
  the next cell once the caret is at the end of the text; <kbd>Alt</kbd>+arrow always moves.
- **"Save as PDF" only called `window.print()`**, exactly like the Print button beside it.
  There is now one honest Print / Save as PDF button.
- **The clone command in the README was a GitHub Pages URL**, not the repository.
- **Printing produced an unreadable sheet.** It now fits one landscape page, with the
  checklist on the pages after it and a header carrying the goal, deadline and date.
- `Ctrl/⌘+P` was intercepted to do what the browser already does; that is gone.

### Added

- Mark actions done, with a stamped seal, a per-focus tally on the sheet and a 64-tick
  gauge; <kbd>Ctrl/⌘</kbd>+<kbd>Enter</kbd> stamps the cell you're in.
- A Checklist view beside the Sheet view — the better way to work through the actions, and
  the better layout on a phone.
- Several sheets, with create, rename, duplicate and delete.
- A goal line and a deadline above the chart.
- Share links that carry the whole sheet in the URL fragment; Markdown export.
- Undo on clearing or deleting a sheet.
- Dark mode, following the system until overridden.
- Offline support and installability via a service worker and manifest.
- Accessible labels on all 81 cells and both checkbox sets, visible focus rings, and
  `prefers-reduced-motion` respected.
- A cell being edited grows past its borders, so long text stays readable instead of being
  silently cut off; printing shrinks each cell's text to the printed cell rather than
  clipping it.
- 21 unit tests over the pure core and a static-check script, both run by CI. The static
  checks parse both inline scripts, so a botched edit to the single HTML file fails CI.

### Changed

- Redrawn as a draughtsman's worksheet — ruled paper, sumi ink, a vermilion seal for
  completion — in place of the purple-gradient template styling.
- Storage moved from 81 loose `harada_cell_N` keys to one versioned `harada.state.v2`
  record. Sheets from the old version are migrated automatically on first open.
- `alert()` and `confirm()` replaced by toasts and dialogs.
