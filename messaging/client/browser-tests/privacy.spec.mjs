import {test, expect} from "@playwright/test";
import {startServer} from "../dev-server.mjs";
let server;
test.beforeAll(() => { server = startServer(4173); });
test.afterAll(() => server.close());
test("normal view has no private UI and no SDK load; stale unlock is rejected", async ({page}) => {
  const requests = [];
  page.on("request", request => requests.push(request.url()));
  await page.goto("http://localhost:4173/test.html");
  await expect(page.locator("#executiveMessageView")).toBeHidden();
  expect(requests.some(url => url.includes("/private/"))).toBe(false);
  await page.evaluate(() => {
    const epoch = ExecutiveMessageController_getEpoch();
    ExecutiveMessageController_emergencyClose();
    ExecutiveMessageController_handleUnlocked(null, null, {executiveSessionToken: "late", expiresAt: Date.now()+5000,
      messaging: {provider:"matrix"}}, epoch);
  });
  await expect(page.locator("#executiveMessageView")).toBeHidden();
});
test("lock synchronously clears media, inputs, keys and rejects late startup", async ({page}) => {
  await page.goto("http://localhost:4173/test.html");
  await page.route("**/private/client.js", async route => {
    await new Promise(resolve => setTimeout(resolve, 300));
    await route.fulfill({contentType:"text/javascript", body:"export function createPrivateClient(){throw Error('Must not be started after lock')}"});
  });
  await page.locator("#testUnlock button").click();
  await expect(page.locator("#executiveMessageView")).toBeVisible();
  await page.evaluate(() => {
    document.getElementById("executiveMessageInput").value = "sensitive draft";
    document.getElementById("executiveGeneratedKey").textContent = "test recovery secret";
    document.getElementById("executiveConversation").textContent = "plaintext preview";
    ExecutiveMessageController_emergencyClose();
  });
  await expect(page.locator("#appView")).toBeVisible();
  await expect(page.locator("#executiveMessageView")).toBeHidden();
  await page.waitForTimeout(600);
  await expect(page.locator("#executiveMessageView")).toBeHidden();
  await expect(page.locator("#executiveMessageInput")).toHaveValue("");
  await expect(page.locator("#executiveGeneratedKey")).toBeEmpty();
  await expect(page.locator("#executiveConversation")).toBeEmpty();
});
test("visibility, pagehide and sustained face-down each restore normal SHiCI", async ({page}) => {
  await page.goto("http://localhost:4173/test.html");
  await page.route("**/private/client.js", route => route.fulfill({contentType: "text/javascript",
    body: "export function createPrivateClient(){return {request:async()=>({loginRequired:true}),close(){}}}"}));
  for (const boundary of ["visibility", "pagehide", "face-down"]) {
    await page.locator("#testUnlock button").click();
    await expect(page.locator("#executiveMessageView")).toBeVisible();
    await page.evaluate(boundary => {
      if (boundary === "visibility") {
        Object.defineProperty(document, "hidden", {configurable:true, value:true});
        document.dispatchEvent(new Event("visibilitychange"));
        Object.defineProperty(document, "hidden", {configurable:true, value:false});
      } else if (boundary === "pagehide") window.dispatchEvent(new Event("pagehide"));
      else {
        const realNow = Date.now; let now=1000; Date.now=()=>now;
        ExecutiveMessageController_handleDeviceOrientation({beta:180,gamma:0});
        now=1100;
        ExecutiveMessageController_handleDeviceOrientation({beta:180,gamma:0});
        now=1200;
        ExecutiveMessageController_handleDeviceOrientation({beta:180,gamma:0});
        now=1300;
        ExecutiveMessageController_handleDeviceOrientation({beta:180,gamma:0});
        Date.now=realNow;
      }
    }, boundary);
    await expect(page.locator("#executiveMessageView")).toBeHidden();
    await expect(page.locator("#appView")).toBeVisible();
  }
});
test("incoming messages preserve an existing attachment preview", async ({page}) => {
  await page.goto("http://localhost:4173/test.html");
  await page.evaluate(() => {
    executiveActiveRoom="room";
    executiveMessages=[{id:"one",body:"clip.mp4",mine:true,timestamp:Date.now(),attachment:{name:"clip.mp4"}}];
    ExecutiveMessageController_renderMessages();
    const bubble=document.querySelector("[data-message-id=one]");
    const video=document.createElement("video");bubble.appendChild(video);window.testPreview=video;
    executiveMessages.push({id:"two",body:"new message",timestamp:Date.now()});
    ExecutiveMessageController_renderMessages();
  });
  expect(await page.evaluate(()=>document.querySelector("[data-message-id=one] video")===window.testPreview)).toBe(true);
});

test("notification opt-in and stop are available only inside the device panel",async({page})=>{
  const key=Buffer.concat([Buffer.from([4]),Buffer.alloc(64,1)]).toString("base64url");
  await page.addInitScript(({key})=>{
    window.pushCalls=[];let sub=null;
    const permission={permission:"default",requestPermission:async()=>{window.pushCalls.push("permission");permission.permission="granted";return "granted";}};
    Object.defineProperty(window,"Notification",{configurable:true,value:permission});
    Object.defineProperty(window,"PushManager",{configurable:true,value:function(){}});
    Object.defineProperty(navigator,"serviceWorker",{configurable:true,value:{addEventListener(){},ready:Promise.resolve({pushManager:{
      getSubscription:async()=>sub,subscribe:async options=>{window.pushCalls.push("subscribe");sub={options,toJSON:()=>({endpoint:"https://fcm.googleapis.com/fixture",keys:{p256dh:key,auth:"A".repeat(22)}}),unsubscribe:async()=>{sub=null;window.pushCalls.push("unsubscribe");return true;}};return sub;}
    }})}});
  },{key});
  await page.route("**/private/free-client.js",route=>route.fulfill({contentType:"text/javascript",body:`export function createPrivateClient(){return {close(){},async request(action){window.pushCalls.push(action);if(action==='pushConfiguration')return {configured:true,publicKey:${JSON.stringify(key)},subscribed:false};if(action==='devices')return [];if(action==='selectPeer')return {roomId:'fixture'};return {ready:true};}};}`}));
  await page.goto("http://localhost:4173/test.html");
  await expect(page.locator("#executiveFreePushButton")).toBeHidden();
  await page.evaluate(()=>{window.testConfiguration={provider:"cloudflare",userId:"alice",peers:[{userId:"bob",displayName:"相手"}]};});
  await page.locator("#testUnlock button").click();
  await expect(page.locator("#executiveChatPanel")).toBeVisible();
  await page.locator("#executiveDeviceButton").click();
  await expect(page.locator("#executiveFreePushButton")).toHaveText("通知を有効にする");
  await page.locator("#executiveFreePushButton").click();
  await expect(page.locator("#executiveFreePushButton")).toHaveText("通知を停止する");
  expect(await page.evaluate(()=>window.pushCalls.filter(value=>['permission','subscribe','registerPush'].includes(value)))).toEqual(['permission','subscribe','registerPush']);
  await page.locator("#executiveFreePushButton").click();
  await expect(page.locator("#executiveFreePushButton")).toHaveText("通知を有効にする");
  expect(await page.evaluate(()=>window.pushCalls.slice(-2))).toEqual(['disablePush','unsubscribe']);
  await page.locator("#executiveCloseButton").click();await expect(page.locator("#executiveFreePushButton")).toBeHidden();
});
