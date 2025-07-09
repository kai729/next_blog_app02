import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarToday, Label } from "@mui/icons-material";
import styles from "./PostCard.module.css";
import type { Post } from "../types/Post";
import { Chip, Box } from "@mui/material";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type Props = {
  post: Post;
};

const PostCard = ({ post }: Props) => {
  const createdAt = new Date(post.createdAt).toLocaleDateString();
  const category = "技術";

  return (
    <motion.article
      className={styles.card}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
    >
      <Link to={`/posts/${post.id}`} className={styles.link}>
        <h2 className={styles.title}>{post.title}</h2>
        <p className={styles.body}>{post.body.slice(0, 60)}...</p>

        <Box className={styles.tags}>
          {post.tags &&
            post.tags.length > 0 &&
            post.tags.map((tag, index) => <Chip key={index} label={tag} size="small" variant="outlined" />)}
        </Box>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <CalendarToday fontSize="small" className={styles.icon} />
            {createdAt}
          </span>
          <span className={styles.metaItem}>
            <Label fontSize="small" className={styles.icon} />
            {category}
          </span>
        </div>
      </Link>
    </motion.article>
  );
};

export default PostCard;
