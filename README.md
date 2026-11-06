# Open Window 64 — a Harada Method worksheet

One goal in the middle. Eight focus areas around it. Eight actions for each — sixty-four
in all. Fill the sheet in, then stamp each action as you finish it.

**[Open the worksheet →](https://ravenxrich.github.io/The-Harada-Method/)**

A single HTML file with no build step, no dependencies and no server. Everything you type
stays in your browser.

---

## The chart it actually draws

The Harada Method, developed by the Japanese educator Takashi Harada, uses a 9×9 sheet —
the one you may have seen filled in by hand by a 16-year-old Shohei Ohtani. Its structure
is specific, and worth getting right:

```
┌────────┬────────┬────────┐      · the goal sits dead centre
│  f1 ×8 │  f2 ×8 │  f3 ×8 │
├────────┼────────┼────────┤      · the eight cells around it hold the
│  f4 ×8 │ f1..f8 │  f5 ×8 │        eight focus areas
│        │ ○ GOAL │        │
├────────┼────────┼────────┤      · each of those focus areas is written
│  f6 ×8 │  f7 ×8 │  f8 ×8 │        again as the centre of its own block,
└────────┴────────┴────────┘        ringed by its eight actions
```

So each focus area appears **twice**, and the arithmetic closes exactly:
1 goal + 8 ring cells + 8 block centres + 64 actions = 81 cells.

Type a focus area in either of its two cells and the other updates as you type.

## What it does

- **Fill the sheet** — click any cell and type. Text is centred and shrinks to fit, and the
  cell you're editing grows past its borders so nothing is hidden from you.
- **Stamp what's done** — click the seal in the corner of an action, or press
  <kbd>Ctrl/⌘</kbd>+<kbd>Enter</kbd>. Each block shows its own tally, and the gauge at the
  top is one tick per action.
- **Two views** — *Sheet* to fill it in, *Checklist* to work through it. The checklist is
  the better view on a phone.
- **Many sheets** — keep one per goal or per year; create, rename, duplicate, delete.
- **Print properly** — the chart fits one landscape page, with the full checklist on the
  pages after it. "Save as PDF" is your browser's print dialog, which is the honest way to
  get a PDF out of a web page.
- **Take it with you** — export every sheet as JSON, copy the active sheet as Markdown, or
  copy a share link that carries the whole sheet inside the URL. Nothing is uploaded.
- **Works offline** — it installs as a small app and keeps working with no network.
- **Light and dark**, follows your system until you choose.
- **Undo** on anything destructive: clearing a sheet or deleting one offers it back.

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Alt</kbd> + arrows | Move to the next cell in that direction |
| arrows | Move the cursor; jumps to the next cell once it's at the end of the text |
| <kbd>Ctrl/⌘</kbd> + <kbd>Enter</kbd> | Stamp the current action done, or un-stamp it |
| <kbd>Tab</kbd> | Next cell, in reading order |
| <kbd>Esc</kbd> | Leave the cell |
| <kbd>?</kbd> | Shortcuts |

## Running it

Just open `index.html` — no install, no build, no server:

```bash
git clone https://github.com/RavenxRich/The-Harada-Method.git
```

```bash
open The-Harada-Method/index.html
```

To exercise the parts that need a real origin (offline support and the install prompt),
serve the folder over HTTP instead:

```bash
python3 -m http.server 5177 --directory The-Harada-Method
```

## Your data

Sheets are kept in this browser's `localStorage` under `harada.state.v2`. There is no
account, no server and no analytics — which also means **clearing your browser data
deletes your sheets**, so export the JSON if a sheet matters.

A share link puts the whole sheet in the URL fragment (after the `#`). Fragments are never
sent to a web server, but anyone holding the link holds the sheet.

Sheets written by the earlier version of this template are picked up automatically the
first time you open this one, and appear as *Recovered sheet*.

### Format

```jsonc
{
  "version": 2,
  "activeId": "sheet-id",
  "charts": [{
    "id": "sheet-id",
    "name": "2027",
    "goal": "Throw 160 km/h",
    "deadline": "31 Mar 2027",
    "focus":   ["Body", "…"],          // 8 strings
    "actions": [["80 km weeks", "…"]], // 8 × 8 strings
    "done":    [[true, false, "…"]],   // 8 × 8 booleans
    "createdAt": 1762400000000,
    "updatedAt": 1762400000000
  }]
}
```

Imports are repaired rather than rejected: ragged rows are squared up, junk values are
coerced, and anything unrecognisable becomes an empty sheet instead of an error.

## Developing

Everything is in `index.html`. The pure logic — layout, progress, migration, the share
codec, Markdown — lives in a single `<script id="harada-core">` block that touches no DOM,
so the tests can run it straight out of the HTML file with nothing installed:

```bash
node --test tests/core.test.mjs
```

```bash
node tools/check.mjs
```

The second one is a set of cheap static checks on the HTML — balanced tags, no `alert`
or inline `onclick` creeping back in, print and dark-mode styles still present, and every
file the service worker promises to cache actually existing. Both run in CI on every push.

## Licence

Non-commercial use, see [LICENSE](LICENSE). The Harada Method is Takashi Harada's; this is
a tool for practising it, not a work of his, and it is not affiliated with or endorsed by
him or his organisation.
