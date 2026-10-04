import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";
import { fullName } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new ApiError(404, "Post not found.");

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: id, userId: user.id } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }

    await prisma.like.create({ data: { postId: id, userId: user.id } });

    if (post.authorId !== user.id) {
      const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
      await createNotification({
        userId: post.authorId,
        type: "POST_LIKE",
        title: "New like on your publication",
        body: `${fullName(profile?.firstName, profile?.lastName)} liked your post.`,
        relatedId: post.id,
      });
    }

    return NextResponse.json({ liked: true });
  } catch (error) {
    return handleApiError(error);
  }
}
