# ローカル検証記録（2026-10-21）

新しいSHiCI内蔵UIの記録です。旧Element画面の検証とは区別します。

- Nodeテスト: ゲートウェイ等13件、専用UIの終了処理3件、公式Rust添付暗号化の往復・改ざん検出1件が成功。
- Chromiumブラウザ試験: 5件成功。通常画面でSDK未ロード、遅延応答の再表示防止、閉じる際の内容破棄、非表示・伏せる検出、添付プレビュー維持を確認。
- 上記5件には実際のローカルSynapseとMatrix SDKによる端末登録、鍵バックアップ、即時再開、別ブラウザ端末での復旧キー復元を含む。専用の一時テストアカウントを使用し、alice/bobの鍵・履歴は変更していない。
- 本番用ビルドと変更JavaScriptの構文確認が成功。

既存のalice/bob間での新UIによる全文・添付送受信、GASの実ユーザー認可経路、iPhone/Android実機、本番HTTPSは未検証。
画面を伏せたときのセンサー値・OSのアプリ切替画像は実機確認が必要。
本番への配置、サーバー契約、ドメイン取得は未実施。

ビルド済みSDKとRustライブラリのApache-2.0ライセンスは frontend/private/licenses/ に同梱。

## 2026-10-22：トーク内の画像・動画プレビュー

- `playwright.chrome.config.mjs` はインストール済みGoogle Chromeを使用。390×844の画面幅で、実Rust E2EEによるPNGとMP4の送受信、自動表示、動画の実再生、受信時の再生維持、閉鎖時の停止を確認。
- WebKitでも画像の自動表示・読み込み位置の制限・再試行・閉鎖後の遅延応答破棄を確認。Windowsのテスト用WebKitにはMP4デコーダーがないため、実データで判定し、保存リンクへの切替を検証する。
- canPlayTypeだけでは実際のデコーダー有無を確認できないため、試験用MP4のメタデータ読み込み結果で分岐する。Chromeでは再生を検証。
- ブラウザ試験はChrome 9件、WebKit 9件成功。関連Node試験12件も成功。
- 画像・動画は画面付近から復号してBlob URLで表示。永続的な平文メディアキャッシュは追加しない。表示の削除・相手の切替・画面終了でURLを破棄する。
- 再確認：`npx.cmd playwright test --config playwright.chrome.config.mjs`、`npx.cmd playwright test --config playwright.webkit.config.mjs`。各環境のPlaywrightブラウザが必要。
- MP4のCC0試験素材は `browser-tests/fixtures/README.md` に出典を記載し、公開frontendには含めない。実ユーザーの画像・動画を使用しない。
