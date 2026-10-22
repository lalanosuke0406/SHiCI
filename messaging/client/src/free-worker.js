import {FreeEngine} from "./free-engine.js";
let engine;
self.onmessage=async({data:{id,action,payload}})=>{
  try {
    if(action==="start" && !engine)engine=new FreeEngine(payload.config,event=>self.postMessage(event));
    if(!engine)throw Error("接続の準備ができていません。");
    const result=await engine.request(action,payload);self.postMessage({id,result});
  } catch(error) {self.postMessage({id,error:error instanceof Error?error.message:"暗号化処理を完了できませんでした。画面を開き直してください。"});}
};
