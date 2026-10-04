import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { postSchema } from "@/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { include: { profile: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { include: { profile: true } } },
        },
        likes: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
    if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new ApiError(404, "Post not found.");
    if (post.authorId !== user.id && user.role !== "ADMIN") {
      throw new ApiError(403, "You can only edit your own posts.");
    }
    const { content } = postSchema.parse(await request.json());
    const updated = await prisma.post.update({
      where: { id },
      data: { content },
      include: {
        author: { include: { profile: true } },
        comments: { include: { author: { include: { profile: true } } } },
        likes: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new ApiError(404, "Post not found.");
    if (post.authorId !== user.id && user.role !== "ADMIN") {
      throw new ApiError(403, "You can only delete your own posts.");
    }
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: "Post deleted." });
  } catch (error) {
    return handleApiError(error);
  }
}
