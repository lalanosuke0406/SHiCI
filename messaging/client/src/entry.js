// The SDK and all Matrix credentials live in a dedicated worker. Termination
// abandons pending decryptions/requests and prevents late UI updates after lock.
export function createPrivateClient(onEvent) {
  const worker = new Worker(new URL("./matrix-worker.js", import.meta.url), {type: "module"});
  const pending = new Map();
  let sequence = 0;
  let closed = false;
  worker.onmessage = ({data}) => {
    if (closed) return;
    if (data.id) {
      const request = pending.get(data.id);
      if (!request) return;
      pending.delete(data.id);
      if (data.error) request.reject(new Error(data.error));
      else request.resolve(data.result);
    } else onEvent(data);
  };
  worker.onerror = () => {
    if (!closed) onEvent({type: "error", message: "接続処理を開始できませんでした。"});
  };
  return {
    request(action, payload = {}) {
      if (closed) return Promise.reject(new Error("画面は閉じられています。"));
      const id = ++sequence;
      return new Promise((resolve, reject) => {
        pending.set(id, {resolve, reject});
        worker.postMessage({id, action, payload});
      });
    },
    close() {
      if (closed) return;
      closed = true;
      worker.terminate();
      for (const request of pending.values()) request.reject(new Error("画面は閉じられています。"));
      pending.clear();
    }
  };
}
