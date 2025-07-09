// src/hooks/useDeletePost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "../api/posts";

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      alert("削除に失敗しました");
    },
  });
};
