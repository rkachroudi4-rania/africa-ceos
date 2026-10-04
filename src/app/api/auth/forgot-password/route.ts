import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { forgotPasswordSchema } from "@/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    const generic = {
      message: "If an account exists for this email, a reset link has been prepared.",
    };

    if (!user) {
      return NextResponse.json(generic);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    const origin = process.env.AUTH_URL ?? request.headers.get("origin") ?? "http://localhost:3000";
    const resetUrl = `${origin}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "Africa CEOs <noreply@africaceos.com>",
          to: user.email,
          subject: "Reset your Africa CEOs password",
          text: `Reset your password: ${resetUrl}`,
        }),
      });
      return NextResponse.json(generic);
    }

    return NextResponse.json({
      ...generic,
      ...(process.env.NODE_ENV !== "production" ? { resetUrl, note: "RESEND_API_KEY is not set; the reset URL is returned in development only." } : {}),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
