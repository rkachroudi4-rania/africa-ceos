import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireUser();

    const [connections, publications, likes, comments, recentPosts, recentNotifications, pendingRequests] =
      await Promise.all([
        prisma.connection.count({
          where: {
            status: "ACCEPTED",
            OR: [{ senderId: user.id }, { receiverId: user.id }],
          },
        }),
        prisma.post.count({ where: { authorId: user.id } }),
        prisma.like.count({ where: { post: { authorId: user.id } } }),
        prisma.comment.count({ where: { post: { authorId: user.id } } }),
        prisma.post.findMany({
          where: { authorId: user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { _count: { select: { likes: true, comments: true } } },
        }),
        prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.connection.count({
          where: { receiverId: user.id, status: "PENDING" },
        }),
      ]);

    return NextResponse.json({
      connections,
      publications,
      likes,
      comments,
      pendingRequests,
      recentPosts,
      recentActivities: recentNotifications,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
