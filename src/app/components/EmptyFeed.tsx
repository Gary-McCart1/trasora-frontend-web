import { ImEyeBlocked } from "react-icons/im";

export default function EmptyFeed() {

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-zinc-900 border border-zinc-700 text-center space-y-4 max-w-3xl mx-auto mt-20">
      <ImEyeBlocked size={32} className="text-purple-500" />
      <h2 className="text-xl font-semibold text-white">
        You&apos;re all caught up!
      </h2>
      <p className="text-zinc-400 text-sm">
        There are no posts in your feed. Follow your friends or explore public profiles to see their latest posts.
      </p>
      
    </div>
  );
}
