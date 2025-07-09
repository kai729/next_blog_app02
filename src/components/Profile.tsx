// src/components/Profile.tsx
import styles from "./Profile.module.css";
import { GitHub, Language as PortfolioIcon } from "@mui/icons-material";

export default function Profile() {
  return (
    <div className={styles.profileContainer}>
      <img src="/profile.JPG" alt="プロフィール画像" className={styles.profileImage} />
      <h3 className={styles.name}>カイト</h3>
      <p className={styles.bio}>フロントエンドエンジニアとして、UI/UXとパフォーマンス最適化に注力しています。</p>
      <div className={styles.socialLinks}>
        <a href="https://github.com/kai729" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <GitHub />
        </a>
        <a
          href="https://kai-portfolio-dun.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Portfolio"
        >
          <PortfolioIcon />
        </a>
      </div>
    </div>
  );
}
