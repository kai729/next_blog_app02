import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCreatePost } from "../hooks/usePosts";
import { Box, TextField, Typography, Snackbar, Alert, Button } from "@mui/material";
import { Link } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import styles from "./PostDetail.module.css";

const MotionButton = motion(Button);

const PostNew = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreatePost();

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [bodyImageFile, setBodyImageFile] = useState<File | null>(null);
  const [uploadingBodyImage, setUploadingBodyImage] = useState(false);

  // サムネイル選択
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  // サムネイルアップロード
  const handleUploadThumbnail = async () => {
    if (!thumbnailFile) return;

    const formData = new FormData();
    formData.append("image", thumbnailFile);

    setUploadingThumbnail(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("アップロードに失敗しました");

      const data = await res.json();
      setThumbnailUrl(data.url);
      alert("サムネイルのアップロードが完了しました！");
    } catch (err) {
      console.error(err);
      alert("アップロードエラー");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // 本文画像選択
  const handleBodyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBodyImageFile(e.target.files[0]);
    }
  };

  // 本文画像アップロード
  const handleUploadBodyImage = async () => {
    if (!bodyImageFile) return;

    const formData = new FormData();
    formData.append("image", bodyImageFile);

    setUploadingBodyImage(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("アップロードに失敗しました");

      const data = await res.json();
      setContent((prev) => `${prev}\n\n![アップロード画像](${data.url})\n\n`);
      alert("本文画像のアップロードが完了しました！");
    } catch (err) {
      console.error(err);
      alert("アップロードエラー");
    } finally {
      setUploadingBodyImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("タイトルと本文は必須です。");
      return;
    }

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      const newPost = await mutateAsync({
        title,
        body: content,
        tags: tagArray,
        thumbnail_url: thumbnailUrl,
      });
      setOpen(true);
      setTimeout(() => navigate(`/posts/${newPost.id}`), 1500);
    } catch (err) {
      console.error(err);
      setError("投稿エラーが発生しました。");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="post-create"
    >
      <Typography variant="h4" component="h1" gutterBottom className="post-create__title">
        新規投稿
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} className="post-create__error">
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        className="post-create__form"
      >
        <TextField
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
          className="post-create__title-input"
        />

        <MDEditor value={content} onChange={(value) => setContent(value || "")} className="post-create__md-editor" />

        <TextField
          label="タグ（カンマ区切り）"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="React, TypeScript, UI"
          fullWidth
          className="post-create__tags-input"
        />

        <Typography variant="h6" className="post-create__subtitle">
          サムネイル画像アップロード
        </Typography>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} className="post-create__file" />
        <Button
          variant="outlined"
          onClick={handleUploadThumbnail}
          disabled={!thumbnailFile || uploadingThumbnail}
          className="post-create__thumb-btn"
        >
          {uploadingThumbnail ? "アップロード中..." : "アップロード"}
        </Button>

        {thumbnailUrl && (
          <Box sx={{ mt: 2 }} className="post-create__thumb-preview">
            <Typography>アップロード済みサムネイル:</Typography>
            <img src={thumbnailUrl} alt="サムネイル画像" style={{ maxWidth: "100%", height: "auto" }} />
          </Box>
        )}

        <Typography variant="h6" className="post-create__subtitle">
          本文画像アップロード
        </Typography>
        <input type="file" accept="image/*" onChange={handleBodyImageChange} className="post-create__file" />
        <Button
          variant="outlined"
          onClick={handleUploadBodyImage}
          disabled={!bodyImageFile || uploadingBodyImage}
          className="post-create__bodyimg-btn"
        >
          {uploadingBodyImage ? "アップロード中..." : "本文に挿入"}
        </Button>

        <MotionButton
          variant="contained"
          color="primary"
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isPending}
          className="post-create__submit-btn"
        >
          {isPending ? "投稿中..." : "投稿"}
        </MotionButton>

        <Link to="/" className="post-create__back-link">
          ← 戻る
        </Link>
      </Box>

      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: "100%" }}>
          投稿が完了しました！
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default PostNew;
