require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const postsRouter = require("./src/routes/posts");
const app = express();

// ✅ CORSをルートやJSONパースより前に設定
const allowedOrigins = ["https://next-blog-app02.onrender.com", "http://localhost:5173"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

//画像アップロードAPI
const uploadRouter = require("./src/routes/upload");
app.use("/api/upload", uploadRouter);

// server.js
const archivesRouter = require("./src/routes/archives");

app.use("/api/archives", archivesRouter);

// ===== その他ミドルウェア =====
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' https://next-blog-app02.onrender.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; script-src 'self'"
  );
  next();
});

// ===== API & 静的ファイル =====
app.use("/api/posts", postsRouter);
app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
});

// ===== エラーハンドリング =====
app.use((err, req, res, next) => {
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    res.status(403).json({ message: "CORSエラー: 不正なオリジンです" });
  } else {
    next(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const commentsRouter = require("./src/routes/posts");
app.use("/api/posts", commentsRouter);
