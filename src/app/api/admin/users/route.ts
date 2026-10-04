import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { profile: true, _count: { select: { posts: true } } },
    });
    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        profile: u.profile,
        postsCount: u._count.posts,
      })),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
