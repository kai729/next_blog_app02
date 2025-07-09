// const sqlite3 = require("sqlite3").verbose();
// const path = require("path");

// // データベースファイルのパス（プロジェクト直下に database.sqlite を作る）
// const dbPath = path.resolve(__dirname, "../database.sqlite");

// // DB接続（ファイルがなければ自動で作成される）
// const db = new sqlite3.Database(dbPath, (err) => {
//   if (err) {
//     console.error("Failed to connect to database", err);
//   } else {
//     console.log("Connected to SQLite database:", dbPath);
//   }
// });

// module.exports = db;

// const sqlite3 = require("sqlite3").verbose();

// const db = new sqlite3.Database("./database.sqlite", (err) => {
//   if (err) console.error(err.message);
//   else console.log("Connected to SQLite database");
// });

// db.serialize(() => {
//   db.run(
//     `
//     CREATE TABLE IF NOT EXISTS posts (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       title TEXT NOT NULL,
//       body TEXT NOT NULL,
//       createdAt TEXT DEFAULT (datetime('now')),
//       updatedAt TEXT DEFAULT (datetime('now'))
//     )
//   `,
//     (err) => {
//       if (err) {
//         console.error("テーブル作成エラー:", err.message);
//       } else {
//         console.log("posts テーブルが確認・作成されました");
//       }
//     }
//   );
// });

// module.exports = db;

//2
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);
});

module.exports = db;
