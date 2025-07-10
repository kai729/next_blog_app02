import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// useArchives.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// //ローカル用
// export const useMonthlyArchives = () => {
//   return useQuery({
//     queryKey: ["archives", "monthly"],
//     queryFn: async () => {
//       const { data } = await axios.get(`${API_BASE_URL}/archives/monthly`);
//       return data;
//     },
//   });
// };

// export const useTagArchives = () => {
//   return useQuery({
//     queryKey: ["archives", "tags"],
//     queryFn: async () => {
//       const { data } = await axios.get(`${API_BASE_URL}/archives/tags`);
//       return data;
//     },
//   });
// };

//本番用
export const useMonthlyArchives = () => {
  return useQuery({
    queryKey: ["archives", "monthly"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/posts/archives/monthly`);
      return data;
    },
  });
};

export const useTagArchives = () => {
  return useQuery({
    queryKey: ["archives", "tags"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/posts/archives/tags`);
      return data;
    },
  });
};
