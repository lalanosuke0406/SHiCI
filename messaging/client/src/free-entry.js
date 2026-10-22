export function createPrivateClient(onEvent) {
  const worker=new Worker(new URL("./free-worker.js",import.meta.url),{type:"module"});
  let next=0,closed=false;const pending=new Map();
  worker.onmessage=({data})=>{if(closed)return;if(data.id){const request=pending.get(data.id);if(!request)return;pending.delete(data.id);data.error?request.reject(Error(data.error)):request.resolve(data.result);}else onEvent(data);};
  worker.onerror=()=>{if(!closed){const error=Error("通信の準備を完了できませんでした。");for(const request of pending.values())request.reject(error);pending.clear();onEvent({type:"error",message:error.message});}};
  return {request(action,payload={}){if(closed)return Promise.reject(Error("画面は閉じられています。"));const id=++next;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});worker.postMessage({id,action,payload});});},
    close(){if(closed)return;closed=true;worker.terminate();for(const request of pending.values())request.reject(Error("画面は閉じられています。"));pending.clear();}};
}
