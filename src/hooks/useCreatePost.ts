// src/hooks/useCreatePost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../api/posts";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // 投稿成功後に記事一覧キャッシュを再取得
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      alert("投稿の作成に失敗しました");
    },
  });
};
