//#region src/free-entry.js
function e(e) {
	let t = new Worker(new URL(
		/* @vite-ignore */
		new URL("assets/free-worker-B2ifLvl8.js", import.meta.url).href,
		"" + import.meta.url
	), { type: "module" }), n = 0, r = !1, i = /* @__PURE__ */ new Map();
	return t.onmessage = ({ data: t }) => {
		if (!r) {
			if (t.id) {
				let e = i.get(t.id);
				if (!e) return;
				i.delete(t.id), t.error ? e.reject(Error(t.error)) : e.resolve(t.result);
			} else e(t);
		}
	}, t.onerror = () => {
		if (!r) {
			let t = Error("通信の準備を完了できませんでした。");
			for (let e of i.values()) e.reject(t);
			i.clear(), e({
				type: "error",
				message: t.message
			});
		}
	}, {
		request(e, a = {}) {
			if (r) return Promise.reject(Error("画面は閉じられています。"));
			let o = ++n;
			return new Promise((n, r) => {
				i.set(o, {
					resolve: n,
					reject: r
				}), t.postMessage({
					id: o,
					action: e,
					payload: a
				});
			});
		},
		close() {
			if (!r) {
				r = !0, t.terminate();
				for (let e of i.values()) e.reject(Error("画面は閉じられています。"));
				i.clear();
			}
		}
	};
}
//#endregion
export { e as createPrivateClient };
