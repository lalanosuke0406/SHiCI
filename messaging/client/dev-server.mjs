import http from "node:http";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {resolve, extname, sep} from "node:path";
const frontend = resolve(fileURLToPath(new URL("../../frontend/", import.meta.url)));
const template = await readFile(new URL("src/view.html", import.meta.url), "utf8");
const fixture = `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SHiCI ローカル画面試験</title><link rel="stylesheet" href="/css/main.css"><body>
<div id="appView"><p style="padding:30px">SHiCI 通常画面（ローカル試験用）</p>
<form id="testUnlock" style="padding:30px"><label>試験用ユーザー<select id="testUser"><option>alice</option><option>bob</option></select></label>
<button>試験用入口を開く</button></form></div>${template}
<script>window.lockExecutiveMessageBestEffort=function(){};window.updateMessage=function(){};window.addMessage=function(){};</script>
<script src="/js/ExecutivePrivateController.js"></script><script>
initializeExecutiveMessage();
window.testConfiguration=null;
document.getElementById('testUnlock').onsubmit=async function(event){event.preventDefault();
 const user=document.getElementById('testUser').value, peer=user==='alice'?'bob':'alice';
 const messaging=window.testConfiguration||(window.testFreeMode ? await fetch('/local-free-config?user='+encodeURIComponent(user)).then(response=>response.json()) : {provider:'matrix',homeserverUrl:'http://localhost:8008/',development:true,encryption:'required',
 userId:'@'+user+':matrix.localhost',peers:[{userId:'@'+peer+':matrix.localhost',displayName:peer}]});
 ExecutiveMessageController_handleUnlocked(null,null,{executiveSessionToken:'local-fixture',expiresAt:Date.now()+900000,messaging});};
</script></body></html>`;
export function startServer(port = 4173, options = {}) {
  const server = http.createServer(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    try {
      const url = new URL(request.url, "http://localhost");
      if (options.freeConfig && url.pathname === "/local-free-config") {
        if (request.method !== "GET" || !["alice", "bob"].includes(url.searchParams.get("user"))) { response.writeHead(403).end(); return; }
        response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify(await options.freeConfig(url.searchParams.get("user")))); return;
      }
      if (url.pathname === "/test.html" || url.pathname === "/") {
        response.setHeader("Content-Type", "text/html; charset=utf-8"); response.end(options.freeConfig ? fixture.replace("window.testConfiguration=null;", "window.testConfiguration=null;window.testFreeMode=true;") : fixture); return;
      }
      const path = resolve(frontend, "." + decodeURIComponent(url.pathname));
      if (!path.startsWith(frontend + sep) || url.pathname.split("/").some(segment => segment.startsWith("."))) { response.writeHead(404).end(); return; }
      const types = {".js": "text/javascript", ".css": "text/css", ".wasm": "application/wasm"};
      response.setHeader("Content-Type", types[extname(path)] || "application/octet-stream");
      response.end(await readFile(path));
    } catch { response.writeHead(404).end(); }
  });
  server.listen(port, "127.0.0.1");
  return server;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { startServer(); console.log("ローカル画面試験: http://localhost:4173/test.html（本番の権限確認を使う画面ではありません）"); }
