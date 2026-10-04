import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { connectionActionSchema } from "@/validations";
import { createNotification } from "@/lib/notifications";
import { fullName } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { action } = connectionActionSchema.parse(await request.json());
    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection) throw new ApiError(404, "Connection request not found.");
    if (connection.receiverId !== user.id) {
      throw new ApiError(403, "Only the recipient can respond to this request.");
    }
    if (connection.status !== "PENDING") {
      throw new ApiError(400, "This request has already been processed.");
    }

    const status = action === "accept" ? "ACCEPTED" : "REJECTED";
    const updated = await prisma.connection.update({
      where: { id },
      data: { status },
    });

    if (action === "accept") {
      const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
      await createNotification({
        userId: connection.senderId,
        type: "CONNECTION_ACCEPTED",
        title: "Connection accepted",
        body: `${fullName(profile?.firstName, profile?.lastName)} accepted your connection request.`,
        relatedId: connection.id,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection) throw new ApiError(404, "Connection not found.");
    if (connection.senderId !== user.id && connection.receiverId !== user.id) {
      throw new ApiError(403, "You are not part of this connection.");
    }
    await prisma.connection.delete({ where: { id } });
    return NextResponse.json({ message: "Connection removed." });
  } catch (error) {
    return handleApiError(error);
  }
}
