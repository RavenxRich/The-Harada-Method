/**
 * Runs the <script id="harada-core"> block out of index.html inside a Node vm.
 * No build step, no dependencies: `node --test tests/` is the whole suite.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const block = html.match(/<script id="harada-core">([\s\S]*?)<\/script>/);
assert.ok(block, "index.html must contain a <script id=\"harada-core\"> block");

// Evaluated in this realm, not a vm context: a vm would give the values it
// builds a different Array/Object prototype, which deepStrictEqual rejects.
const C = new Function(block[1] + "\n;return HaradaCore;")();
assert.ok(C, "the core block must expose HaradaCore");

const FIXED = () => 0.5;                       // deterministic ids
const NOW = 1762400000000;

test("the sheet is 81 cells: 1 goal + 8 ring + 8 outer centres + 64 actions", () => {
  const L = C.LAYOUT;
  const all = [L.goal, ...L.focusRing, ...L.focusOuter, ...L.actions.flat()];
  assert.equal(all.length, 81);
  assert.equal(new Set(all).size, 81, "no cell may be used twice");
  assert.deepEqual([...all].sort((a, b) => a - b), [...Array(81).keys()]);
});

test("focus areas sit where a Mandal chart puts them", () => {
  const L = C.LAYOUT;
  assert.equal(L.goal, 40, "the goal is the centre of the centre block");
  assert.deepEqual(L.focusRing, [30, 31, 32, 39, 41, 48, 49, 50], "ring around the goal");
  assert.deepEqual(L.focusOuter, [10, 13, 16, 37, 43, 64, 67, 70], "centre of each outer block");
});

test("each focus area's actions are the eight cells around its own centre", () => {
  const L = C.LAYOUT;
  L.actions.forEach((row, f) => {
    assert.equal(row.length, 8);
    const centre = L.focusOuter[f];
    const cr = Math.floor(centre / 9), cc = centre % 9;
    row.forEach((i) => {
      const r = Math.floor(i / 9), c = i % 9;
      assert.ok(Math.abs(r - cr) <= 1 && Math.abs(c - cc) <= 1, `cell ${i} must touch centre ${centre}`);
      assert.notEqual(i, centre);
    });
  });
});

test("cellMap gives every one of the 81 cells exactly one role", () => {
  const m = C.cellMap();
  assert.equal(m.length, 81);
  const tally = {};
  for (let i = 0; i < 81; i++) {
    assert.ok(m[i], `cell ${i} has no role`);
    tally[m[i].role] = (tally[m[i].role] || 0) + 1;
  }
  assert.deepEqual(tally, { goal: 1, "focus-ring": 8, "focus-outer": 8, action: 64 });
});

test("an empty sheet reports nothing done", () => {
  const p = C.progress(C.emptyChart("x", NOW, FIXED));
  assert.deepEqual(
    { g: p.goalSet, f: p.focusFilled, w: p.actionsFilled, d: p.actionsDone, pct: p.pct },
    { g: false, f: 0, w: 0, d: 0, pct: 0 }
  );
});

test("progress counts out of 64 and never above it", () => {
  const c = C.emptyChart("x", NOW, FIXED);
  c.goal = "Pitch 160 km/h";
  for (let f = 0; f < 8; f++) {
    c.focus[f] = "Focus " + f;
    for (let a = 0; a < 8; a++) { c.actions[f][a] = "action"; c.done[f][a] = true; }
  }
  const p = C.progress(c);
  assert.equal(p.actionsTotal, 64);
  assert.equal(p.actionsFilled, 64, "a full sheet is 64 written actions, not 72");
  assert.equal(p.actionsDone, 64);
  assert.equal(p.pct, 100);
  assert.equal(p.focusFilled, 8);
  assert.ok(p.perFocus.every((x) => x.complete));
});

test("per-focus tallies are independent", () => {
  const c = C.emptyChart("x", NOW, FIXED);
  c.actions[2][0] = "a"; c.actions[2][1] = "b"; c.done[2][0] = true;
  c.actions[5][0] = "c";
  const p = C.progress(c);
  assert.deepEqual(p.perFocus[2], { filled: 2, done: 1, complete: false });
  assert.deepEqual(p.perFocus[5], { filled: 1, done: 0, complete: false });
  assert.deepEqual(p.perFocus[0], { filled: 0, done: 0, complete: false });
  assert.equal(p.actionsFilled, 3);
  assert.equal(p.actionsDone, 1);
});

test("whitespace-only text does not count as written", () => {
  const c = C.emptyChart("x", NOW, FIXED);
  c.goal = "   "; c.focus[0] = "\n "; c.actions[0][0] = "  ";
  const p = C.progress(c);
  assert.equal(p.goalSet, false);
  assert.equal(p.focusFilled, 0);
  assert.equal(p.actionsFilled, 0);
});

test("v1's flat cell map migrates into the right places", () => {
  const L = C.LAYOUT;
  const v1 = { [L.goal]: "Be drafted first round" };
  L.focusOuter.forEach((i, f) => { v1[i] = "focus " + f; });
  L.actions.forEach((row, f) => row.forEach((i, a) => { v1[i] = `a${f}${a}`; }));

  const st = C.migrate(v1, NOW, FIXED);
  assert.equal(st.version, C.SCHEMA);
  assert.equal(st.charts.length, 1);
  const c = st.charts[0];
  assert.equal(c.goal, "Be drafted first round");
  assert.deepEqual(c.focus, [0, 1, 2, 3, 4, 5, 6, 7].map((f) => "focus " + f));
  assert.equal(c.actions[3][6], "a36");
  assert.equal(C.progress(c).actionsFilled, 64);
  assert.equal(C.progress(c).actionsDone, 0, "v1 had no done state");
});

test("a v1 focus area typed into the ring cell is not lost", () => {
  const L = C.LAYOUT;
  const v1 = { [L.focusRing[4]]: "Mental game" };   // ring filled, outer centre blank
  const c = C.migrate(v1, NOW, FIXED).charts[0];
  assert.equal(c.focus[4], "Mental game");
});

test("the outer centre wins when v1 has both", () => {
  const L = C.LAYOUT;
  const c = C.migrate({ [L.focusOuter[1]]: "outer", [L.focusRing[1]]: "ring" }, NOW, FIXED).charts[0];
  assert.equal(c.focus[1], "outer");
});

test("v2 state round-trips through migrate unchanged", () => {
  const st = C.emptyState(NOW, FIXED);
  st.charts[0].goal = "Ship it";
  st.charts[0].done[0][0] = true;
  const again = C.migrate(JSON.parse(JSON.stringify(st)), NOW, FIXED);
  assert.deepEqual(again, st);
});

test("migrate repairs junk instead of throwing", () => {
  for (const junk of [null, undefined, 0, "", [], {}, { charts: [] }, { charts: "no" }]) {
    const st = C.migrate(junk, NOW, FIXED);
    assert.equal(st.version, C.SCHEMA);
    assert.equal(st.charts.length, 1);
    assert.equal(st.activeId, st.charts[0].id);
  }
});

test("an unknown activeId falls back to the first sheet", () => {
  const st = C.migrate({ version: 2, charts: [C.emptyChart("a", NOW, FIXED)], activeId: "ghost" }, NOW, FIXED);
  assert.equal(st.activeId, st.charts[0].id);
});

test("normaliseChart squares up ragged and hostile input", () => {
  const c = C.normaliseChart({
    name: "  ", goal: 42, focus: ["ok"], actions: [["one"], "nope"], done: [[true, "yes"]]
  }, NOW, FIXED);
  assert.equal(c.name, "Untitled sheet");
  assert.equal(c.goal, "42");
  assert.equal(c.focus.length, 8);
  assert.ok(c.focus.every((v) => typeof v === "string"));
  assert.equal(c.actions.length, 8);
  assert.ok(c.actions.every((r) => r.length === 8 && r.every((v) => typeof v === "string")));
  assert.equal(c.actions[0][0], "one");
  assert.equal(c.done[0][0], true);
  assert.equal(c.done[0][1], false, "a non-boolean is not done");
});

test("base64url survives every byte value", () => {
  for (const len of [0, 1, 2, 3, 4, 5, 255, 256]) {
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = (i * 7 + 13) % 256;
    const back = C.b64urlToBytes(C.bytesToB64url(bytes));
    assert.deepEqual([...back], [...bytes], "round trip at length " + len);
  }
});

test("base64url output is URL-safe", () => {
  const bytes = new Uint8Array(300);
  for (let i = 0; i < 300; i++) bytes[i] = i % 256;
  assert.match(C.bytesToB64url(bytes), /^[A-Za-z0-9_-]+$/);
});

test("a share link carries the whole sheet, done marks and all", () => {
  const c = C.emptyChart("Ōtani 2010", NOW, FIXED);
  c.goal = "ドラ1 8球団";
  c.deadline = "31 Mar 2027";
  for (let f = 0; f < 8; f++) {
    c.focus[f] = "focus ✓ " + f;
    for (let a = 0; a < 8; a++) {
      c.actions[f][a] = `step ${f}-${a}`;
      c.done[f][a] = (f + a) % 3 === 0;
    }
  }
  const back = C.decodeShare(C.encodeShare(c), NOW, FIXED);
  assert.equal(back.name, c.name);
  assert.equal(back.goal, c.goal);
  assert.equal(back.deadline, c.deadline);
  assert.deepEqual(back.focus, c.focus);
  assert.deepEqual(back.actions, c.actions);
  assert.deepEqual(back.done, c.done);
});

test("a corrupt share token decodes to null rather than crashing", () => {
  for (const bad of ["", "!!!!", "Zm9v", "AAAA", "x".repeat(99)]) {
    assert.equal(C.decodeShare(bad, NOW, FIXED), null);
  }
});

test("Markdown lists only written actions, with their done marks", () => {
  const c = C.emptyChart("x", NOW, FIXED);
  c.goal = "Run a sub-3 marathon";
  c.deadline = "Oct 2027";
  c.focus[0] = "Mileage";
  c.actions[0][0] = "80 km weeks";
  c.actions[0][1] = "Long run\nevery Sunday";
  c.done[0][0] = true;
  const md = C.toMarkdown(c);
  assert.match(md, /^# Run a sub-3 marathon/);
  assert.match(md, /By Oct 2027 · 1\/64 actions done/);
  assert.match(md, /## 1\. Mileage {2}\(1\/8\)/);
  assert.match(md, /- \[x\] 80 km weeks/);
  assert.match(md, /- \[ \] Long run every Sunday/, "newlines inside a cell collapse");
  assert.match(md, /## 2\. Unnamed focus area/);
  assert.ok(!/- \[ \]\s*$/m.test(md), "no bullet for an empty action");
});

test("ids are 8 characters of base36 and differ", () => {
  const a = C.newId(), b = C.newId();
  assert.match(a, /^[0-9a-z]{8}$/);
  assert.notEqual(a, b);
});
