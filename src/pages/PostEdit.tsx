import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchPost } from "../api/posts";
import { useUpdatePost } from "../hooks/usePosts";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { TextField, Button, Box, Snackbar, Alert, Typography, CircularProgress } from "@mui/material";

const MotionButton = motion(Button);

const PostEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bodyFile, setBodyFile] = useState<File | null>(null);
  const [bodyUploading, setBodyUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setBody(post.body);
      setTags(post.tags?.join(", ") || "");
      setThumbnailUrl(post.thumbnail_url || "");
    }
  }, [post]);

  const { mutateAsync, isPending, error: submitError } = useUpdatePost(id!);

  // サムネイル用ファイル選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 本文用ファイル選択
  const handleBodyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBodyFile(e.target.files[0]);
    }
  };

  // サムネイルアップロード処理
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    setUploading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("アップロードに失敗しました");

      const data = await res.json();
      setThumbnailUrl(data.url);
      alert("サムネイル画像のアップロードが完了しました！");
    } catch (err) {
      console.error(err);
      alert("アップロードエラー");
    } finally {
      setUploading(false);
    }
  };

  // 本文用画像アップロード処理
  const handleBodyUpload = async () => {
    if (!bodyFile) return;

    const formData = new FormData();
    formData.append("image", bodyFile);

    setBodyUploading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("アップロードに失敗しました");

      const data = await res.json();

      // エディターに画像Markdown挿入
      setBody((prev) => `${prev}\n\n![アップロード画像](${data.url})\n\n`);
      alert("本文用画像のアップロードが完了しました！");
      setBodyFile(null);
    } catch (err) {
      console.error(err);
      alert("アップロードエラー");
    } finally {
      setBodyUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      await mutateAsync({ title, body, tags: tagArray, thumbnail_url: thumbnailUrl });
      setOpen(true);
      setTimeout(() => navigate(`/posts/${id}`), 1500);
    } catch {
      // エラーは submitError に出る
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !post) {
    return (
      <Box sx={{ color: "error.main", textAlign: "center", py: 4 }}>
        <Typography>{error instanceof Error ? error.message : "記事の読み込みに失敗しました。"}</Typography>
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        記事を編集
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError instanceof Error ? submitError.message : "保存に失敗しました。"}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <TextField
          id="title-input"
          name="title"
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
        />

        <MDEditor value={body} onChange={(value) => setBody(value || "")} />

        <Typography variant="h6">本文用画像アップロード</Typography>
        <input type="file" accept="image/*" onChange={handleBodyFileChange} />
        <Button variant="outlined" onClick={handleBodyUpload} disabled={!bodyFile || bodyUploading} sx={{ ml: 2 }}>
          {bodyUploading ? "アップロード中..." : "アップロード"}
        </Button>

        <TextField
          id="tags-input"
          name="tags"
          label="タグ（カンマ区切り）"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          fullWidth
        />

        <Typography variant="h6">サムネイル画像アップロード</Typography>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <Button variant="outlined" onClick={handleUpload} disabled={!selectedFile || uploading} sx={{ ml: 2 }}>
          {uploading ? "アップロード中..." : "アップロード"}
        </Button>

        {thumbnailUrl && (
          <Box sx={{ mt: 2, position: "relative", display: "inline-block" }}>
            <Typography>サムネイル画像プレビュー:</Typography>
            <img
              src={thumbnailUrl}
              alt="サムネイル"
              style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
            />
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => setThumbnailUrl("")}
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                minWidth: "auto",
                px: 1,
                py: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </Button>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2 }}>
          <MotionButton
            variant="contained"
            color="primary"
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isPending}
          >
            {isPending ? "保存中..." : "保存"}
          </MotionButton>

          <MotionButton
            variant="outlined"
            color="inherit"
            type="button"
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            キャンセル
          </MotionButton>
        </Box>
      </Box>

      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: "100%" }}>
          編集が完了しました！
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default PostEdit;
