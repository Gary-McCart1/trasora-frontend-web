"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PostDto } from "./types/Post";
import { useAuth } from "./context/AuthContext";
import EmptyFeed from "./components/EmptyFeed";
import PostSkeleton from "./components/PostSkeleton";
import MainFeed from "./components/MainFeed";
import { getFeed } from "./lib/postsApi";

export default function Home() {
  const { user, loading: authLoading } = useAuth(); // assuming useAuth has a loading flag
  const router = useRouter();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until auth is loaded
    if (authLoading) return;

    if (!user?.username) {
      router.push("/login");
      return;
    }

    const fetchPosts = async () => {
      try {
        const data = await getFeed();
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center gap-10 pt-6 pb-20 mx-auto w-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }
  

  if (posts.length === 0) {
    return <EmptyFeed />;
  }

  return <MainFeed posts={posts} initialIndex={0} />;
}
