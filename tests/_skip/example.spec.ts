// tests/example.spec.ts
import { test, expect } from "@playwright/test";

test("トップページが表示される", async ({ page }) => {
  await page.goto("/");
  // タイトル要素に合わせて調整
  await expect(page).toHaveTitle(/modern_my-blog_app/);
  // "記事一覧" の見出しが表示されているか
  await expect(page.getByRole("heading", { name: "記事一覧" })).toBeVisible();
  // "新規記事作成" ボタンがあるか
  await expect(page.getByRole("link", { name: "新規記事作成" })).toBeVisible();
});
