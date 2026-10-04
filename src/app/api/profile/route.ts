import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { profileSchema } from "@/validations";

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { user: { select: { email: true, role: true, createdAt: true } } },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const data = profileSchema.parse(body);

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company || null,
        position: data.position || null,
        country: data.country || null,
        city: data.city || null,
        biography: data.biography || null,
        sector: data.sector || null,
        website: data.website || null,
        linkedin: data.linkedin || null,
      },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company || null,
        position: data.position || null,
        country: data.country || null,
        city: data.city || null,
        biography: data.biography || null,
        sector: data.sector || null,
        website: data.website || null,
        linkedin: data.linkedin || null,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
