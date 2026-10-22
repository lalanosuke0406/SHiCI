import {readFile, writeFile} from "node:fs/promises";
const root = new URL("../../", import.meta.url);
const target = new URL("frontend/index.html", root);
let html = (await readFile(target, "utf8")).replace(/\r\n/g, "\n");
let start = html.indexOf("    <section\n        id=\"executiveMessageView\"");
if (start < 0) start = html.indexOf('<section id="executiveMessageView"');
const end = html.indexOf("    <!-- ==========================================\n         JavaScript", start);
if (start >= 0 && end > start) html = html.slice(0, start) + await readFile(new URL("src/view.html", import.meta.url), "utf8") + "\n\n" + html.slice(end);
else if (!html.includes("executiveChatPanel")) throw new Error("Private view insertion point not found");
html = html.replace(/\s*<script src="js\/ExecutiveMessengerLauncher.js"><\/script>/g, "")
  .replace("js/ExecutiveMessageController.js", "js/ExecutivePrivateController.js");
await writeFile(target, html);
