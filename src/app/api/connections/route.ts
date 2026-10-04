import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { connectionCreateSchema } from "@/validations";
import { getConnectionState } from "@/lib/connections";
import { createNotification } from "@/lib/notifications";
import { fullName } from "@/lib/utils";

export async function GET() {
  try {
    const user = await requireUser();
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(connections);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { receiverId } = connectionCreateSchema.parse(await request.json());
    if (receiverId === user.id) throw new ApiError(400, "You cannot connect with yourself.");

    const target = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!target) throw new ApiError(404, "User not found.");

    const existing = await getConnectionState(user.id, receiverId);
    if (existing.status === "accepted") throw new ApiError(409, "You are already connected.");
    if (existing.status === "pending_sent") throw new ApiError(409, "A request is already pending.");
    if (existing.status === "pending_received") {
      throw new ApiError(409, "This person already sent you a request. Accept it instead.");
    }

    if (existing.status === "rejected") {
      const updated = await prisma.connection.update({
        where: { id: existing.connectionId },
        data: { senderId: user.id, receiverId, status: "PENDING" },
      });
      const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
      await createNotification({
        userId: receiverId,
        type: "CONNECTION_REQUEST",
        title: "New connection request",
        body: `${fullName(profile?.firstName, profile?.lastName)} wants to connect with you.`,
        relatedId: updated.id,
      });
      return NextResponse.json(updated, { status: 201 });
    }

    const connection = await prisma.connection.create({
      data: { senderId: user.id, receiverId, status: "PENDING" },
    });
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    await createNotification({
      userId: receiverId,
      type: "CONNECTION_REQUEST",
      title: "New connection request",
      body: `${fullName(profile?.firstName, profile?.lastName)} wants to connect with you.`,
      relatedId: connection.id,
    });
    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
