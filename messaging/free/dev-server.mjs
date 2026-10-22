// Local-only fixture issuer. Never deployed; no live GAS identity is used here.
import {Miniflare} from "miniflare";
import {randomBytes,createHmac} from "node:crypto";
import {fileURLToPath} from "node:url";
import {mkdir} from "node:fs/promises";
import {resolve,join} from "node:path";
import {startServer} from "../client/dev-server.mjs";
export async function startFreeServer({port=4173,apiPort=8787,stateRoot}={}) {
  const secret=randomBytes(32).toString("hex"),origin="http://localhost:"+port;
  stateRoot||=resolve(fileURLToPath(new URL("../../.local-tests/free-local/",import.meta.url)));
  await mkdir(stateRoot,{recursive:true});
  const mf=new Miniflare({modules:true,modulesRoot:fileURLToPath(new URL("../",import.meta.url)),
    scriptPath:fileURLToPath(new URL("worker.mjs",import.meta.url)),compatibilityDate:"2026-07-30",host:"127.0.0.1",port:apiPort,
    durableObjects:{APPLICATION:{className:"FreeApplication",useSQLite:true}},durableObjectsPersist:join(stateRoot,"do"),
    r2Buckets:["ATTACHMENTS"],r2Persist:join(stateRoot,"r2"),
    bindings:{ENABLE_FREE_MESSENGER:"true",FREE_AUTH_SECRET:secret,FREE_USERS_JSON:'["alice","bob"]',SHICI_ORIGIN:origin}});
  const api=await mf.ready;
  const server=startServer(port,{freeConfig:user=>{
    const peer=user==="alice"?"bob":"alice",exp=Math.floor(Date.now()/1000)+900;
    const body=Buffer.from(JSON.stringify({aud:"shici-free-v1",sub:user,peers:[peer],exp})).toString("base64url");
    const accessGrant=body+"."+createHmac("sha256",secret).update(body).digest("base64url");
    return {provider:"cloudflare",baseUrl:api.origin+"/",development:true,encryption:"required",userId:user,
      peers:[{userId:peer,displayName:peer}],accessGrant,expiresAt:exp*1000,maxAttachmentBytes:5*1024*1024};
  }});
  return {server,mf,async close(){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await mf.dispose();}};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  await startFreeServer();console.log("無料版ローカル試験: http://localhost:4173/test.html（試験用入口・業務データ使用禁止）");
}
