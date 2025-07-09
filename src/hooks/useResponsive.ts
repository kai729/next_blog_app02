import { useEffect, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";

export function useResponsive() {
  const [mounted, setMounted] = useState(false);
  const isDesktopRaw = useMediaQuery("(min-width: 1000px)", { noSsr: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? isDesktopRaw : false;
}
