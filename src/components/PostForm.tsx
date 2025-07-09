import { useState } from "react";

type PostFormProps = {
  initialTitle?: string;
  initialContent?: string;
  onSubmit: (title: string, content: string) => void;
  submitLabel?: string;
};

const PostForm = ({ initialTitle = "", initialContent = "", onSubmit, submitLabel = "投稿" }: PostFormProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      setError("タイトルと本文は必須です。");
      return;
    }

    setError("");
    onSubmit(title, content);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <label>タイトル:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>本文:</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <button type="submit">{submitLabel}</button>
    </form>
  );
};

export default PostForm;
