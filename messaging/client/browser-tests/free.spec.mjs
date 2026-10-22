import {test,expect} from "@playwright/test";
import {mkdtemp,readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {join} from "node:path";
import {startFreeServer} from "../../free/dev-server.mjs";
let service;
test.beforeAll(async()=>{
  const {mkdir}=await import("node:fs/promises");
  const testRoot=fileURLToPath(new URL("../../../.local-tests/",import.meta.url));await mkdir(testRoot,{recursive:true});
  const stateRoot=await mkdtemp(join(testRoot,"free-browser-"));
  service=await startFreeServer({apiPort:0,stateRoot});
});
test.afterAll(async()=>{await service.close();});
test("hidden UI: register two browsers, compare keys, real-time encrypted text and file, close/reopen without recovery",async({browser})=>{
  test.setTimeout(180000);
  const first=await browser.newContext({viewport:{width:390,height:844}}),second=await browser.newContext({viewport:{width:390,height:844}});
  const alice=await first.newPage(),bob=await second.newPage();
  try {
    for(const [page,user] of [[alice,"alice"],[bob,"bob"]]) {
      await page.goto("http://localhost:4173/test.html");
      await page.locator("#testUser").selectOption(user);await page.locator("#testUnlock button").click();
      try {await expect(page.locator("#executiveFreeRegisterPanel")).toBeVisible({timeout:30000});} catch(error) {console.log("registration status",await page.locator("#executiveStatus").textContent());throw error;}
      await page.locator("#executiveFreeRegisterAccepted").check();await page.locator("#executiveFreeRegisterForm button").click();
      await expect(page.locator("#executiveChatPanel")).toBeVisible({timeout:60000});
    }
    await alice.locator("#executivePeerList button").click();
    await expect(alice.locator("#executivePeerVerificationPanel")).toBeVisible({timeout:30000});
    await expect(bob.locator("#executivePeerVerificationPanel")).toBeVisible({timeout:30000});
    expect(await alice.locator("#executiveVerificationCode").textContent()).toBe(await bob.locator("#executiveVerificationCode").textContent());
    await alice.locator("#executiveConfirmPeerButton").click();await bob.locator("#executiveConfirmPeerButton").click();
    await expect(alice.locator("#executivePeerVerificationPanel")).toBeHidden();
    await expect(bob.locator("#executivePeerVerificationPanel")).toBeHidden();
    await alice.locator("#executiveMessageInput").fill("暗号化ブラウザ試験の文字");await alice.locator("#executiveMessageForm button[type=submit]").click();
    await expect(alice.locator("#executiveConversation")).toContainText("暗号化ブラウザ試験の文字",{timeout:20000});
    await expect(bob.locator("#executiveConversation")).toContainText("暗号化ブラウザ試験の文字",{timeout:20000});
    await bob.locator("#executiveMessageInput").fill("ブラウザからの返信");await bob.locator("#executiveMessageForm button[type=submit]").click();
    await expect(bob.locator("#executiveConversation")).toContainText("ブラウザからの返信",{timeout:20000});
    await expect(alice.locator("#executiveConversation")).toContainText("ブラウザからの返信",{timeout:20000});
    await alice.locator("#executiveFileInput").setInputFiles({name:"試験.txt",mimeType:"text/plain",buffer:Buffer.from("暗号化添付の内容")});
    await expect(bob.locator("#executiveConversation")).toContainText("試験.txt",{timeout:20000});
    await bob.locator("#executiveConversation button[data-attachment]").click();
    await expect(bob.locator("#executiveConversation a[download]")).toBeVisible();
    const pixel=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=","base64");
    await alice.locator("#executiveFileInput").setInputFiles({name:"画像プレビュー.png",mimeType:"image/png",buffer:pixel});
    await expect(bob.locator("#executiveConversation img")).toBeVisible({timeout:20000});
    await expect(alice.locator("#executiveConversation img")).toBeVisible({timeout:20000});
    await expect.poll(()=>bob.locator("#executiveConversation img").evaluate(image=>image.naturalWidth)).toBeGreaterThan(0);
    const clip=await readFile(new URL("fixtures/flower.mp4",import.meta.url));
    await alice.locator("#executiveFileInput").setInputFiles({name:"動画プレビュー.mp4",mimeType:"video/mp4",buffer:clip});
    // Test the actual decoder: canPlayType may report support without an installed codec.
    await expect(bob.locator("#executiveConversation")).toContainText("動画プレビュー.mp4",{timeout:20000});
    for(const page of [alice,bob])await page.locator("#executiveConversation").evaluate(node=>{node.scrollTop=node.scrollHeight;});
    const supportsVideo=await bob.evaluate(async data=>{
      const video=document.createElement("video"),url=URL.createObjectURL(new Blob([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],{type:"video/mp4"}));
      let timer;
      try {return await new Promise(resolve=>{video.onloadedmetadata=()=>resolve(true);video.onerror=()=>resolve(false);timer=setTimeout(()=>resolve(false),5000);video.preload="metadata";video.src=url;});}
      finally {clearTimeout(timer);video.onerror=null;video.onloadedmetadata=null;video.removeAttribute("src");video.load();URL.revokeObjectURL(url);}
    },clip.toString("base64"));
    if (supportsVideo) {
    await expect(bob.locator("#executiveConversation video")).toBeVisible({timeout:30000});
    await expect(alice.locator("#executiveConversation video")).toBeVisible({timeout:30000});
    await expect.poll(()=>bob.locator("#executiveConversation video").evaluate(video=>video.videoWidth)).toBeGreaterThan(0);
    expect(await bob.locator("#executiveConversation video").evaluate(video=>video.paused && !video.autoplay && video.controls && video.playsInline)).toBe(true);
    await bob.locator("#executiveConversation video").evaluate(video=>{window.testVideo=video;video.muted=true;return video.play();});
    await expect.poll(()=>bob.locator("#executiveConversation video").evaluate(video=>video.currentTime)).toBeGreaterThan(0);
    await alice.locator("#executiveMessageInput").fill("動画の再生中に受信");await alice.locator("#executiveMessageForm button[type=submit]").click();
    await expect(bob.locator("#executiveConversation")).toContainText("動画の再生中に受信",{timeout:20000});
    expect(await bob.evaluate(()=>document.querySelector("#executiveConversation video")===window.testVideo)).toBe(true);
    await bob.screenshot({path:fileURLToPath(new URL("../../../.local-tests/inline-previews.png",import.meta.url))});
    } else {
      await expect(bob.locator(".executive-attachment-fallback")).toContainText("この端末ではプレビューできません",{timeout:30000});
      await expect(bob.locator(".executive-attachment-fallback a[download]")).toHaveAttribute("download","動画プレビュー.mp4");
    }
    await bob.locator("#executiveCloseButton").click();
    await expect(bob.locator("#executiveMessageView")).toBeHidden();await expect(bob.locator("#executiveConversation")).toBeEmpty();
    if(supportsVideo)expect(await bob.evaluate(()=>window.testVideo.paused && !window.testVideo.hasAttribute("src"))).toBe(true);
    await bob.locator("#testUnlock button").click();
    await expect(bob.locator("#executiveConversation")).toContainText("暗号化ブラウザ試験の文字",{timeout:30000});
    await expect(bob.locator("#executivePeerVerificationPanel")).toBeHidden();
    await expect(bob.locator("#executiveRecoveryPanel")).toBeHidden();
    await bob.reload();await bob.locator("#testUser").selectOption("bob");await bob.locator("#testUnlock button").click();
    await expect(bob.locator("#executiveConversation")).toContainText("試験.txt",{timeout:30000});
    await expect(bob.locator("#executiveConversation")).toContainText("ブラウザからの返信",{timeout:30000});
    await bob.evaluate(()=>{Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});document.dispatchEvent(new Event("visibilitychange"));});
    await expect(bob.locator("#executiveMessageView")).toBeHidden();await expect(bob.locator("#executiveVerificationCode")).toBeEmpty();
    await expect(bob.locator("#appView")).toBeVisible();
  } finally {await first.close();await second.close();}
});

