import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFile} from "node:fs/promises";
const code = await readFile(new URL("../../../frontend/js/ExecutivePrivateController.js", import.meta.url), "utf8");
// Use a fresh context per test; no actual Matrix keys, tokens or browser state.
function state() {
  const nodes=new Map();let closed=0,stopped=0;const revoked=[];
  const get=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:"secret",textContent:"secret",checked:true,
    replaceChildren(){this.textContent="";},querySelectorAll(){return [];}});return nodes.get(id);};
  const context=vm.createContext({document:{hidden:false,getElementById:get},Date,Number,Boolean,Map,Set,
    URL:{revokeObjectURL:value=>revoked.push(value)},setTimeout:()=>1,clearTimeout(){},lockExecutiveMessageBestEffort(){},
    closeHook:()=>closed++,stopHook:()=>stopped++});
  vm.runInContext(code,context);
  vm.runInContext('executiveSessionToken="test";executiveClient={close:closeHook};executiveMediaStream={getTracks:()=>[{stop:stopHook}]};executiveObjectUrls.add("blob:secret");executivePending.set("x",{body:"secret"});',context);
  return {context,get,revoked,closed:()=>closed,stopped:()=>stopped};
}
test("lock hides immediately, destroys worker, stops media, revokes blob URLs and clears plaintext DOM",()=>{
  const s=state();s.context.ExecutiveMessageController_emergencyClose();
  assert.equal(s.get("executiveMessageView").hidden,true);assert.equal(s.get("appView").hidden,false);
  assert.equal(s.closed(),1);assert.equal(s.stopped(),1);assert.deepEqual(s.revoked,["blob:secret"]);
  for(const id of ["executiveGeneratedKey","executiveConversation","executivePeerList","executiveDeviceList","executiveStatus"])
    assert.equal(s.get(id).textContent,"");
  assert.equal(vm.runInContext("executivePending.size",s.context),0);
  assert.equal(vm.runInContext("executiveConfiguration",s.context),null);
});
test("late challenge result after a privacy boundary does not reopen the view",()=>{
  const s=state();const epoch=s.context.ExecutiveMessageController_getEpoch();s.context.ExecutiveMessageController_emergencyClose();
  s.context.ExecutiveMessageController_handleUnlocked(null,null,{executiveSessionToken:"late",messaging:{provider:"matrix"}},epoch);
  assert.equal(s.get("executiveMessageView").hidden,true);
});
test("only sustained screen-down orientation closes, in either rotation direction",()=>{
  for(const beta of [180,-180,160,-160]) {
    const s=state();let now=1000;s.context.Date={now:()=>now};
    for(const time of [1000,1100,1200]){now=time;s.context.ExecutiveMessageController_handleDeviceOrientation({beta,gamma:10});}
    assert.equal(s.closed(),0);now=1300;s.context.ExecutiveMessageController_handleDeviceOrientation({beta,gamma:10});assert.equal(s.closed(),1);
  }
});
test("face-up, upright and invalid readings never close",()=>{
  for(const event of [{beta:0,gamma:0},{beta:90,gamma:0},{beta:0,gamma:90},{beta:null,gamma:0},{beta:180,gamma:null},{beta:NaN,gamma:0}]){
    const s=state();let now=1000;s.context.Date={now:()=>now};
    for(const time of [1000,1100,1200,1300]){now=time;s.context.ExecutiveMessageController_handleDeviceOrientation(event);}assert.equal(s.closed(),0);
  }
});
test("face-up and gaps in readings restart the face-down dwell",()=>{
  const s=state();let now=1000;s.context.Date={now:()=>now};
  const turn=beta=>s.context.ExecutiveMessageController_handleDeviceOrientation({beta,gamma:0});
  turn(180);now=1100;turn(0);now=1200;turn(180);now=1300;turn(180);assert.equal(s.closed(),0);
  now=2000;turn(180);assert.equal(s.closed(),0);
  now=2100;turn(180);now=2200;turn(180);now=2300;turn(180);assert.equal(s.closed(),1);
});

test("orientation permission registers orientation events and denied permission stays disabled",async()=>{
  const s=state();let listener;
  s.context.DeviceOrientationEvent={requestPermission:async()=>"granted"};s.context.window={addEventListener:(type,fn)=>{listener={type,fn};}};
  await s.context.ExecutiveMessageController_enablePrivacySensor();assert.equal(listener.type,"deviceorientation");
  assert.equal(listener.fn,s.context.ExecutiveMessageController_handleDeviceOrientation);
  assert.equal(s.get("executivePrivacySensorButton").textContent,"伏せて閉じる：センサー待機中");
  listener.fn({beta:0,gamma:0});assert.equal(s.get("executivePrivacySensorButton").textContent,"伏せて閉じる：有効");
  const denied=state();denied.context.DeviceOrientationEvent={requestPermission:async()=>"denied"};
  denied.context.window={addEventListener:()=>assert.fail("denied sensor must not be registered")};
  await denied.context.ExecutiveMessageController_enablePrivacySensor();assert.equal(vm.runInContext("executiveSensorEnabled",denied.context),false);
});
