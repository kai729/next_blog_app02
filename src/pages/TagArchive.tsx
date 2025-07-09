// src/pages/TagArchive.tsx
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Box, Typography, CircularProgress } from "@mui/material";
import PostCard from "../components/PostCard";
import { motion } from "framer-motion";
import styles from "./Archive.module.css";

const TagArchive = () => {
  const { tag } = useParams<{ tag: string }>();

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["postsByTag", tag],
    queryFn: async () => {
      const { data } = await axios.get(`/api/archives/tag/${tag}`);
      return data;
    },
    enabled: !!tag,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography>読み込み失敗</Typography>;
  if (!data || data.length === 0) return <Typography>該当する記事がありません。</Typography>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={styles.container}
    >
      <Typography className={styles.title} variant="h4" gutterBottom>
        {tag} の記事一覧
      </Typography>

      <Box className={styles.postList}>
        {data.map((post: any) => (
          <div key={post.id} className={styles.card}>
            <PostCard post={post} />
          </div>
        ))}
      </Box>
    </motion.div>
  );
};

export default TagArchive;
