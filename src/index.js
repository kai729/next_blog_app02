const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");

const postsRouter = require("./routes/posts");
const archivesRouter = require("./routes/archives");

const app = express();

// CORS（開発時のみ）
app.use(cors());

// 圧縮
app.use(compression());

// JSON
app.use(express.json());

// ✅ ここで API を先に定義（重要）
app.use("/api/posts/archives", archivesRouter);
app.use("/api/posts", postsRouter);

// ✅ 本番環境でのみ静的ファイルを返すようにする（←これがローカルエラー防止）
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
