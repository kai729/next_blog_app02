import { test, expect } from "@playwright/test";

test("記事一覧ページが正しく表示される", async ({ page }) => {
  await page.goto("/");

  // 見出しを確認
  await expect(page.getByText("記事一覧")).toBeVisible();

  // ボタンをテキストで確認（安定）
  await expect(page.getByText("🔍 検索")).toBeVisible();
  await expect(page.getByText("新規作成")).toBeVisible();

  // PostCard が存在するか（例: 最初の1件）
  const firstCard = page.locator("article");
  await expect(firstCard.first()).toBeVisible();
});
