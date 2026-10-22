# SHiCI内の暗号化メッセージ（無料構成）

2026-10-22、VS Codeで使用するこのリポジトリへ統合。
通常のGoogleログインと業務画面を維持し、役員の隠し入口を通過した後に同一画面で開く。
文字・添付のE2EE、初回の端末登録と相手鍵照合、リアルタイム受信を実装。
初期版は1ユーザー1ブラウザ。複数端末・復旧キーは後続対応。

現在の制限・実装・試験・Cloudflare設定は [messaging/free/README.md](messaging/free/README.md) を参照。
添付1件5MiB、検証用の全体利用量上限あり。本番のスマートフォン実機試験は未完了。

## 統合した範囲

- backend/02_ActionRouter.js：旧平文送信と旧Push APIを停止。
- backend/83_ExecutiveMessageSessionEngine.js：既存の役員確認後に通信設定を返す。
- backend/86_ExecutiveMessengerGateway.js：役員と会話相手の権限を検査し、15分の署名付き許可証を発行。
- frontend：隠し画面、暗号化Worker、添付、即時表示、背景移行・伏せ検知による閉鎖。
- messaging/client：ブラウザ用のソース・ビルド・試験。frontend/privateへビルド済み。
- messaging/free、free-probe：Workerの本体、設定と結合試験。

元の作業ツリーはmain、b2e07ccで、未コミット変更なし。統合時点ではgit commit・git push・clasp pushを実行していない。
.clasp.json、既存の認証設定、通常業務のコードは今回変更していない。
秘密の値、ローカルMatrixの実アカウント・DB・鍵、node_modulesはコピーしていない。
古いExecutiveMessageController.jsは保持するが、新index.htmlからは読み込まない。

## 反映前に必要な設定

GASスクリプトプロパティ：
- EXECUTIVE_MESSENGER_PROVIDER=cloudflare（切替時に設定）
- EXECUTIVE_FREE_API_URL=WorkerのHTTPSルートURL
- EXECUTIVE_FREE_AUTH_SECRET=WorkerのFREE_AUTH_SECRETと同じ値
- EXECUTIVE_FREE_USERS_JSON=SHiCIのuserIdからmember_a、member_bへの対応表

秘密の値をこのリポジトリへ記載しない。Googleログインのキーや設定を置き換えない。
CloudflareはENABLE_FREE_MESSENGER=falseのまま準備。APPLICATIONとATTACHMENTSの接続済み。
FREE_AUTH_SECRETとFREE_USERS_JSONは利用者が管理画面へ保存済み。実際の値の一致は本番接続試験で確認する。

## 反映時の注意

clasp pushの対象はrootDir=backend。スクリプトの保存内容を更新する操作であり、公開中のWebアプリの新バージョンへの更新は別途必要。
git pushはGitHubへ反映し、接続されたCloudflare Pagesの自動デプロイを開始する可能性がある。
フロント・公開GAS・設定の切替が揃うまで旧メッセージ画面と互換性はないため、2名の利用を止めて切替・試験する。
Cloudflareの有効化はソースと公開GASの反映後。既存の平文履歴は削除・移行していない。
戻す場合は、GASの前の公開バージョン、Pagesの前のデプロイ、GASの変更前プロパティを組み合わせて戻す。Workerはfalseへ戻す。

## 検証

統合先でGASゲートウェイ、権限制限、旧API停止、画面閉鎖、Service Workerに関する12件のNode試験が成功。
変更JSの構文検査とgit diff --checkも成功。
元の改修フォルダーでは、実Rust暗号・MiniflareとChromiumで双方向文字、暗号化添付、再読込後の履歴、背景移行を確認済み。
統合先では依存パッケージのインストールやスマートフォン実機試験はまだ実施していない。
