import {test, expect} from "@playwright/test";
import {readFile} from "node:fs/promises";
import {createHmac, randomBytes} from "node:crypto";
import {startServer} from "../dev-server.mjs";
let server;
test.beforeAll(()=>{server=startServer(4173);});
test.afterAll(()=>server.close());
test("real Matrix SDK: device crypto, encrypted backup, local resume and new-device recovery",async({browser})=>{
  test.skip(process.env.SHICI_LOCAL_MATRIX_TEST!=="1","opt-in local server test");
  test.setTimeout(180000);
  const settings=JSON.parse(await readFile(new URL("../../generated/homeserver.yaml",import.meta.url),"utf8"));
  expect(settings.public_baseurl).toBe("http://localhost:8008/");
  const username="shici_probe_"+randomBytes(5).toString("hex"), password=randomBytes(24).toString("base64url");
  const nonce=await fetch("http://localhost:8008/_synapse/admin/v1/register").then(r=>r.json());
  const mac=createHmac("sha1",settings.registration_shared_secret).update([nonce.nonce,username,password,"notadmin"].join("\0")).digest("hex");
  const registration=await fetch("http://localhost:8008/_synapse/admin/v1/register",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({nonce:nonce.nonce,username,password,admin:false,mac})});
  expect(registration.status).toBe(200);
  const config={provider:"matrix",homeserverUrl:"http://localhost:8008/",development:true,encryption:"required",userId:"@"+username+":matrix.localhost",peers:[]};
  const contexts=[];
  async function open(context){
    const page=await context.newPage();await page.goto("http://localhost:4173/test.html");
    await page.evaluate(config=>{window.testConfiguration=config;},config);
    await page.locator("#testUnlock button").click();
    await expect(page.locator("#executiveLoginForm")).toBeVisible({timeout:20000});
    await page.locator("#executiveLoginPassword").fill(password);
    await page.locator("#executiveLoginForm button").click();
    await expect(page.locator("#executiveRecoveryPanel")).toBeVisible({timeout:60000});
    return page;
  }
  try{
    const first=await browser.newContext();contexts.push(first);const page=await open(first);
    await page.locator("#executiveGenerateRecovery").click();
    await expect(page.locator("#executiveGeneratedKey")).not.toBeEmpty({timeout:20000});
    const key=await page.locator("#executiveGeneratedKey").textContent();
    // Never persist the key in a screenshot, trace, or an error snapshot.
    await page.evaluate(()=>document.getElementById("executiveGeneratedKey").textContent="試験用キー取得済み");
    await page.locator("#executiveRecoverySaved").check();
    await page.locator("#executiveRecoveryPassword").fill(password);
    await page.locator("#executiveRecoveryForm button[type=submit]").click();
    await expect(page.locator("#executiveChatPanel")).toBeVisible({timeout:60000});
    await page.locator("#executiveCloseButton").click();
    await page.locator("#testUnlock button").click();
    try { await expect(page.locator("#executiveChatPanel")).toBeVisible({timeout:15000}); }
    catch { throw new Error("Resume status: "+await page.locator("#executiveStatus").textContent()); }
    await expect(page.locator("#executiveLoginForm")).toBeHidden();
    const second=await browser.newContext();contexts.push(second);const restored=await open(second);
    await restored.locator("#executiveRecoveryInput").fill(key);
    await restored.locator("#executiveRecoveryForm button[type=submit]").click();
    await expect(restored.locator("#executiveChatPanel")).toBeVisible({timeout:60000});
    await expect(restored.locator("#executiveRecoveryInput")).toHaveValue("");
  }finally{for(const context of contexts)await context.close();}
});
