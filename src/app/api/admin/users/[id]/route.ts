import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    if (id === admin.id) throw new ApiError(400, "You cannot delete your own administrator account from here.");
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User deleted." });
  } catch (error) {
    return handleApiError(error);
  }
}
