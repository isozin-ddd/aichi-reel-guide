# Next Stop Nagoya

**How to get around Nagoya — we'll show you.**
訪日外国人向けの愛知県旅行ガイド（英語）。Astro による完全静的サイトで、Cloudflare Pages にデプロイします。

- Astro 7 / TypeScript / Tailwind CSS 4 / Leaflet（/map のみ）/ Lucide
- データは `src/content/` の JSON（Astro Content Collections + Zod で検証）
- サーバー・DB・認証なし。GitHub に push → Cloudflare Pages が自動ビルド

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー（サンプルスポットも表示） |
| `npm run build` | 本番ビルド → `dist/` |
| `npm run check` | 型チェック（astro check） |
| `npm test` | ユニットテスト（動画URL解析・公開ルール・全コンテンツのスキーマ検証） |
| `npm run test:dist` | ビルド成果物の検査（draft/sample が出ていないか、title/description/canonical 等） |
| `npm run verify` | 上記すべてを順に実行（CI と同じ） |
| `npm run images` | プレースホルダーのイラストを再生成 |

## Cloudflare Pages の設定

- Framework preset: Astro ／ Build command: `npm run build` ／ Output: `dist`
- Node: `.nvmrc`（22）を使用。必要なら環境変数 `NODE_VERSION=22`
- 環境変数（`.env.example` 参照）

| 変数 | 用途 |
| --- | --- |
| `SITE_URL` | サイトの公開URL（canonical / og:url / og:image / sitemap / robots.txt）。未設定時は `https://aichi-reel-guide.ghj87vy8mm.workers.dev` |
| `PUBLIC_CF_ANALYTICS_TOKEN` | Cloudflare Web Analytics（Cookie なし）。空なら読み込まない |
| `PUBLIC_MAP_TILE_URL` / `PUBLIC_MAP_TILE_ATTRIBUTION` / `PUBLIC_MAP_TILE_MAX_ZOOM` | 地図タイル提供元とクレジット |
| `PUBLIC_CONTACT_EMAIL`, `PUBLIC_SOCIAL_INSTAGRAM` 等 | 連絡先・運営者SNS（フッター/About） |
| `INCLUDE_SAMPLE_CONTENT` | **Preview 環境だけ** `true` にするとサンプルを表示。Production では設定しない |

> **地図タイルについて**：既定値は OpenStreetMap 標準タイルです。OSM の[タイル利用規約](https://operations.osmfoundation.org/policies/tiles/)は大量アクセスの本番利用を想定していないため、公開前に利用規約上問題のない提供元（MapTiler、Stadia Maps、Thunderforest など）に切り替え、そのクレジットを `PUBLIC_MAP_TILE_ATTRIBUTION` に設定してください。

## スポットを追加する

1. 画像を `src/assets/spots/` に置く（自分で撮影したもの、またはライセンスが明確なもののみ）
2. `src/content/spots/<slug>.json` を作成（ファイル名と `slug` は一致させる）。既存のサンプルをコピーすると早いです
3. `npm test` でスキーマ検証 → push

ルール（スキーマとテストで強制しています）：

- **不明な情報は `null`**。住所・営業時間・料金を推測で書かない。`null` の項目は画面に表示されません
- `traveler_info` の各項目は `true` / `false` / `null`
- `last_verified_at` は実際に確認した日付（YYYY-MM-DD）
- `draft: true` はどの環境でもビルドされない
- `is_sample: true` は本番ビルドに含まれない（名前は架空かつ末尾 `(Sample)` 必須）
- 動画は `permission` が `granted` か `own` のものだけ表示。`pending` は表示されない
- 動画URLは https のみ。Instagram（reel / p）、TikTok（`/@user/video/<id>`）、YouTube（shorts / youtu.be / watch）に対応。対応外のURLはリンクカードで表示

## 動画の表示方式

- 初期表示は軽量なプレビューカードのみ（外部サイトへの通信なし）
- タップで公式の埋め込み iframe を読み込み（YouTube は youtube-nocookie.com）
- 15秒以内に読み込めない・オフライン等の場合は元投稿へのリンクカードに切り替え
- 動画ファイルのダウンロード・保存は行いません

## 現状について

- **公開時点では本番にスポットが0件**です（サンプルは本番に出さないルールのため）。トップ・一覧・エリア・カテゴリ・地図には「準備中」表示が出ます。実在スポットのJSONを追加すると自動で反映されます
- 画像は `scripts/generate-illustrations.mjs` で生成したオリジナルのイラストです（クレジット: Illustration: Next Stop Nagoya）。実写真に差し替える場合は同じパスに置くか JSON のパスを変更してください
