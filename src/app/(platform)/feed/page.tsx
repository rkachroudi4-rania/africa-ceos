"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { PageLoading } from "@/components/page-loading";
import { PostCard, type PostItem } from "@/components/posts/post-card";
import { api } from "@/lib/api";

export default function FeedPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<PostItem[] | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<PostItem[]>("/api/posts");
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load publications.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function publish() {
    setBusy(true);
    try {
      await api("/api/posts", { method: "POST", body: JSON.stringify({ content }) });
      setContent("");
      toast.success("Publication created.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to publish.");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!posts || !session?.user?.id) return <PageLoading />;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Feed</h1>
        <p className="text-sm text-muted-foreground">Publications from African business leaders, newest first.</p>
      </div>
      <Card className="p-4">
        <Textarea
          placeholder="Share an insight, opportunity or update..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <Button disabled={busy || !content.trim()} onClick={publish}>
            Publish
          </Button>
        </div>
      </Card>
      {posts.length === 0 ? (
        <EmptyState title="No publications yet" description="Be the first to share an update." />
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={session.user.id} onChanged={load} />
        ))
      )}
    </div>
  );
}
