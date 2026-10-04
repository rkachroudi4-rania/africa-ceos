import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { commentSchema } from "@/validations";
import { createNotification } from "@/lib/notifications";
import { fullName } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;
    const comments = await prisma.comment.findMany({
      where: { postId: id },
      orderBy: { createdAt: "asc" },
      include: { author: { include: { profile: true } } },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new ApiError(404, "Post not found.");
    const { content } = commentSchema.parse(await request.json());

    const comment = await prisma.comment.create({
      data: { postId: id, authorId: user.id, content },
      include: { author: { include: { profile: true } } },
    });

    if (post.authorId !== user.id) {
      const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
      await createNotification({
        userId: post.authorId,
        type: "POST_COMMENT",
        title: "New comment on your publication",
        body: `${fullName(profile?.firstName, profile?.lastName)} commented on your post.`,
        relatedId: post.id,
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
