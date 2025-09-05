import CreatePostPage from "./CreatePostPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolvedParams = await searchParams;
  return <CreatePostPage searchParams={resolvedParams} />;
}
