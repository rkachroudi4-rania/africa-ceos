import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: "Publication deleted." });
  } catch (error) {
    return handleApiError(error);
  }
}
