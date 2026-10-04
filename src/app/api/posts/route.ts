import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { postSchema } from "@/validations";

export async function GET() {
  try {
    await requireUser();
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { include: { profile: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { include: { profile: true } } },
        },
        likes: { select: { id: true, userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { content } = postSchema.parse(body);
    const post = await prisma.post.create({
      data: { content, authorId: user.id },
      include: {
        author: { include: { profile: true } },
        comments: true,
        likes: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
