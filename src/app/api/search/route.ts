import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { requireUser } from "@/lib/session";
import { getConnectionState } from "@/lib/connections";
import { searchQuerySchema } from "@/validations";

export async function GET(request: Request) {
  try {
    const current = await requireUser();
    const { searchParams } = new URL(request.url);
    const query = searchQuerySchema.parse({
      q: searchParams.get("q") ?? "",
      company: searchParams.get("company") ?? undefined,
      country: searchParams.get("country") ?? undefined,
      sector: searchParams.get("sector") ?? undefined,
    });

    const term = query.q.trim();
    const profiles = await prisma.profile.findMany({
      where: {
        AND: [
          term
            ? {
                OR: [
                  { firstName: { contains: term, mode: "insensitive" } },
                  { lastName: { contains: term, mode: "insensitive" } },
                  { company: { contains: term, mode: "insensitive" } },
                  { country: { contains: term, mode: "insensitive" } },
                  { sector: { contains: term, mode: "insensitive" } },
                ],
              }
            : {},
          query.company ? { company: { contains: query.company, mode: "insensitive" } } : {},
          query.country ? { country: query.country } : {},
          query.sector ? { sector: query.sector } : {},
        ],
      },
      include: { user: { select: { id: true, email: true, createdAt: true } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: 50,
    });

    const results = await Promise.all(
      profiles.map(async (profile) => ({
        ...profile,
        connection: await getConnectionState(current.id, profile.userId),
      })),
    );

    return NextResponse.json(results);
  } catch (error) {
    return handleApiError(error);
  }
}
