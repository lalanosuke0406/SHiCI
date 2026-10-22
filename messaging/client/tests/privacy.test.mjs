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
test("face-down is an absolute sustained orientation, not a baseline inversion",()=>{
  const s=state();vm.runInContext("executiveFaceDownSince=Date.now()-300",s.context);
  s.context.ExecutiveMessageController_handleDeviceMotion({accelerationIncludingGravity:{x:0,y:0,z:-9.8}});
  assert.equal(s.get("executiveMessageView").hidden,true);
  const up=state();up.context.ExecutiveMessageController_handleDeviceMotion({accelerationIncludingGravity:{x:0,y:0,z:9.8}});
  assert.equal(up.closed(),0);
});
