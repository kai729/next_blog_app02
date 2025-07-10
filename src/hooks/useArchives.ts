import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// useArchives.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("API_BASE_URL:", API_BASE_URL);

export const useMonthlyArchives = () => {
  return useQuery({
    queryKey: ["archives", "monthly"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/archives/monthly`);
      return data;
    },
  });
};

export const useTagArchives = () => {
  return useQuery({
    queryKey: ["archives", "tags"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/archives/tags`);
      return data;
    },
  });
};
