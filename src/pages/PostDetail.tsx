import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import remarkGfm from "remark-gfm";
import { fetchPost, fetchComments, postComment, updateComment, deleteComment } from "../api/posts";
import { useDeletePost } from "../hooks/usePosts";

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
import ReactMarkdown from "react-markdown";
import CodeBlockWithCopy from "../components/CodeBlockWithCopy";
import styles from "./PostDetail.module.css";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { mutateAsync: deletePost, isPending } = useDeletePost();
  const queryClient = useQueryClient();

  const [authorName, setAuthorName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [editingComment, setEditingComment] = useState<null | {
    id: number;
    author_name: string;
    body: string;
  }>(null);

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
    refetch: refetchComments,
  } = useQuery({
    queryKey: ["comments", post?.id],
    queryFn: () => fetchComments(post!.id),
    enabled: !!post?.id,
  });

  const handleDelete = async () => {
    const confirmed = window.confirm("本当に削除してもよろしいですか？");
    if (!confirmed || !post) return;

    try {
      await deletePost(post.id);
      setOpen(true);
      setTimeout(() => navigate("/"), 1500);
    } catch {
      alert("削除に失敗しました");
    }
  };

  const handleCommentSubmit = async () => {
    if (!authorName || !commentBody || !post?.id) return;

    try {
      await postComment(post.id, { author_name: authorName, body: commentBody });
      setAuthorName("");
      setCommentBody("");
      await queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
    } catch {
      alert("コメントの投稿に失敗しました");
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !post?.id) return;

    try {
      await updateComment(post.id, editingComment.id, {
        author_name: editingComment.author_name,
        body: editingComment.body,
      });
      setEditingComment(null);
      await queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
    } catch {
      alert("コメントの更新に失敗しました");
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
      <Paper
        elevation={3}
        sx={{
          p: 4,
          my: 4,
          width: "100%",
          mx: "auto",
          backgroundColor: "#fce4ec",
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          {post.title}
        </Typography>

        {post.thumbnail_url && (
          <Box sx={{ mb: 2 }}>
            <img src={post.thumbnail_url} alt="サムネイル画像" style={{ maxWidth: "100%", borderRadius: "8px" }} />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ whiteSpace: "pre-wrap", mb: 4 }}>
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

        {post.tags?.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
            {post.tags.map((tag, idx) => (
              <Box
                key={idx}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  border: "1px solid #1976d2",
                  borderRadius: "16px",
                  color: "#1976d2",
                  fontSize: "0.8rem",
                }}
              >
                {tag}
              </Box>
            ))}
          </Box>
        )}

        {/* コメントセクション */}
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            コメント
          </Typography>

          {isCommentsLoading ? (
            <Typography>読み込み中...</Typography>
          ) : isCommentsError ? (
            <Typography color="error">コメントの取得に失敗しました</Typography>
          ) : (
            <Stack spacing={1.5} mt={2}>
              {comments.map(({ id, author_name, body, createdAt }) => (
                <Paper key={id} sx={{ p: 2, position: "relative", borderRadius: 2 }}>
                  <Typography variant="subtitle2">{author_name}</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 1 }}>
                    {body}
                  </Typography>
                  <Typography variant="caption" sx={{ position: "absolute", bottom: 8, right: 8 }}>
                    {new Date(createdAt).toLocaleString()}
                  </Typography>
                  <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                    <IconButton size="small" onClick={() => setEditingComment({ id, author_name, body })}>
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

          {/* コメント投稿フォーム */}
          <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              コメントを投稿する
            </Typography>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleCommentSubmit();
              }}
            >
              <TextField
                label="名前"
                fullWidth
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="コメント"
                fullWidth
                multiline
                minRows={3}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" fullWidth>
                投稿
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* 編集ダイアログ */}
        <Dialog open={!!editingComment} onClose={() => setEditingComment(null)} fullWidth maxWidth="sm">
          <DialogTitle>コメントを編集</DialogTitle>
          <DialogContent>
            <TextField
              label="名前"
              fullWidth
              margin="normal"
              value={editingComment?.author_name || ""}
              onChange={(e) => setEditingComment((prev) => prev && { ...prev, author_name: e.target.value })}
            />
            <TextField
              label="コメント"
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={editingComment?.body || ""}
              onChange={(e) => setEditingComment((prev) => prev && { ...prev, body: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingComment(null)}>キャンセル</Button>
            <Button onClick={handleUpdateComment} variant="contained">
              保存
            </Button>
          </DialogActions>
        </Dialog>

        {/* 投稿操作ボタン */}
        <Stack direction="row" spacing={2} mt={6} justifyContent="flex-end">
          <MotionButton
            variant="contained"
            color="info"
            startIcon={<Edit />}
            component={Link}
            to={`/posts/${post.id}/edit`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            編集する
          </MotionButton>

          <MotionButton
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={isPending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPending ? "削除中..." : "削除する"}
          </MotionButton>
        </Stack>

        <Box mt={4}>
          <Button component={Link} to="/" color="inherit">
            ← 戻る
          </Button>
        </Box>
      </Paper>

      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: "100%" }}>
          削除が完了しました！
        </Alert>
      </Snackbar>
    </MotionBox>
  );
};

export default PostDetail;
