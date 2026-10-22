import {OlmMachine,UserId,DeviceId,RoomId,RequestType,EncryptionSettings,EncryptionAlgorithm,CollectStrategy,
  LocalTrust,DeviceLists,DecryptionSettings,TrustRequirement,Attachment,EncryptedAttachment,initAsync} from "@matrix-org/matrix-sdk-crypto-wasm";
import * as vault from "./vault.js";
const DOMAIN="shici-free.invalid",encoder=new TextEncoder();
const identity=user=>`@${user}:${DOMAIN}`;
const hex=bytes=>Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,"0")).join("");
const digest=async bytes=>hex(await crypto.subtle.digest("SHA-256",bytes));
function b64(bytes) {let result="";for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(result);}
const unb64=text=>Uint8Array.from(atob(text),character=>character.charCodeAt(0));
const errorMessages={upload_busy:"添付の送信が混み合っています。少し待って再試行してください。",device_already_registered:"このユーザーは別の端末に登録済みです。鍵を上書きせず管理者へ確認してください。",
  device_changed:"登録された端末の鍵が異なります。送受信を停止しました。",identity_changed:"登録された本人の鍵が変わっています。送受信を停止しました。",
  invalid_grant:"利用時間が終了しました。通常画面から確認をやり直してください。",invalid_device_proof:"端末の確認ができませんでした。送受信を停止しました。",
  peer_not_registered:"相手の端末がまだ登録されていません。",probe_quota:"検証環境の利用上限に達しました。データは自動削除しません。",
  not_configured:"接続先の設定が完了していません。",size_limit:"添付サイズの上限を超えています。",peer_denied:"この相手との通信は許可されていません。"};

export class FreeEngine {
  constructor(config,emit,dependencies={}) {
    const url=new URL(config.baseUrl);
    if(config.provider!=="cloudflare" || config.encryption!=="required" || url.pathname!=="/" || url.username || url.password || url.search || url.hash ||
      (url.protocol!=="https:" && !(config.development && ["localhost","127.0.0.1"].includes(url.hostname) && url.protocol==="http:"))) throw Error("接続設定を確認してください。");
    if(!/^[a-z0-9_-]{1,64}$/.test(config.userId) || !Array.isArray(config.peers) || config.peers.some(peer=>!/^[a-z0-9_-]{1,64}$/.test(peer.userId))) throw Error("利用ユーザーの設定を確認してください。");
    this.config=config;this.emit=emit;this.io=dependencies.fetch||globalThis.fetch.bind(globalThis);this.socketFactory=dependencies.socketFactory===undefined?((url)=>new WebSocket(url)):dependencies.socketFactory;
    this.vault=dependencies.vault||vault;this.memory=dependencies.memory||false;this.closed=false;this.chain=Promise.resolve();
    this.name=`free|${url.origin}|${config.userId}`;this.messages=new Map();this.cursors=new Map();this.reconnectDelay=1000;
  }
  request(action,payload={}) {
    const task=this.chain.catch(()=>{}).then(()=>{
      if(this.closed) throw Error("画面は閉じられています。");
      const actions={start:()=>this.start(payload),selectPeer:()=>this.selectPeer(payload.peerId),confirmPeer:()=>this.confirmPeer(payload),
        older:()=>this.history(true),sendText:()=>this.sendText(payload),sendFile:()=>this.sendFile(payload),download:()=>this.download(payload),
        devices:()=>([{id:this.record.deviceId,name:"登録したブラウザ",current:true,fingerprint:this.ownFingerprint}]),_sync:()=>this.syncAndRefresh()};
      if(!actions[action]) throw Error("この操作には対応していません。");return actions[action]();
    });
    this.chain=task;return task;
  }
  async api(path,{method="GET",data,binary,unsigned=false}={}) {
    if(this.closed) throw Error("画面は閉じられています。");
    const url=new URL(path,this.config.baseUrl);
    const bytes=binary ? new Uint8Array(binary) : data===undefined ? new Uint8Array() : encoder.encode(JSON.stringify(data));
    const headers={Authorization:"Bearer "+this.config.accessGrant};
    if(data!==undefined) headers["Content-Type"]="application/json";
    if(binary) headers["Content-Type"]="application/octet-stream";
    if(!unsigned) {
      const time=String(Date.now()),nonce=crypto.randomUUID(),hash=await digest(bytes);
      const signature=await this.machine.sign([method,url.pathname+url.search,time,nonce,hash].join("\n"));
      try {headers["X-Device-Signature"]=JSON.parse(signature.asJSON())[identity(this.config.userId)]["ed25519:"+this.record.deviceId];}
      finally {signature.free();}
      Object.assign(headers,{"X-Device-Id":this.record.deviceId,"X-Device-Time":time,"X-Device-Nonce":nonce});
    }
    const response=await this.io(url.toString(),{method,headers,body:bytes.length?bytes:undefined,cache:"no-store",redirect:"error"});
    if(!response.ok) {
      const code=await response.json().then(value=>value.error).catch(()=>"");
      throw Error(errorMessages[code]||"通信できませんでした。時間をおいて再試行してください。");
    }
    return response;
  }
  async json(path,options) {return (await this.api(path,options)).json();}
  async save() {await this.vault.saveDevice(this.name,this.record);}
  async start({accepted=false}={}) {
    if(this.ready) return {ready:true};
    if(this.machine) throw Error("端末の登録準備を完了できませんでした。画面を閉じて開き直してください。");
    this.record=await this.vault.loadDevice(this.name);
    const profile=await this.json("/profile",{unsigned:true});
    if(!this.record) {
      if(profile.registered) throw Error(errorMessages.device_already_registered);
      if(!accepted) return {registrationRequired:true};
      this.record={deviceId:hex(crypto.getRandomValues(new Uint8Array(16))).toUpperCase(),storeKey:b64(crypto.getRandomValues(new Uint8Array(32))),pins:{},outbox:{}};
      await this.save();
    }
    if(profile.registered && profile.deviceId!==this.record.deviceId) throw Error(errorMessages.device_already_registered);
    await initAsync();
    const storeName="shici-free-"+await digest(encoder.encode(this.name+"|"+this.record.deviceId));
    this.machine=await OlmMachine.initialize(new UserId(identity(this.config.userId)),new DeviceId(this.record.deviceId),this.memory?undefined:storeName,this.memory?undefined:this.record.storeKey);
    this.ownFingerprint=this.machine.identityKeys.ed25519.toBase64();
    if(this.record.fingerprint && this.record.fingerprint!==this.ownFingerprint) throw Error("端末内の鍵を確認できません。登録された鍵は上書きしません。");
    this.record.fingerprint=this.ownFingerprint;await this.save();
    await this.flush();
    const signing=await this.machine.bootstrapCrossSigning(false);
    try {
      const upload=signing.uploadKeysRequest;
      if(upload) {try {await this.process(upload);} finally {upload.free();}}
      const keys=signing.uploadSigningKeysRequest;
      try {await this.json("/keys/signing",{method:"POST",data:JSON.parse(keys.body)});} finally {keys.free();}
      const signatures=signing.uploadSignaturesRequest;
      try {
        const response=await this.json("/keys/signatures",{method:"POST",data:JSON.parse(signatures.body)});
        if(signatures.id) await this.machine.markRequestAsSent(signatures.id,signatures.type,JSON.stringify(response));
      } finally {signatures.free();}
    } finally {signing.free();}
    // Import the published cross-signatures into the SDK's own device cache.
    // Uploading them alone leaves our sent Megolm events untrusted locally.
    const ownQuery=this.machine.queryKeysForUsers([new UserId(identity(this.config.userId))]);
    try {await this.process(ownQuery);} finally {ownQuery.free();}
    await this.flush();await this.inbox();
    if(!this.closed) await this.connectSocket();
    this.ready=true;
    return {ready:true,maxAttachmentBytes:this.config.maxAttachmentBytes||5*1024*1024};
  }
  async process(request) {
    const paths={[RequestType.KeysUpload]:"/keys/upload",[RequestType.KeysQuery]:"/keys/query",[RequestType.KeysClaim]:"/keys/claim",[RequestType.SignatureUpload]:"/keys/signatures"};
    let result;
    if(request.type===RequestType.ToDevice) {
      result=await this.json("/to-device",{method:"POST",data:{id:request.txn_id,type:request.event_type,...JSON.parse(request.body)}});
    } else {
      if(!paths[request.type]) throw Error("未対応の鍵要求のため処理を停止しました。");
      result=await this.json(paths[request.type],{method:"POST",data:JSON.parse(request.body)});
    }
    if(request.id) await this.machine.markRequestAsSent(request.id,request.type,JSON.stringify(result));
  }
  async flush() {
    for(let i=0;i<10;i++) {
      const requests=await this.machine.outgoingRequests();if(!requests.length)return;
      for(const request of requests) {try {await this.process(request);} finally {request.free();}}
    }
    throw Error("暗号化の準備が完了しませんでした。画面を開き直してください。");
  }
  async inbox() {
    for(let i=0;i<5;i++) {
      const data=await this.json("/inbox");
      this.oneTimeKeyCount=data.one_time_key_counts.signed_curve25519;this.unusedFallback=new Set(data.unused_fallback_key_types);
      const events=data.events.map(({type,sender,content})=>({type,sender,content}));
      await this.machine.receiveSyncChanges(JSON.stringify(events),new DeviceLists(),new Map(Object.entries(data.one_time_key_counts)),new Set(data.unused_fallback_key_types));
      if(events.length) await this.json("/inbox/ack",{method:"POST",data:{ids:data.events.map(event=>event.id)}});
      await this.flush();if(events.length<100)return;
    }
  }
  async peerKeys(peer) {
    await this.machine.updateTrackedUsers([new UserId(identity(peer))]);
    // An explicit query also notices a changed registration before sharing or displaying anything.
    const response=await this.json("/keys/query",{method:"POST",data:{device_keys:{[identity(peer)]:[],[identity(this.config.userId)]:[]}}});
    const devices=Object.values(response.device_keys[identity(peer)]||{});
    if(devices.length!==1) throw Error("相手の端末が未登録、または登録情報を確認できません。");
    await this.machine.receiveSyncChanges("[]",new DeviceLists([new UserId(identity(peer))]),new Map([["signed_curve25519",this.oneTimeKeyCount||0]]),this.unusedFallback);
    await this.flush();
    const device=devices[0],id=device.device_id,ed=device.keys["ed25519:"+id],curve=device.keys["curve25519:"+id];
    const known=await this.machine.getDevice(new UserId(identity(peer)),new DeviceId(id));
    if(!known || known.ed25519Key?.toBase64()!==ed || known.curve25519Key?.toBase64()!==curve) {known?.free();throw Error("相手の署名を確認できません。");}
    known.free();
    return {id,ed,curve};
  }
  async selectPeer(peer) {
    if(!this.config.peers.some(value=>value.userId===peer)) throw Error("許可された相手を選択してください。");
    this.peer=peer;this.room="!"+(await digest(encoder.encode([this.config.userId,peer].sort().join("~"))))+":"+DOMAIN;
    this.messages.clear();this.cursors.delete(peer);this.pendingConfirmation=null;
    const keys=await this.peerKeys(peer),pin=this.record.pins[peer];
    if(pin && (pin.id!==keys.id || pin.ed!==keys.ed || pin.curve!==keys.curve)) throw Error("相手の端末の鍵が変わっています。送受信を停止しました。");
    if(!pin) {
      const own={id:this.record.deviceId,ed:this.ownFingerprint,curve:this.machine.identityKeys.curve25519.toBase64()};
      const entries={[this.config.userId]:own,[peer]:keys};
      const code=(await digest(encoder.encode(Object.keys(entries).sort().map(id=>id+"|"+JSON.stringify(entries[id])).join("\n")))).toUpperCase().match(/.{4}/g).join(" ");
      this.pendingConfirmation={peer,keys,code};
      return {verificationRequired:true,code,roomId:this.room};
    }
    await this.trust(peer,keys);await this.syncAndRefresh();await this.retryOutbox();
    return {roomId:this.room};
  }
  async trust(peer,keys) {
    const device=await this.machine.getDevice(new UserId(identity(peer)),new DeviceId(keys.id));
    if(!device || device.ed25519Key?.toBase64()!==keys.ed || device.curve25519Key?.toBase64()!==keys.curve) {device?.free();throw Error("相手の端末の鍵を確認できません。");}
    try {await device.setLocalTrust(LocalTrust.Verified);} finally {device.free();}
  }
  async confirmPeer({code,peerId}) {
    const pending=this.pendingConfirmation;
    if(!pending || pending.peer!==peerId || pending.code!==code || this.peer!==peerId) throw Error("確認画面を開き直してください。");
    await this.trust(peerId,pending.keys);this.record.pins[peerId]=pending.keys;await this.save();this.pendingConfirmation=null;
    await this.syncAndRefresh();await this.retryOutbox();return {roomId:this.room};
  }
  requireRoom(roomId) {
    if(!this.peer || roomId!==this.room || !this.record.pins[this.peer]) throw Error("相手の端末を確認してから送信してください。");
  }
  async share() {
    this.requireRoom(this.room);
    // Registration is immutable. Keep using the explicitly pinned device; no automatic replacement.
    await this.trust(this.peer,this.record.pins[this.peer]);
    const claim=await this.machine.getMissingSessions([new UserId(identity(this.peer))]);
    if(claim) {try {await this.process(claim);} finally {claim.free();}}
    const settings=new EncryptionSettings();settings.algorithm=EncryptionAlgorithm.MegolmV1AesSha2;settings.sharingStrategy=CollectStrategy.onlyTrustedDevices();
    try {
      const requests=await this.machine.shareRoomKey(new RoomId(this.room),[new UserId(identity(this.peer))],settings);
      for(const request of requests) {try {await this.process(request);} finally {request.free();}}
    } finally {settings.free();}
  }
  async sendContent(content,transactionId) {
    this.requireRoom(this.room);
    const hash=await digest(encoder.encode(JSON.stringify(content)));
    let pending=this.record.outbox[transactionId];
    if(pending && (pending.peer!==this.peer || pending.hash!==hash)) throw Error("送信内容を確認できません。");
    if(!pending) {
      await this.share();
      const encrypted=JSON.parse(await this.machine.encryptRoomEvent(new RoomId(this.room),"m.room.message",JSON.stringify(content)));
      const ciphertext=b64(encoder.encode(JSON.stringify(encrypted)));
      pending={peer:this.peer,ciphertext,hash,sent:false};this.record.outbox[transactionId]=pending;
      const entries=Object.entries(this.record.outbox);
      if(entries.length>100) for(const [id,value] of entries) if(id!==transactionId && value.sent) {delete this.record.outbox[id];break;}
      if(Object.keys(this.record.outbox).length>100) throw Error("未送信のメッセージが多いため、接続を確認してください。");
      await this.save();
    }
    return this.postPrepared(transactionId);
  }
  async postPrepared(transactionId) {
    const pending=this.record.outbox[transactionId];
    if(!pending || pending.peer!==this.peer) throw Error("送信先を確認できません。");
    const event=await this.json(`/rooms/${this.peer}/events`,{method:"POST",data:{id:transactionId,ciphertext:pending.ciphertext}});
    pending.sent=true;await this.save();await this.decodeEvents([event]);this.publish();return {eventId:event.id};
  }
  async sendText({roomId,body,transactionId}) {
    this.requireRoom(roomId);if(typeof body!=="string" || !body.trim() || body.length>10000) throw Error("メッセージは1万文字以内にしてください。");
    return this.sendContent({msgtype:"m.text",body},transactionId);
  }
  async sendFile({roomId,file,transactionId}) {
    this.requireRoom(roomId);if(!file || file.size>(this.config.maxAttachmentBytes||5*1024*1024)) throw Error("添付は5MB以下にしてください。");
    if(this.record.outbox[transactionId]) return this.postPrepared(transactionId);
    await this.share();const encrypted=Attachment.encrypt(new Uint8Array(await file.arrayBuffer()));
    let data,info;try {data=encrypted.encryptedData;info=JSON.parse(encrypted.mediaEncryptionInfo);} finally {encrypted.free();}
    const {id}=await this.json(`/rooms/${this.peer}/attachments`,{method:"POST",binary:data});
    const mime=file.type||"application/octet-stream";
    return this.sendContent({msgtype:"m.file",body:file.name||"添付",file:{id,info,size:file.size,mime}},transactionId);
  }
  async decodeEvents(events) {
    const settings=new DecryptionSettings(TrustRequirement.CrossSigned);
    try {for(const event of events) {
      if(this.messages.has(event.id) && !this.messages.get(event.id).failedDecrypt) continue;
      let result;
      try {
        const sender=event.sender===this.config.userId ? {ed:this.ownFingerprint,curve:this.machine.identityKeys.curve25519.toBase64()} : this.record.pins[event.sender];
        if(!sender || ![this.peer,this.config.userId].includes(event.sender)) throw Error();
        const content=JSON.parse(new TextDecoder().decode(unb64(event.ciphertext)));
        result=await this.machine.decryptRoomEvent(JSON.stringify({type:"m.room.encrypted",sender:identity(event.sender),event_id:"$"+event.id,origin_server_ts:event.createdAt,content}),new RoomId(this.room),settings);
        if(result.senderClaimedEd25519Key!==sender.ed || result.senderCurve25519Key!==sender.curve) throw Error();
        const decoded=JSON.parse(result.event).content;
        if(typeof decoded.body!=="string" || !["m.text","m.file"].includes(decoded.msgtype)) throw Error();
        this.messages.set(event.id,{id:event.id,transactionId:event.id,roomId:this.room,timestamp:event.createdAt,mine:event.sender===this.config.userId,
          order:event.order,status:"sent",body:decoded.body,attachment:decoded.file?{name:decoded.body,mime:decoded.file.mime,size:decoded.file.size}:null,file:decoded.file});
      } catch {this.messages.set(event.id,{id:event.id,order:event.order,timestamp:event.createdAt,mine:event.sender===this.config.userId,status:"sent",body:"この端末では復号できません。相手の端末と鍵を確認してください。",failedDecrypt:true});}
      finally {result?.free();}
    }} finally {settings.free();}
  }
  publish() {this.emit({type:"messages",roomId:this.room,messages:[...this.messages.values()].sort((a,b)=>(a.order||a.timestamp)-(b.order||b.timestamp)).map(({file,...message})=>message)});}
  async history(older=false) {
    this.requireRoom(this.room);await this.inbox();
    const cursor=older?this.cursors.get(this.peer):null;
    let page=await this.json(`/rooms/${this.peer}/events`+(cursor?"?before="+encodeURIComponent(cursor):""));
    if(older || !this.cursors.has(this.peer)) this.cursors.set(this.peer,page.hasMore?page.before:null);
    const known=new Set(this.messages.keys());
    for(let count=0;count<20;count++) {
      const overlap=page.events.some(event=>known.has(event.id));
      await this.decodeEvents(page.events);
      if(older || !known.size || overlap || !page.hasMore) break;
      page=await this.json(`/rooms/${this.peer}/events?before=`+encodeURIComponent(page.before));
    }
    this.publish();return {hasMore:page.hasMore};
  }
  async retryOutbox() {
    for(const [id,item] of Object.entries(this.record.outbox)) if(item.peer===this.peer && !item.sent) {
      const event=await this.json(`/rooms/${this.peer}/events`,{method:"POST",data:{id,ciphertext:item.ciphertext}});
      item.sent=true;await this.save();await this.decodeEvents([event]);
    }
    this.publish();
  }
  async download({roomId,eventId}) {
    this.requireRoom(roomId);const message=this.messages.get(eventId),file=message?.file;
    if(!file || !/^[a-f0-9-]{36}$/.test(file.id) || file.size>(this.config.maxAttachmentBytes||5*1024*1024)) throw Error("添付情報を確認できません。");
    const response=await this.api(`/rooms/${this.peer}/attachments/${file.id}`),buffer=await response.arrayBuffer();
    if(buffer.byteLength>5*1024*1024) throw Error("添付の上限を超えています。");
    const encrypted=new EncryptedAttachment(new Uint8Array(buffer),JSON.stringify(file.info));
    try {return {data:Attachment.decrypt(encrypted),mime:String(file.mime||"application/octet-stream"),name:message.body};}
    finally {encrypted.free();}
  }
  async syncAndRefresh() {
    if(this.peer && this.record.pins[this.peer] && !this.pendingConfirmation) await this.history();else await this.inbox();
  }
  async connectSocket() {
    if(this.closed || !this.socketFactory)return;
    const {ticket}=await this.json("/socket-ticket",{method:"POST",data:{}});
    if(this.closed)return;
    const url=new URL("/stream?ticket="+encodeURIComponent(ticket),this.config.baseUrl);url.protocol=url.protocol==="https:"?"wss:":"ws:";
    const socket=this.socketFactory(url.toString());this.socket=socket;
    socket.onopen=()=>{this.reconnectDelay=1000;void this.request("_sync").catch(error=>this.emit({type:"error",message:error.message}));};
    socket.onmessage=()=>this.queueSync();
    socket.onclose=()=>{if(this.closed)return;this.reconnectTimer=setTimeout(()=>{void this.connectSocket().catch(error=>this.emit({type:"error",message:error.message}));},this.reconnectDelay);this.reconnectDelay=Math.min(15000,this.reconnectDelay*2);};
    socket.onerror=()=>{};
  }
  queueSync() {
    this.syncDirty=true;if(this.syncQueued || this.closed)return;this.syncQueued=true;
    void (async()=>{while(this.syncDirty && !this.closed){this.syncDirty=false;await this.request("_sync");}})()
      .catch(error=>{if(!this.closed)this.emit({type:"error",message:error.message});}).finally(()=>{this.syncQueued=false;});
  }
  close() {this.closed=true;clearTimeout(this.reconnectTimer);this.socket?.close();this.machine?.close();this.machine=null;this.messages.clear();this.record=null;}
}


