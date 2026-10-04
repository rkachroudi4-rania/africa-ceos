import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { passwordChangeSchema } from "@/validations";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const data = passwordChangeSchema.parse(body);

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const valid = await bcrypt.compare(data.currentPassword, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
