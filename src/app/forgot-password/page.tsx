"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await api<{ message: string; resetUrl?: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(data.message);
      setResetUrl(data.resetUrl ?? "");
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start reset.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>We will prepare a secure reset link for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button className="w-full" type="submit">
              Send reset link
            </Button>
          </form>
          {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}
          {resetUrl ? (
            <p className="mt-2 break-all text-sm">
              Development reset URL:{" "}
              <Link className="text-navy-500 underline" href={resetUrl}>
                {resetUrl}
              </Link>
            </p>
          ) : null}
          <Link className="mt-4 inline-block text-sm text-navy-500 hover:underline" href="/login">
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
