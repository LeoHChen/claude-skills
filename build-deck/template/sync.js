// Bakes content.md into the inline <script type="text/yaml"> block in index.html
// Run after editing content.md so the deck works without an HTTP server.
//   $ node sync.js

const fs = require("fs");
const path = require("path");

const dir = __dirname;
const content = fs.readFileSync(path.join(dir, "content.md"), "utf8");
const htmlPath = path.join(dir, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const START = '<script type="text/yaml" id="content-data">';
const END = "</script>";
const re = new RegExp(
  `(${START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})[\\s\\S]*?(${END})`
);

if (!re.test(html)) {
  console.error(
    "Could not find the inline content block in index.html. Make sure it contains:\n" +
      `${START}\n...\n${END}`
  );
  process.exit(1);
}

html = html.replace(re, `$1\n${content}\n$2`);
fs.writeFileSync(htmlPath, html);
console.log(`Synced content.md (${content.length} chars) → index.html`);
