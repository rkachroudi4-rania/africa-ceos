"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AFRICAN_COUNTRIES } from "@/lib/constants";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    position: "",
    country: "",
    city: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/auth/register", { method: "POST", body: JSON.stringify(form) });
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        toast.success("Account created. Please sign in.");
        router.push("/login");
        return;
      }
      toast.success("Welcome to Africa CEOs.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create your Africa CEOs account</CardTitle>
          <CardDescription>Join the professional network of African business leaders.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First name</Label>
              <Input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Last name</Label>
              <Input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" required value={form.password} onChange={(e) => set("password", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Confirm password</Label>
              <Input type="password" required value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input required value={form.company} onChange={(e) => set("company", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input required value={form.position} onChange={(e) => set("position", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={form.country} onValueChange={(v) => set("country", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {AFRICAN_COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input required value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <Button className="sm:col-span-2" disabled={loading} type="submit">
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-navy-500 hover:underline" href="/login">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
