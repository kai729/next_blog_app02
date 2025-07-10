const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");

const postsRouter = require("./routes/posts");
const archivesRouter = require("./routes/archives");

const app = express();

// ====== ミドルウェア ======
app.use(cors());
app.use(compression());
app.use(express.json());

// ====== APIルーティング（上に持ってくる！） ======
app.use("/api/posts/archives", archivesRouter);
app.use("/api/posts", postsRouter);

// ====== フロントエンド（Viteビルド成果物） ======
app.use(express.static(path.join(__dirname, "../dist")));

// ====== SPAルーティング対応（React Router 用） ======
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// ====== サーバー起動 ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
