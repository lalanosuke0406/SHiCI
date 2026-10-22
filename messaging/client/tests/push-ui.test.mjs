import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFile} from "node:fs/promises";
const code=await readFile(new URL("../../../frontend/js/ExecutivePrivateController.js",import.meta.url),"utf8");
const publicKey=Buffer.concat([Buffer.from([4]),Buffer.alloc(64,1)]).toString("base64url");
function fixture(){
  const nodes=new Map(),calls=[];let subscription=null;
  const get=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,disabled:false,textContent:"",value:"",replaceChildren(){},querySelectorAll(){return [];}});return nodes.get(id);};
  const notification={permission:"default",requestPermission(){calls.push("permission");notification.permission="granted";return Promise.resolve("granted");}};
  const registration={pushManager:{getSubscription:async()=>subscription,subscribe:async options=>{
    calls.push("subscribe");subscription={options,toJSON:()=>({endpoint:"https://fcm.googleapis.com/fixture",keys:{p256dh:publicKey,auth:"A".repeat(22)}}),unsubscribe:async()=>{calls.push("unsubscribe");subscription=null;return true;}};return subscription;
  }}};
  const context=vm.createContext({document:{hidden:false,getElementById:get},window:{Notification:notification,PushManager:{}},Notification:notification,
    navigator:{serviceWorker:{ready:Promise.resolve(registration)}},atob,URL:{revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){},lockExecutiveMessageBestEffort(){}});
  vm.runInContext(code,context);
  context.testClient={close(){},async request(action,payload){calls.push(action);return action==="pushConfiguration"?{configured:true,publicKey,subscribed:false}:{subscribed:action==="registerPush"};}};
  vm.runInContext('executiveSessionToken="fixture";executiveConfiguration={provider:"cloudflare"};executiveClient=testClient;',context);
  return {context,calls,get,notification};
}
test("push opt-in starts from a user gesture, displays state and can be stopped",async()=>{
  const s=fixture();await s.context.ExecutiveMessageController_refreshPush();
  assert.deepEqual(s.calls,["pushConfiguration"]);assert.equal(s.get("executiveFreePushButton").textContent,"通知を有効にする");
  const pending=s.context.ExecutiveMessageController_togglePush();assert.equal(s.calls.at(-1),"permission");await pending;
  assert.deepEqual(s.calls,["pushConfiguration","permission","subscribe","registerPush"]);
  assert.equal(s.get("executiveFreePushButton").textContent,"通知を停止する");
  await s.context.ExecutiveMessageController_togglePush();assert.deepEqual(s.calls.slice(-2),["disablePush","unsubscribe"]);
  assert.equal(s.get("executiveFreePushButton").textContent,"通知を有効にする");
});
test("closing while the permission prompt is open never registers a late subscription",async()=>{
  const s=fixture();await s.context.ExecutiveMessageController_refreshPush();let resolve;
  s.notification.requestPermission=()=>new Promise(done=>{resolve=done;});
  const pending=s.context.ExecutiveMessageController_togglePush();s.context.ExecutiveMessageController_emergencyClose();resolve("granted");await pending;
  assert.deepEqual(s.calls,["pushConfiguration"]);assert.equal(s.get("executiveMessageView").hidden,true);
});
test("denied permission does not subscribe or register",async()=>{
  const s=fixture();await s.context.ExecutiveMessageController_refreshPush();s.notification.requestPermission=async()=>"denied";
  await s.context.ExecutiveMessageController_togglePush();assert.deepEqual(s.calls,["pushConfiguration"]);
  assert.match(s.get("executiveStatus").textContent,/通知が許可されていません/);
});
