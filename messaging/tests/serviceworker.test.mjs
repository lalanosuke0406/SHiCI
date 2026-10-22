import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../../frontend/sw.js", import.meta.url), "utf8");
test("service worker never intercepts APIs, authenticated requests or media", () => {
  const handlers = {};
  const context = vm.createContext({ URL,
    self: { registration: { scope: "https://shici.example.com/" }, addEventListener: (name, handler) => { handlers[name] = handler; } }
  });
  vm.runInContext(source, context);
  for (const [url, method, authorized] of [
    ["https://script.google.com/macros/s/example/exec", "POST", false],
    ["https://shici.example.com/api/messages", "GET", false],
    ["https://matrix.example.com/_matrix/client/v3/sync", "GET", false],
    ["https://shici.example.com/js/app.js", "GET", true],
    ["https://shici.example.com/media/private-file", "GET", false]
  ]) {
    handlers.fetch({ request: { url, method, headers: { has: () => authorized } },
      respondWith() { assert.fail("private network requests must bypass the shell cache"); } });
  }
});

test("push display ignores supplied content and notification clicks return to the normal entry",async()=>{
  const handlers={};let displayed,waited,posted,opened;
  const context=vm.createContext({URL,self:{registration:{scope:"https://shici.example.com/",showNotification:async(title,options)=>{displayed={title,options};}},addEventListener:(name,fn)=>handlers[name]=fn},
    clients:{matchAll:async()=>[{postMessage:value=>{posted=value;},focus:async()=>{}}],openWindow:async url=>{opened=url;}}});
  vm.runInContext(source,context);
  handlers.push({data:{json:()=>({body:"private message",sender:"private sender",url:"/secret"})},waitUntil:promise=>{waited=promise;}});await waited;
  assert.equal(displayed.title,"SHiCI");assert.equal(displayed.options.body,"確認事項があります。");assert.equal(displayed.options.data.url,"./");
  handlers.notificationclick({notification:{close(){},data:{url:"/secret"}},waitUntil:promise=>{waited=promise;}});await waited;
  assert.equal(posted.type,"shici-notification-open");assert.equal(opened,undefined);
  context.clients.matchAll=async()=>[];
  handlers.notificationclick({notification:{close(){}},waitUntil:promise=>{waited=promise;}});await waited;assert.equal(opened,"./");
});
