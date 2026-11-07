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

## Thinking it through first

Eighty-one empty cells is a good way to freeze. An optional **Guide** opens beside the
sheet — never in front of it — and closes again when you don't want it:

- **Goal** — seven prompts that work out what belongs in the middle, including what will
  stop you and what you will do when it does. It assembles a draft goal line you can drop
  into the centre cell, and tells you how the one you have reads.
- **The eight** — five different ways to derive your eight areas (what would stop you,
  what you cannot yet do, the whole person, inputs rather than outcomes, skill and
  character together), a subtraction test for whether an area is load-bearing, and a
  scratch list whose lines you can send straight into empty areas.
- **Actions** — reads all sixty-four and separates two things: lines that describe a state
  rather than a step, which it explains and offers to take you to, and lines that simply
  do not say *when*, which it mentions once rather than sixty times. Also: which eight
  actions to start with if sixty-four is too many.
- **Library** — seven starter sheets (marathon, fitness, shipping a product, changing
  career, a language, money, a book). Each names eight areas and suggests a few actions
  per area; none fills the sheet, because choosing the actions is the part that does you
  good. Plus charts worth studying, labelled real or composed.
- **Evidence** — what is actually known about goal setting, with effect sizes, sources and
  the places the evidence is weaker than people claim. Including two things you will be
  told that are not true.

Your working notes are saved with the sheet and are deliberately left out of share links.

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

## On the research

Every figure in the Evidence panel was read at its source, not taken from a summary. Where
a finding is contested, extrapolated, or drawn from a literature showing publication bias,
the page says so rather than quoting the flattering number. Two widely repeated claims are
listed as what they are: the Harvard/Yale written-goals study never happened, and "21 days
to form a habit" is a misreading of a 1960 book about recovering from plastic surgery.

If you find something stated as fact here that is wrong, that is a bug. Please open an
issue.

## Attribution

The method of expanding one goal into eight areas and sixty-four actions is credited to the
Japanese educator **Takashi Harada**. The 9×9 chart format is widely attributed to
**Matsumura Yasuo**, who devised it in 1979. Neither is claimed here.

This worksheet is independent. It is **not affiliated with, endorsed by, sponsored by or
connected to** Takashi Harada, the Harada Education Institute, Matsumura Yasuo, Clover
Management Research, Shohei Ohtani, or any club, league or organisation. Names appear only
to say accurately who did what, and to refer to matters of public record.

Nothing here is professional, medical, psychological, legal or financial advice.

## Licence

Non-commercial use with attribution — see [LICENSE](LICENSE), which also carries the
notices that must travel with the work if you republish it.
