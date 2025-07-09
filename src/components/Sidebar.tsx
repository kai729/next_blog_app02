import { List, ListItem, Divider, Typography, ListItemButton } from "@mui/material";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import CustomNavLink from "./CustomNavLink";
import Profile from "./Profile";
import { useMonthlyArchives, useTagArchives } from "../hooks/useArchives";

type SidebarProps = {
  onLinkClick?: () => void;
};

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const { data: monthlyData, isLoading: isLoadingMonthly } = useMonthlyArchives();
  const { data: tagData, isLoading: isLoadingTags } = useTagArchives();

  <CustomNavLink to="/posts/new" onClick={onLinkClick} className={styles.navItem} />;

  return (
    <div className={styles.sidebarContainer}>
      <Profile />

      <Divider sx={{ my: 2 }} />

      <List>
        <ListItem disablePadding>
          <CustomNavLink to="/" onClick={onLinkClick} className={styles.navItem}>
            記事一覧
          </CustomNavLink>
        </ListItem>
        <ListItem disablePadding>
          <CustomNavLink to="/posts/new" onClick={onLinkClick} className={styles.navItem}>
            新規作成
          </CustomNavLink>
        </ListItem>
        <ListItem disablePadding>
          <CustomNavLink to="/posts/search" onClick={onLinkClick} className={styles.navItem}>
            記事検索
          </CustomNavLink>
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography className={styles.sectionTitle}>タグ一覧</Typography>
      <List>
        {isLoadingTags && <ListItem>読み込み中...</ListItem>}
        {tagData &&
          tagData.map((item) => (
            <ListItem disablePadding key={item.name}>
              <CustomNavLink to={`/tags/${item.name}`} onClick={onLinkClick} className={styles.navItem}>
                {item.name}（{item.count}）
              </CustomNavLink>
            </ListItem>
          ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography className={styles.sectionTitle}>アーカイブ（月別）</Typography>
      <List>
        {isLoadingMonthly && <ListItem>読み込み中...</ListItem>}
        {monthlyData &&
          monthlyData.map((item) => (
            <ListItem disablePadding key={item.month}>
              <CustomNavLink to={`/archives/${item.month}`} onClick={onLinkClick} className={styles.navItem}>
                {item.month}（{item.count}）
              </CustomNavLink>
            </ListItem>
          ))}
      </List>
    </div>
  );
}
