import type { Post } from "../types/Post";
import axios from "axios";
import { API_URL } from "../config";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const POSTS_URL = `${API_BASE_URL}/posts`;

export type PaginatedPostsResponse = {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export const fetchPostById = async (postId: number) => {
  const res = await fetch(`${POSTS_URL}/${postId}`);
  if (!res.ok) throw new Error("データ取得失敗");
  return res.json();
};

// 🔹 記事一覧取得（fetchで統一）
export const fetchPosts = async (page = 1, limit = 10): Promise<PaginatedPostsResponse> => {
  const res = await fetch(`${POSTS_URL}?page=${page}&limit=${limit}`);
  if (!res.ok) {
    throw new Error("記事の取得に失敗しました");
  }
  return res.json();
};

// 🔹 単一記事取得
export function fetchPost(id: string): Promise<Post> {
  return fetch(`${POSTS_URL}/${id}`, {
    method: "GET",
    credentials: "include",
  }).then((res) => {
    if (!res.ok) {
      throw new Error("記事の取得に失敗しました");
    }
    return res.json();
  });
}

// 🔹 新規記事作成
export function createPost(title: string, body: string, tags: string[], thumbnail_url: string): Promise<Post> {
  return fetch(POSTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body, tags, thumbnail_url }),
    credentials: "include",
  }).then((res) => {
    if (!res.ok) throw new Error("投稿の作成に失敗しました");
    return res.json();
  });
}

// 🔹 記事更新API
export function updatePost(id: string, data: { title: string; body: string; tags: string[]; thumbnail_url: string }) {
  return fetch(`${import.meta.env.VITE_API_BASE_URL}/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  }).then((res) => {
    if (!res.ok) throw new Error("記事の更新に失敗しました");
    return res.json();
  });
}

// 🔹 記事削除
export async function deletePost(id: number): Promise<void> {
  const res = await fetch(`${POSTS_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("削除に失敗しました");
  }
}

// 月別の記事を取得するAPI
export const fetchPostsByMonth = async (month: string) => {
  const res = await axios.get(`${API_BASE_URL}/archives/month/${month}`);
  return res.data; // ここが正解
};

// タグ別の記事を取得するAPI
export const fetchPostsByTag = async (tag: string) => {
  const res = await axios.get(`${API_BASE_URL}/archives/tag/${tag}`);
  return res.data; // ここが正解
};

// コメント一覧取得
export const fetchComments = async (postId: string) => {
  const res = await fetch(`${POSTS_URL}/${postId}/comments`);
  if (!res.ok) throw new Error("コメントの取得に失敗しました");
  return res.json(); // → コメント配列が返る
};

// コメント投稿
export const postComment = async (postId: string, data: { author_name: string; body: string }) => {
  const res = await fetch(`${POSTS_URL}/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("コメントの投稿に失敗しました");
  return res.json(); // → 作成されたコメントが返る
};

// コメント削除
export const deleteComment = async (postId: number, commentId: number) => {
  const res = await fetch(`${API_URL}/posts/comments/${commentId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("コメントの削除に失敗しました");
  }

  return true;
};

// コメント編集
export const updateComment = async (postId: number, commentId: number, data: { author_name: string; body: string }) => {
  const res = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("コメントの更新に失敗しました");
  }

  return res.json();
};
