"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PostDto } from "./types/Post";
import { useAuth } from "./context/AuthContext";
import EmptyFeed from "./components/EmptyFeed";
import PostSkeleton from "./components/PostSkeleton";
import MainFeed from "./components/MainFeed";
import { getFeed } from "./lib/postsApi";
import PushNotificationModal from "./components/PushNotificationModal";
import { registerPush } from "./lib/push";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [isPushModalOpen, setPushModalOpen] = useState(false);

  useEffect(() => {
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

    // ---------------- Push Modal ----------------
    const modalKey = `hasSeenPushModal_${user.username}`;
    const hasSeenPushModal = localStorage.getItem(modalKey);

    if (!hasSeenPushModal) {
      const timer = setTimeout(() => {
        setPushModalOpen(true);
        localStorage.setItem(modalKey, "true"); // mark as seen for this user
      }, 2000);

      return () => clearTimeout(timer);
    }

    // ---------------- Register Push (once per device per user) ----------------
    const pushKey = `hasRegisteredPush_${user.username}`;
    const hasRegisteredPush = localStorage.getItem(pushKey);

    if (!hasRegisteredPush) {
      registerPush()
        .then(() => {
          console.log("Push registration successful");
          localStorage.setItem(pushKey, "true"); // mark as registered
        })
        .catch(err => console.error("Push registration failed:", err));
    }
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
    return (
      <>
        <EmptyFeed />
        <PushNotificationModal
          isOpen={isPushModalOpen}
          onClose={() => setPushModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <MainFeed posts={posts} initialIndex={0} />
      <PushNotificationModal
        isOpen={isPushModalOpen}
        onClose={() => setPushModalOpen(false)}
      />
    </>
  );
}
