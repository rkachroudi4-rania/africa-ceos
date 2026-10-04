import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { getConnectionState } from "@/lib/connections";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const current = await requireUser();
    const { id } = await params;
    const profile = await prisma.profile.findUnique({
      where: { userId: id },
      include: {
        user: { select: { id: true, email: true, createdAt: true } },
      },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const connection = await getConnectionState(current.id, id);
    const postsCount = await prisma.post.count({ where: { authorId: id } });
    const connectionsCount = await prisma.connection.count({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: id }, { receiverId: id }],
      },
    });

    return NextResponse.json({
      ...profile,
      email: current.id === id || connection.status === "accepted" ? profile.user.email : undefined,
      connection,
      postsCount,
      connectionsCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
