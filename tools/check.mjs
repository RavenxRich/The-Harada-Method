/**
 * Cheap static checks on the single-file app, so CI catches the mistakes that
 * are easy to make when editing one big HTML file by hand.
 */
import { readFileSync, existsSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const fail = [];
const must = (cond, msg) => { if (!cond) fail.push(msg); };

const count = (re) => (html.match(re) || []).length;
must(count(/<script\b/g) === count(/<\/script>/g), "unbalanced <script> tags");
must(count(/<style\b/g) === count(/<\/style>/g), "unbalanced <style> tags");
must(count(/<dialog\b/g) === count(/<\/dialog>/g), "unbalanced <dialog> tags");
must(/<script id="harada-core">/.test(html), "the harada-core block is missing");
must(/<\/html>\s*$/.test(html), "index.html does not end with </html>");

must(!/\bonclick=/i.test(html), "inline onclick handlers are back; wire listeners in script instead");
must(!/\balert\(/.test(html), "alert() is back; use toast() instead");
must(!/\bconfirm\(/.test(html), "confirm() is back; use an undoable toast instead");
must(!/\bprompt\(/.test(html), "prompt() is back; use the ask() dialog instead");
must(/lang="en"/.test(html), "<html> is missing a lang attribute");
must(/name="viewport"/.test(html), "the viewport meta tag is missing");
must(/name="description"/.test(html), "the description meta tag is missing");
must(/prefers-reduced-motion/.test(html), "the reduced-motion guard is missing");
must(/prefers-color-scheme:\s*dark/.test(html), "dark mode styles are missing");
must(/@media print/.test(html), "print styles are missing");

for (const f of ["icon.svg", "manifest.webmanifest", "sw.js", "LICENSE", "README.md"]) {
  must(existsSync(new URL("../" + f, import.meta.url)), `${f} is missing`);
}

// Both inline scripts must at least parse. new Function compiles without
// running, so this catches a botched edit before it reaches a browser.
for (const m of html.matchAll(/<script(?: id="([^"]*)")?>([\s\S]*?)<\/script>/g)) {
  try { new Function(m[2]); }
  catch (e) { fail.push(`inline script ${m[1] || "(unnamed)"} does not parse: ${e.message}`); }
}

// Every file the service worker promises to cache has to exist.
const sw = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
for (const m of sw.matchAll(/"\.\/([A-Za-z0-9._-]+)"/g)) {
  must(existsSync(new URL("../" + m[1], import.meta.url)), `sw.js caches ${m[1]}, which does not exist`);
}

if (fail.length) {
  console.error("Static checks failed:");
  for (const f of fail) console.error("  ✖ " + f);
  process.exit(1);
}
console.log("Static checks passed.");
