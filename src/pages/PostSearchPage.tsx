import React, { useMemo, useState } from "react";
import { usePosts } from "../hooks/usePosts";
import { Autocomplete, TextField, CircularProgress, Box, Typography } from "@mui/material";
import PostCard from "../components/PostCard";
import { Link } from "react-router-dom";
import styles from "./PostDetail.module.css";

const PostSearchPage = () => {
  const { posts, isLoading, isError, refetch } = usePosts();
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const options = useMemo(() => posts.map((p) => p.title), [posts]);
  const matchedPost = useMemo(() => posts.find((p) => p.title === selectedTitle), [posts, selectedTitle]);

  if (isLoading) return <CircularProgress sx={{ mt: 4 }} />;
  if (isError)
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">記事の取得に失敗しました。</Typography>
        <button onClick={() => refetch()}>再試行</button>
      </Box>
    );

  return (
    <Box maxWidth="md" mx="auto" px={2}>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        記事検索
      </Typography>

      <Autocomplete
        fullWidth
        options={options}
        value={selectedTitle}
        onChange={(_, value) => setSelectedTitle(value)}
        renderInput={(params) => <TextField {...params} label="タイトルで検索" variant="outlined" />}
        sx={{ mb: 4 }}
      />

      {matchedPost ? (
        <PostCard post={matchedPost} />
      ) : (
        selectedTitle && <Typography>一致する記事が見つかりませんでした。</Typography>
      )}

      <Link to="/" className={styles.backLink}>
        ← 戻る
      </Link>
    </Box>
  );
};

export default PostSearchPage;
