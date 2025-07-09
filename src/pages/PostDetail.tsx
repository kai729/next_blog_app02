import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPost, fetchComments, postComment, updateComment, deleteComment } from "../api/posts";
import { useDeletePost } from "../hooks/usePosts";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import CodeBlockWithCopy from "../components/CodeBlockWithCopy";
import styles from "./PostDetail.module.css";

import {
  Paper,
  Typography,
  Divider,
  Stack,
  Snackbar,
  Alert,
  Box,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutateAsync: deletePost, isPending } = useDeletePost();

  const [commentForm, setCommentForm] = useState({ authorName: "", body: "" });
  const [editingComment, setEditingComment] = useState<null | { id: number; author_name: string; body: string }>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const {
    data: post,
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useQuery({
    queryKey: ["comments", post?.id],
    queryFn: () => fetchComments(post!.id),
    enabled: !!post?.id,
  });

  const resetForm = () => {
    setCommentForm({ authorName: "", body: "" });
    setEditingComment(null);
  };

  const handleDeletePost = async () => {
    if (!post || !window.confirm("本当に削除しますか？")) return;

    try {
      await deletePost(post.id);
      setSnackbarOpen(true);
      setTimeout(() => navigate("/"), 1500);
    } catch {
      alert("削除に失敗しました");
    }
  };

  const handleSubmitComment = async () => {
    if (!post?.id || !commentForm.authorName || !commentForm.body) return;

    try {
      if (editingComment) {
        await updateComment(post.id, editingComment.id, {
          author_name: commentForm.authorName,
          body: commentForm.body,
        });
      } else {
        await postComment(post.id, {
          author_name: commentForm.authorName,
          body: commentForm.body,
        });
      }
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
    } catch {
      alert("コメントの送信に失敗しました");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!post?.id || !window.confirm("このコメントを削除しますか？")) return;

    try {
      await deleteComment(post.id, commentId);
      await queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
    } catch {
      alert("コメントの削除に失敗しました");
    }
  };

  if (isLoading) return <Typography>読み込み中...</Typography>;
  if (isError || !post) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">
          {error instanceof Error ? error.message : "記事の読み込みに失敗しました。"}
        </Typography>
        <Button variant="outlined" onClick={() => refetch()} sx={{ mt: 2 }}>
          再試行
        </Button>
      </Box>
    );
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ px: 2, py: 4 }}
    >
      <Paper elevation={3} className="post-detail" sx={{ p: 4, my: 4, width: "100%", mx: "auto" }}>
        {/* ===== 投稿タイトル・画像 ===== */}
        <Typography variant="h4" gutterBottom color="primary" className="post-detail__title">
          {post.title}
        </Typography>

        {post.thumbnail_url && (
          <Box sx={{ mb: 2 }} className="post-detail__thumbnail">
            <img src={post.thumbnail_url} alt="サムネイル画像" style={{ maxWidth: "100%", borderRadius: "8px" }} />
          </Box>
        )}

        <Divider sx={{ my: 3 }} className="post-detail__divider" />

        {/* ===== 本文 ===== */}
        <Box sx={{ whiteSpace: "pre-wrap", mb: 4 }} className="post-detail__body">
          <div className={styles.markdownWrapper}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const codeString = String(children).trim();
                  return inline ? (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ) : (
                    <CodeBlockWithCopy code={codeString} />
                  );
                },
                img({ ...props }) {
                  return (
                    <img
                      {...props}
                      style={{ maxWidth: "100%", borderRadius: "8px", margin: "16px 0" }}
                      alt={props.alt || "画像"}
                    />
                  );
                },
              }}
            >
              {post.body}
            </ReactMarkdown>
          </div>
        </Box>

        {/* ===== タグ表示 ===== */}
        {post.tags?.length > 0 && (
          <Box className="comment-tags">
            {post.tags.map((tag, idx) => (
              <Box key={idx} className="comment-tag-item">
                {tag}
              </Box>
            ))}
          </Box>
        )}

        {/* ===== コメント一覧 ===== */}
        <Box mt={6} className="comment-list">
          <Typography variant="h5" gutterBottom className="comment-list__title">
            コメント
          </Typography>
          {isCommentsLoading ? (
            <Typography className="comment-list__loading">読み込み中...</Typography>
          ) : isCommentsError ? (
            <Typography color="error" className="comment-list__error">
              コメントの取得に失敗しました
            </Typography>
          ) : (
            <Stack spacing={1.5} mt={2} className="comment-list__items">
              {comments.map(({ id, author_name, body, createdAt }) => (
                <Paper key={id} sx={{ p: 2, position: "relative", borderRadius: 2 }} className="comment-list__item">
                  <Typography variant="subtitle2" className="comment-list__author">
                    {author_name}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 1 }} className="comment-list__body">
                    {body}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ position: "absolute", bottom: 8, right: 8 }}
                    className="comment-list__created"
                  >
                    {new Date(createdAt).toLocaleString()}
                  </Typography>
                  <Box sx={{ position: "absolute", top: 8, right: 8 }} className="comment-list__actions">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingComment({ id, author_name, body });
                        setCommentForm({ authorName: author_name, body }); // ←これ追加
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteComment(id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>

        {/* ===== コメントフォーム ===== */}
        <Paper variant="outlined" className="comment-form" sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom className="comment-form__title">
            コメントを{editingComment ? "編集" : "投稿"}する
          </Typography>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitComment();
            }}
            className="comment-form__form"
          >
            <TextField
              label="名前"
              fullWidth
              value={commentForm.authorName}
              onChange={(e) => setCommentForm((prev) => ({ ...prev, authorName: e.target.value }))}
              className="comment-form__field"
              sx={{ mb: 2 }}
            />
            <TextField
              label="コメント"
              fullWidth
              multiline
              minRows={3}
              value={commentForm.body}
              onChange={(e) => setCommentForm((prev) => ({ ...prev, body: e.target.value }))}
              className="comment-form__field"
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth className="comment-form__submit">
              {editingComment ? "更新" : "投稿"}
            </Button>
          </Box>
        </Paper>

        {/* ===== 投稿操作ボタン ===== */}
        <Stack direction="row" spacing={2} mt={6} justifyContent="flex-end" className="post-detail__actions">
          <MotionButton
            variant="contained"
            color="info"
            startIcon={<Edit />}
            component={Link}
            to={`/posts/${post.id}/edit`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="post-detail__edit-btn"
          >
            編集する
          </MotionButton>

          <MotionButton
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeletePost}
            disabled={isPending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="post-detail__delete-btn"
          >
            {isPending ? "削除中..." : "削除する"}
          </MotionButton>
        </Stack>

        {/* ===== 戻るリンク ===== */}
        <Box mt={4} className="post-detail__back-link">
          <Button component={Link} to="/" color="inherit">
            ← 戻る
          </Button>
        </Box>
      </Paper>

      {/* ===== 削除完了トースト ===== */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
          削除が完了しました！
        </Alert>
      </Snackbar>
    </MotionBox>
  );
};

export default PostDetail;
