import {buildPushPayload} from "@block65/webcrypto-web-push";
import {Failure} from "../free-probe/worker.mjs";
const decode = text => Uint8Array.from(atob(text.replace(/-/g,"+").replace(/_/g,"/")), c=>c.charCodeAt(0));
export function pushConfiguration(env) {
  try {
    const keys=JSON.parse(env.FREE_PUSH_VAPID||"null");
    if(!keys || !/^[A-Za-z0-9_-]{87}$/.test(keys.publicKey) || !/^[A-Za-z0-9_-]{43}$/.test(keys.privateKey) ||
      typeof keys.subject!=="string" || !/^(mailto:|https:\/\/)/.test(keys.subject)) return null;
    return keys;
  } catch {return null;}
}
export async function validateSubscription(value) {
  try {
    if(!value || typeof value.endpoint!=="string" || value.endpoint.length>2048) throw Error();
    const url=new URL(value.endpoint),host=url.hostname;
    // Only the browser vendors' push services; never fetch caller-selected hosts or redirects.
    if(url.protocol!=="https:" || url.username || url.password || url.port || url.hash ||
      !(host==="fcm.googleapis.com" || host==="web.push.apple.com" || host.endsWith(".push.apple.com") ||
        host==="updates.push.services.mozilla.com" || host.endsWith(".push.services.mozilla.com"))) throw Error();
    if(!/^[A-Za-z0-9_-]{87}$/.test(value.keys?.p256dh||"") || !/^[A-Za-z0-9_-]{22}$/.test(value.keys?.auth||"")) throw Error();
    const raw=decode(value.keys.p256dh);if(raw[0]!==4) throw Error();
    await crypto.subtle.importKey("raw",raw,{name:"ECDH",namedCurve:"P-256"},false,[]);
    return {endpoint:url.href,keys:{p256dh:value.keys.p256dh,auth:value.keys.auth}};
  } catch {throw new Failure(400,"invalid_push_subscription");}
}
export async function deliverPush(subscription,env,io=fetch) {
  const keys=pushConfiguration(env);if(!keys) return "unconfigured";
  try {
    // This payload contains no message, sender, room, event ID, filename or authorization grant.
    // Display text is fixed by the SHiCI service worker, independently of payload data.
    const payload=await buildPushPayload({data:{},options:{ttl:3600,urgency:"normal",topic:"shici-notice"}},subscription,keys);
    const response=await io(subscription.endpoint,{...payload,redirect:"manual",signal:AbortSignal.timeout(10000)});
    await response.body?.cancel();
    return response.status===404 || response.status===410 ? "expired" : response.ok ? "accepted" : "failed";
  } catch {return "failed";}
}
