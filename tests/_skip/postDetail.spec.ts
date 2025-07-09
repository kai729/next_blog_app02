import { test, expect } from "@playwright/test";

test("詳細ページが正しく表示され、削除ボタンが動作する", async ({ page }) => {
  // 1. テスト用投稿を作成する
  const testPostTitle = "Playwright 詳細テスト用";
  const testPostBody = "これは詳細ページ表示テスト用の本文です";

  await page.goto("http://localhost:5173/posts/new");
  await page.getByLabel("タイトル").fill(testPostTitle);
  await page.getByLabel("本文").fill(testPostBody);
  await page.getByRole("button", { name: "投稿" }).click();

  // 2. 投稿後のリダイレクトとトースト通知
  await page.waitForURL("**/posts/**", { timeout: 10000 });
  await expect(page.getByText("投稿が完了しました")).toBeVisible();

  // 3. 詳細ページにタイトルが表示されているか確認
  await expect(page.getByText(testPostTitle)).toBeVisible({ timeout: 10000 });

  // 4. 編集ボタンの検出（data-testid経由）
  const editButton = page.getByTestId("edit-button");
  await expect(editButton).toBeVisible({ timeout: 10000 });

  // 5. 削除ボタン押下とダイアログ処理
  page.once("dialog", (dialog) => dialog.accept());
  const deleteButton = page.getByTestId("delete-button");
  await deleteButton.click();

  // 6. 削除完了トーストの表示確認
  await expect(page.getByText("削除が完了しました！")).toBeVisible({ timeout: 5000 });

  // 7. 一覧ページに戻っていることを確認
  await page.waitForURL("http://localhost:5173/", { timeout: 10000 });
  await expect(page.getByRole("heading", { name: "記事一覧" })).toBeVisible();
});
