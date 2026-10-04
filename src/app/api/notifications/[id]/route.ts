import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== user.id) {
      throw new ApiError(404, "Notification not found.");
    }
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
