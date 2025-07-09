import { test, expect } from "@playwright/test";

test("新規投稿ページで投稿が完了する", async ({ page }) => {
  await page.goto("http://localhost:5173/posts/new");

  await page.getByLabel("タイトル").fill("Playwright テスト投稿");
  await page.getByLabel("本文").fill("これはPlaywrightから投稿された内容です。");

  await page.getByRole("button", { name: "投稿" }).click();

  // 投稿成功トーストを確認
  await expect(page.getByText("投稿が完了しました！")).toBeVisible();

  // 遷移まで明示的に待機
  await page.waitForTimeout(2000);

  // 遷移後のページで確認
  await expect(page).toHaveURL(/\/posts\/\d+$/);
  await expect(page.getByText("Playwright テスト投稿")).toBeVisible();
});
