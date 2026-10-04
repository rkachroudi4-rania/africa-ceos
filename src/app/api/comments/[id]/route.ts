import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { commentSchema } from "@/validations";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new ApiError(404, "Comment not found.");
    if (comment.authorId !== user.id) throw new ApiError(403, "You can only edit your own comments.");
    const { content } = commentSchema.parse(await request.json());
    const updated = await prisma.comment.update({
      where: { id },
      data: { content },
      include: { author: { include: { profile: true } } },
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
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new ApiError(404, "Comment not found.");
    if (comment.authorId !== user.id && user.role !== "ADMIN") {
      throw new ApiError(403, "You can only delete your own comments.");
    }
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ message: "Comment deleted." });
  } catch (error) {
    return handleApiError(error);
  }
}
