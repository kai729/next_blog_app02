import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./PostCreate.module.css";

const PostCreate = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!title || !content) {
      setError("タイトルと本文は必須です。");
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body: content }), // ← "body" に変更（一貫性のため）
      });

      if (res.ok) {
        const newPost = await res.json();
        setSuccess(true);
        setTimeout(() => navigate(`/posts/${newPost.id}`), 1200);
      } else {
        setError("記事の作成に失敗しました");
      }
    } catch (err) {
      setError("通信エラーが発生しました");
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <h1 className={styles.heading}>記事を作成</h1>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            key="success"
            className={styles.successMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            投稿が完了しました！リダイレクト中...
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>タイトル:</label>
          <input
            className={styles.input}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>本文:</label>
          <textarea className={styles.textarea} value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <motion.button
          type="submit"
          aria-label="作成" // ← 追加！
          className={styles.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          作成
        </motion.button>
      </form>
    </motion.div>
  );
};

export default PostCreate;
