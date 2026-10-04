import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    await requireAdmin();
    const [users, posts, comments, likes, connections, messages, pendingConnections] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.like.count(),
      prisma.connection.count({ where: { status: "ACCEPTED" } }),
      prisma.message.count(),
      prisma.connection.count({ where: { status: "PENDING" } }),
    ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { profile: true },
    });

    return NextResponse.json({
      users,
      posts,
      comments,
      likes,
      connections,
      messages,
      pendingConnections,
      recentUsers,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
