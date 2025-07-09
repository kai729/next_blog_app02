import { useState } from "react";
import { Box, IconButton, Snackbar, Alert } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

type Props = {
  code: string;
};

const CodeBlockWithCopy = ({ code }: Props) => {
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setOpen(true);
    } catch (err) {
      console.error("コピーに失敗しました", err);
    }
  };

  return (
    <Box sx={{ position: "relative", mb: 2 }}>
      <pre style={{ overflow: "auto", padding: "1rem", background: "#2d2d2d", color: "#fff", borderRadius: "8px" }}>
        <code>{code}</code>
      </pre>
      <IconButton
        onClick={handleCopy}
        size="small"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          color: "#fff",
          backgroundColor: "#555",
          "&:hover": { backgroundColor: "#777" },
        }}
      >
        <ContentCopyIcon fontSize="small" />
      </IconButton>

      <Snackbar open={open} autoHideDuration={2000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: "100%" }}>
          コピーしました！
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CodeBlockWithCopy;
