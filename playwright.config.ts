// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests", // テストファイルのディレクトリ
  testIgnore: ["**/_skip/**"], // 👈 これで _skip 内は完全スキップ
  timeout: 30 * 1000, // 各テストのタイムアウト（30秒）
  retries: 0, // テストのリトライ回数（本番で使うなら設定）
  use: {
    baseURL: "http://localhost:5173", // ← 開発中のローカルアプリのURLに合わせてね
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});
