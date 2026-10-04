import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";

export async function DELETE() {
  try {
    const user = await requireUser();
    await prisma.user.delete({ where: { id: user.id } });
    return NextResponse.json({ message: "Account deleted." });
  } catch (error) {
    return handleApiError(error);
  }
}
