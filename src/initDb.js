const db = require("./db");

const createPostsTable = `
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

function initDb() {
  db.run(createPostsTable, (err) => {
    if (err) {
      console.error("Failed to create posts table:", err);
    } else {
      console.log("Posts table is ready");
    }
  });
}

module.exports = initDb;
