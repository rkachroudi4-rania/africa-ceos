import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { messageSchema } from "@/validations";
import { requireAcceptedConnection } from "@/lib/connections";
import { createNotification } from "@/lib/notifications";
import { fullName } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const withUser = searchParams.get("userId");

    if (!withUser) {
      const messages = await prisma.message.findMany({
        where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
        orderBy: { createdAt: "desc" },
        include: {
          sender: { include: { profile: true } },
          receiver: { include: { profile: true } },
        },
      });

      const map = new Map<string, (typeof messages)[number]>();
      for (const message of messages) {
        const other = message.senderId === user.id ? message.receiverId : message.senderId;
        if (!map.has(other)) map.set(other, message);
      }

      const conversations = Array.from(map.entries()).map(([otherId, lastMessage]) => {
        const otherUser = lastMessage.senderId === otherId ? lastMessage.sender : lastMessage.receiver;
        return { otherId, otherUser, lastMessage };
      });

      return NextResponse.json(conversations);
    }

    const allowed = await requireAcceptedConnection(user.id, withUser);
    if (!allowed) throw new ApiError(403, "You can only message accepted connections.");

    const thread = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: withUser },
          { senderId: withUser, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    await prisma.message.updateMany({
      where: { senderId: withUser, receiverId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json(thread);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { receiverId, content } = messageSchema.parse(await request.json());
    if (receiverId === user.id) throw new ApiError(400, "You cannot message yourself.");
    const allowed = await requireAcceptedConnection(user.id, receiverId);
    if (!allowed) throw new ApiError(403, "You can only message accepted connections.");

    const message = await prisma.message.create({
      data: { senderId: user.id, receiverId, content },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    await createNotification({
      userId: receiverId,
      type: "NEW_MESSAGE",
      title: "New private message",
      body: `${fullName(profile?.firstName, profile?.lastName)} sent you a message.`,
      relatedId: user.id,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
