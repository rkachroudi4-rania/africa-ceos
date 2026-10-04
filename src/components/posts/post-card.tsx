"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/lib/api";
import { fullName } from "@/lib/utils";

type Author = {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    photo: string | null;
    position: string | null;
    company: string | null;
  } | null;
};

export type PostItem = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: Author;
  comments: {
    id: string;
    content: string;
    createdAt: string;
    authorId: string;
    author: Author;
  }[];
  likes: { id: string; userId: string }[];
  _count: { likes: number; comments: number };
};

export function PostCard({
  post,
  currentUserId,
  onChanged,
}: {
  post: PostItem;
  currentUserId: string;
  onChanged: () => void;
}) {
  const liked = post.likes.some((like) => like.userId === currentUserId);
  const own = post.authorId === currentUserId;
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    try {
      await api(`/api/posts/${post.id}/like`, { method: "POST" });
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to like this post.");
    }
  }

  async function saveEdit() {
    setBusy(true);
    try {
      await api(`/api/posts/${post.id}`, { method: "PATCH", body: JSON.stringify({ content }) });
      toast.success("Publication updated.");
      setEditing(false);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to update post.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api(`/api/posts/${post.id}`, { method: "DELETE" });
      toast.success("Publication deleted.");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to delete post.");
    } finally {
      setBusy(false);
    }
  }

  async function addComment() {
    if (!comment.trim()) return;
    setBusy(true);
    try {
      await api(`/api/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: comment }),
      });
      setComment("");
      toast.success("Comment published.");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to comment.");
    } finally {
      setBusy(false);
    }
  }

  const authorName = fullName(post.author.profile?.firstName, post.author.profile?.lastName);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/profile/${post.authorId}`} className="flex items-start gap-3">
          <UserAvatar
            photo={post.author.profile?.photo}
            firstName={post.author.profile?.firstName}
            lastName={post.author.profile?.lastName}
          />
          <div>
            <p className="font-semibold text-navy">{authorName}</p>
            <p className="text-xs text-muted-foreground">
              {[post.author.profile?.position, post.author.profile?.company].filter(Boolean).join(" · ")}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        {own ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setEditing((v) => !v)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this publication?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-4 space-y-2">
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={saveEdit}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-navy-800">{post.content}</p>
      )}

      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <button type="button" onClick={toggleLike} className="inline-flex items-center gap-1 hover:text-navy">
          <Heart className={`h-4 w-4 ${liked ? "fill-emerald-700 text-emerald-700" : ""}`} />
          {post._count.likes}
        </button>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          {post._count.comments}
        </span>
      </div>

      <div className="mt-4 space-y-3 border-t pt-4">
        {post.comments.map((item) => (
          <div key={item.id} className="flex gap-2">
            <UserAvatar
              className="h-8 w-8"
              photo={item.author.profile?.photo}
              firstName={item.author.profile?.firstName}
              lastName={item.author.profile?.lastName}
            />
            <div className="rounded-lg bg-navy-50 px-3 py-2 text-sm">
              <p className="font-medium text-navy">
                {fullName(item.author.profile?.firstName, item.author.profile?.lastName)}
              </p>
              <p>{item.content}</p>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Textarea
            className="min-h-[44px]"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button disabled={busy} onClick={addComment}>
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
}
