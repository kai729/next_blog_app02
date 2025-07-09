import { test, expect } from "@playwright/test";

test("編集ページが正しく表示され、編集が成功する", async ({ page }) => {
  const testTitle = "Playwrightテスト用タイトル";
  const testBody = "これはテスト投稿の本文です。";
  const updatedTitle = "Playwright編集済みタイトル";
  const updatedBody = "これは編集された本文です。";

  // 1. 新規作成ページへ移動
  await page.goto("http://localhost:5173/posts/new");

  // 2. Suspenseが解けるまで確実に待つ（ラベルが表示されるまで）
  await expect(page.getByLabel("タイトル")).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel("本文")).toBeVisible();

  // 3. 入力して投稿作成
  await page.getByLabel("タイトル").fill(testTitle);
  await page.getByLabel("本文").fill(testBody);

  const createButton = page.getByRole("button", { name: "作成" });
  await expect(createButton).toBeVisible({ timeout: 5000 });
  await createButton.click();

  // 4. 投稿完了メッセージの確認
  await expect(page.getByText("投稿が完了しました！リダイレクト中...")).toBeVisible({ timeout: 5000 });

  // 5. 遷移後の詳細ページでタイトル表示確認
  await expect(page.getByRole("heading", { name: testTitle })).toBeVisible({ timeout: 10000 });

  // 6. URLから投稿IDを取得
  const url = page.url();
  const match = url.match(/\/posts\/(\d+)/);
  if (!match) throw new Error("投稿IDがURLから取得できませんでした");
  const postId = match[1];

  // 7. 編集ページへ移動
  await page.goto(`http://localhost:5173/posts/${postId}/edit`);
  await expect(page.getByLabel("タイトル")).toBeVisible({ timeout: 5000 });
  await expect(page.getByLabel("本文")).toBeVisible();

  // 8. 編集して保存
  await page.getByLabel("タイトル").fill(updatedTitle);
  await page.getByLabel("本文").fill(updatedBody);
  const saveButton = page.getByRole("button", { name: "保存" });
  await expect(saveButton).toBeVisible();
  await saveButton.click();

  // 9. 成功メッセージ確認
  await expect(page.getByText("編集が完了しました！")).toBeVisible({ timeout: 5000 });

  // 10. 編集後の詳細ページ確認
  await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
  await expect(page.locator("p")).toContainText(updatedBody);
});
