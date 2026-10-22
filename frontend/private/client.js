//#region src/entry.js
function e(e) {
	let t = new Worker(new URL(
		/* @vite-ignore */
		new URL("assets/matrix-worker-mJ8GMpZf.js", import.meta.url).href,
		"" + import.meta.url
	), { type: "module" }), n = /* @__PURE__ */ new Map(), r = 0, i = !1;
	return t.onmessage = ({ data: t }) => {
		if (!i) {
			if (t.id) {
				let e = n.get(t.id);
				if (!e) return;
				n.delete(t.id), t.error ? e.reject(Error(t.error)) : e.resolve(t.result);
			} else e(t);
		}
	}, t.onerror = () => {
		i || e({
			type: "error",
			message: "接続処理を開始できませんでした。"
		});
	}, {
		request(e, a = {}) {
			if (i) return Promise.reject(/* @__PURE__ */ Error("画面は閉じられています。"));
			let o = ++r;
			return new Promise((r, i) => {
				n.set(o, {
					resolve: r,
					reject: i
				}), t.postMessage({
					id: o,
					action: e,
					payload: a
				});
			});
		},
		close() {
			if (!i) {
				i = !0, t.terminate();
				for (let e of n.values()) e.reject(/* @__PURE__ */ Error("画面は閉じられています。"));
				n.clear();
			}
		}
	};
}
//#endregion
export { e as createPrivateClient };
