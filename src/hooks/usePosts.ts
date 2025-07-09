import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPosts, createPost, deletePost, updatePost } from "../api/posts";
import type { Post } from "../types/Post";

// 🔹 記事一覧取得（ページネーション対応）
export const usePosts = (page = 1, limit = 10) => {
  const {
    data = {
      posts: [],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
      },
    },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["posts", page, limit],
    queryFn: () => fetchPosts(page, limit),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  return {
    posts: data.posts,
    pagination: data.pagination,
    isLoading,
    isError,
    refetch,
  };
};

// 🔹 新規記事作成
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      title,
      body,
      tags,
      thumbnail_url,
    }: {
      title: string;
      body: string;
      tags: string[];
      thumbnail_url: string;
    }) => createPost(title, body, tags, thumbnail_url),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });
}

// 🔹 記事削除
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });
}

// 🔹 記事更新
export function useUpdatePost(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; body: string; tags: string[]; thumbnail_url: string }) => updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
