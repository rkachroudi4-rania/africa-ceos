import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { registerSchema } from "@/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const email = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            company: data.company,
            position: data.position,
            country: data.country,
            city: data.city,
          },
        },
      },
      include: { profile: true },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      profile: user.profile,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
