// src/App.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import MonthlyArchive from "./pages/MonthlyArchive";
import TagArchive from "./pages/TagArchive";

const PostList = lazy(() => import("./pages/PostList"));
const PostNew = lazy(() => import("./pages/PostNew"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const PostEdit = lazy(() => import("./pages/PostEdit"));
const PostSearchPage = lazy(() => import("./pages/PostSearchPage"));

const queryClient = new QueryClient();

function App() {
  const location = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<CircularProgress color="primary" />}>
        <AnimatePresence mode="wait" initial={true}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Layout />}>
              <Route index element={<PostList />} />
              <Route path="posts/new" element={<PostNew />} />
              <Route path="posts/:id" element={<PostDetail />} />
              <Route path="post/:id" element={<PostDetail />} />
              <Route path="posts/:id/edit" element={<PostEdit />} />
              <Route path="posts/search" element={<PostSearchPage />} />
              <Route path="/archives/:month" element={<MonthlyArchive />} />
              <Route path="/tags/:tag" element={<TagArchive />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Suspense>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
