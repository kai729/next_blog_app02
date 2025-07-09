// src/routes/archives.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ 月別記事取得API
router.get("/month/:month", (req, res) => {
  const { month } = req.params;

  const query = `
    SELECT posts.*, GROUP_CONCAT(tags.name) AS tags
    FROM posts
    LEFT JOIN post_tags ON posts.id = post_tags.post_id
    LEFT JOIN tags ON post_tags.tag_id = tags.id
    WHERE strftime('%Y-%m', posts.createdAt) = ?
    GROUP BY posts.id
    ORDER BY createdAt DESC
  `;

  db.all(query, [month], (err, rows) => {
    if (err) {
      console.error("DBエラー（月別取得）:", err);
      return res.status(500).json({ error: "記事取得に失敗しました" });
    }

    const formattedPosts = rows.map((post) => ({
      ...post,
      tags: post.tags ? post.tags.split(",").filter(Boolean) : [],
    }));

    res.json(formattedPosts);
  });
});

// ✅ タグ別記事取得API
router.get("/tag/:tag", (req, res) => {
  const { tag } = req.params;

  const query = `
    SELECT posts.*, GROUP_CONCAT(tags.name) AS tags
    FROM posts
    JOIN post_tags ON posts.id = post_tags.post_id
    JOIN tags ON post_tags.tag_id = tags.id
    WHERE tags.name = ?
    GROUP BY posts.id
    ORDER BY createdAt DESC
  `;

  db.all(query, [tag], (err, rows) => {
    if (err) {
      console.error("DBエラー（タグ別取得）:", err);
      return res.status(500).json({ error: "記事取得に失敗しました" });
    }

    const formattedPosts = rows.map((post) => ({
      ...post,
      tags: post.tags ? post.tags.split(",").filter(Boolean) : [],
    }));

    res.json(formattedPosts);
  });
});

module.exports = router;

// 🔹 月別記事数一覧
router.get("/monthly", (req, res) => {
  const query = `
    SELECT strftime('%Y-%m', createdAt) AS month, COUNT(*) AS count
    FROM posts
    GROUP BY month
    ORDER BY month DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("DBエラー（月別集計）:", err);
      return res.status(500).json({ error: "月別集計に失敗しました" });
    }

    res.json(rows);
  });
});

// 🔹 タグ記事数一覧
router.get("/tags", (req, res) => {
  const query = `
    SELECT tags.name, COUNT(post_tags.post_id) AS count
    FROM tags
    JOIN post_tags ON tags.id = post_tags.tag_id
    GROUP BY tags.id
    ORDER BY count DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("DBエラー（タグ集計）:", err);
      return res.status(500).json({ error: "タグ集計に失敗しました" });
    }

    res.json(rows);
  });
});
