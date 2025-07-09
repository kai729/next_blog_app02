// src/components/CustomNavLink.tsx
import { NavLink } from "react-router-dom";
import { ListItemButton } from "@mui/material";
import type { ListItemButtonProps } from "@mui/material";

type Props = ListItemButtonProps & {
  to: string;
};

export default function CustomNavLink({ to, ...rest }: Props) {
  return (
    <NavLink to={to}>
      {({ isActive }) => <ListItemButton {...rest} className={`${rest.className ?? ""} ${isActive ? "active" : ""}`} />}
    </NavLink>
  );
}
