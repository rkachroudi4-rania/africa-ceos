"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAvatar } from "@/components/user-avatar";
import { ErrorState } from "@/components/error-state";
import { PageLoading } from "@/components/page-loading";
import { AFRICAN_COUNTRIES, BUSINESS_SECTORS } from "@/lib/constants";
import { api } from "@/lib/api";

type Profile = {
  firstName: string;
  lastName: string;
  company: string | null;
  position: string | null;
  country: string | null;
  city: string | null;
  biography: string | null;
  sector: string | null;
  website: string | null;
  linkedin: string | null;
  photo: string | null;
  user: { email: string };
};

export default function ProfilePage() {
  const { update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Profile>("/api/profile")
      .then(setProfile)
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load profile."));
  }, []);

  async function save() {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await api<Profile>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(profile),
      });
      setProfile(updated);
      await update({ name: `${updated.firstName} ${updated.lastName}`, image: updated.photo });
      toast.success("Profile updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(file: File) {
    const form = new FormData();
    form.append("photo", file);
    try {
      const data = await api<{ photo: string }>("/api/profile/photo", { method: "POST", body: form });
      setProfile((prev) => (prev ? { ...prev, photo: data.photo } : prev));
      toast.success("Photo updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to upload photo.");
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!profile) return <PageLoading />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy">My profile</h1>
        <Button variant="outline" asChild>
          <Link href="/settings">Account settings</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Professional identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar className="h-20 w-20" photo={profile.photo} firstName={profile.firstName} lastName={profile.lastName} />
            <div>
              <Label>Photo</Label>
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First name</Label>
              <Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Last name</Label>
              <Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={profile.company ?? ""} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input value={profile.position ?? ""} onChange={(e) => setProfile({ ...profile, position: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={profile.country ?? ""} onValueChange={(v) => setProfile({ ...profile, country: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {AFRICAN_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={profile.city ?? ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Business sector</Label>
              <Select value={profile.sector ?? ""} onValueChange={(v) => setProfile({ ...profile, sector: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={profile.website ?? ""} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input value={profile.linkedin ?? ""} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Biography</Label>
              <Textarea value={profile.biography ?? ""} onChange={(e) => setProfile({ ...profile, biography: e.target.value })} />
            </div>
          </div>
          <Button disabled={saving} onClick={save}>
            Save profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
