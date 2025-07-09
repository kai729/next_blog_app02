const express = require("express");
const router = express.Router();
const db = require("../db");

// GET 全記事取得（ページネーション対応）
router.get("/", (req, res) => {
  console.time("\ud83d\udce5 GET /posts");

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countQuery = `SELECT COUNT(*) AS total FROM posts`;
  const dataQuery = `
  SELECT 
    posts.*, 
    GROUP_CONCAT(tags.name) AS tags
  FROM posts
  LEFT JOIN post_tags ON posts.id = post_tags.post_id
  LEFT JOIN tags ON post_tags.tag_id = tags.id
  GROUP BY posts.id
  ORDER BY createdAt DESC
  LIMIT ? OFFSET ?
`;

  db.get(countQuery, [], (err, countResult) => {
    if (err) {
      console.error("DB\u30a8\u30e9\u30fc\uff08count\uff09:", err);
      console.timeEnd("\ud83d\udce5 GET /posts");
      return res
        .status(500)
        .json({ error: "\u8a18\u4e8b\u6570\u306e\u53d6\u5f97\u306b\u5931\u6557\u3057\u307e\u3057\u305f" });
    }

    const totalItems = countResult.total;
    const totalPages = Math.ceil(totalItems / limit);

    db.all(dataQuery, [limit, offset], (err, rows) => {
      console.timeEnd("📥 GET /posts");
      if (err) {
        console.error("DBエラー（data）:", err);
        return res.status(500).json({ error: "記事の取得に失敗しました" });
      }

      const formattedPosts = rows.map((post) => ({
        ...post,
        tags: post.tags ? post.tags.split(",").filter(Boolean) : [],
      }));

      res.json({
        posts: formattedPosts,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
        },
      });
    });
  });
});

// GET 単一記事取得（タグも取得）
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      posts.*, 
      GROUP_CONCAT(tags.name) AS tags
    FROM posts
    LEFT JOIN post_tags ON posts.id = post_tags.post_id
    LEFT JOIN tags ON post_tags.tag_id = tags.id
    WHERE posts.id = ?
    GROUP BY posts.id
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error("DB\u30a8\u30e9\u30fc:", err);
      return res
        .status(500)
        .json({ error: "\u8a18\u4e8b\u306e\u53d6\u5f97\u306b\u5931\u6557\u3057\u307e\u3057\u305f" });
    }
    if (!row) {
      return res.status(404).json({ error: "\u8a18\u4e8b\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093" });
    }
    const post = {
      ...row,
      tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
    };
    res.json(post);
  });
});

// POST 新規記事作成（タグも登録）
// POST 新規記事作成（タグも登録）
router.post("/", async (req, res) => {
  const { title, body, tags, thumbnail_url } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: "タイトルと本文は必須です" });
  }

  const query = `
  INSERT INTO posts (title, body, thumbnail_url, createdAt, updatedAt)
  VALUES (?, ?, ?, datetime('now'), datetime('now'))
`;

  db.run(query, [title, body, thumbnail_url], async function (err) {
    if (err) {
      console.error("DBエラー:", err);
      return res.status(500).json({ error: "投稿の作成に失敗しました" });
    }

    const postId = this.lastID;

    try {
      if (tags && tags.length > 0) {
        await Promise.all(
          tags.map((tag) => {
            return new Promise((resolve, reject) => {
              db.get(`SELECT id FROM tags WHERE name = ?`, [tag], (err, row) => {
                if (err) return reject(err);

                if (row) {
                  db.run(`INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`, [postId, row.id], (err) => {
                    if (err) return reject(err);
                    resolve();
                  });
                } else {
                  db.run(`INSERT INTO tags (name) VALUES (?)`, [tag], function (err) {
                    if (err) return reject(err);

                    db.run(`INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`, [postId, this.lastID], (err) => {
                      if (err) return reject(err);
                      resolve();
                    });
                  });
                }
              });
            });
          })
        );
      }

      res.status(201).json({
        id: postId,
        title,
        body,
        tags,
        thumbnail_url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("タグ保存エラー:", error);
      res.status(500).json({ error: "タグの保存に失敗しました" });
    }
  });
});

// PUT 記事更新（タグも更新）
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, body, tags, thumbnail_url } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: "\u30bf\u30a4\u30c8\u30eb\u3068\u672c\u6587\u306f\u5fc5\u9808\u3067\u3059" });
  }

  const query = `
  UPDATE posts
  SET title = ?, body = ?, thumbnail_url = ?, updatedAt = datetime('now')
  WHERE id = ?
`;

  db.run(query, [title, body, thumbnail_url, id], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ error: "\u8a18\u4e8b\u306e\u66f4\u65b0\u306b\u5931\u6557\u3057\u307e\u3057\u305f" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "\u8a18\u4e8b\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093" });
    }

    db.run(`DELETE FROM post_tags WHERE post_id = ?`, [id], () => {
      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          db.get(`SELECT id FROM tags WHERE name = ?`, [tag], (err, row) => {
            if (err) return;

            if (row) {
              db.run(`INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`, [id, row.id]);
            } else {
              db.run(`INSERT INTO tags (name) VALUES (?)`, [tag], function (err) {
                if (!err) {
                  db.run(`INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`, [id, this.lastID]);
                }
              });
            }
          });
        });
      }
    });

    res.json({ message: "記事が更新されました", id, title, body, tags, thumbnail_url });
  });
});

// DELETE 記事削除
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM posts WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error("DB\u30a8\u30e9\u30fc:", err);
      return res
        .status(500)
        .json({ error: "\u8a18\u4e8b\u306e\u524a\u9664\u306b\u5931\u6557\u3057\u307e\u3057\u305f" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "\u8a18\u4e8b\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093" });
    }
    res.status(204).send();
  });
});

// コメント一覧取得
router.get("/:id/comments", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM comments WHERE post_id = ? ORDER BY createdAt DESC`;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error("コメント取得エラー:", err);
      return res.status(500).json({ error: "コメントの取得に失敗しました" });
    }
    res.json(rows);
  });
});

// コメントを投稿
router.post("/:id/comments", async (req, res) => {
  const postId = req.params.id;
  const { author_name, body } = req.body;

  if (!author_name || !body) {
    return res.status(400).json({ error: "名前と本文は必須です" });
  }

  try {
    const stmt = await db.prepare(
      "INSERT INTO comments (post_id, author_name, body, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))"
    );
    const result = await stmt.run(postId, author_name, body);
    const comment = await db.get("SELECT * FROM comments WHERE id = ?", result.lastID);
    res.status(201).json(comment);
  } catch (err) {
    console.error("コメント保存失敗:", err);
    res.status(500).json({ error: "コメントの保存に失敗しました" });
  }
});

// コメント削除
router.delete("/comments/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM comments WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error("コメント削除エラー:", err);
      return res.status(500).json({ error: "コメントの削除に失敗しました" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "コメントが見つかりません" });
    }

    res.status(204).send(); // No Content
  });
});

// コメント編集API（PUT）
router.put("/:postId/comments/:commentId", (req, res) => {
  const { postId, commentId } = req.params;
  const { author_name, body } = req.body;

  const query = `
    UPDATE comments
    SET author_name = ?, body = ?, updatedAt = datetime('now')
    WHERE id = ? AND post_id = ?
  `;

  db.run(query, [author_name, body, commentId, postId], function (err) {
    if (err) {
      console.error("コメント更新エラー:", err);
      return res.status(500).json({ message: "コメントの更新に失敗しました" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "コメントが見つかりません" });
    }

    return res.json({ message: "コメントを更新しました" });
  });
});

module.exports = router;
