const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression"); // 追加
const postsRouter = require("./routes/posts");

const app = express();

// CORS（開発時のみ必要、本番は同一ドメインなので不要になる）
app.use(cors());

// 🔽 ここで compression を有効化
app.use(compression());

// JSONリクエストを受け取る
app.use(express.json());

// APIルーティング
app.use("/api/posts", postsRouter);

// =======================
// 🔽 ここから統合デプロイ対応
// =======================

// フロントエンドのビルド成果物（dist）を静的ファイルとして配信
app.use(express.static(path.join(__dirname, "../dist")));

// SPA対応：その他のルートは全てindex.htmlを返す（Reactのルーティング対応）
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// =======================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
