"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { ConnectionActions } from "@/components/connection-actions";
import { ErrorState } from "@/components/error-state";
import { PageLoading } from "@/components/page-loading";
import { api } from "@/lib/api";
import { fullName } from "@/lib/utils";
import { ConnectionState } from "@/lib/connections";

type ProfileView = {
  userId: string;
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
  email?: string;
  postsCount: number;
  connectionsCount: number;
  connection: ConnectionState;
};

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [error, setError] = useState("");

  function load() {
    api<ProfileView>(`/api/profile/${params.id}`)
      .then(setProfile)
      .catch((e) => setError(e instanceof Error ? e.message : "Profile not found."));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (error) return <ErrorState message={error} />;
  if (!profile) return <PageLoading />;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <UserAvatar className="h-20 w-20" photo={profile.photo} firstName={profile.firstName} lastName={profile.lastName} />
            <div>
              <h1 className="text-2xl font-semibold text-navy">{fullName(profile.firstName, profile.lastName)}</h1>
              <p className="text-sm text-muted-foreground">
                {[profile.position, profile.company].filter(Boolean).join(" · ")}
              </p>
              <p className="text-sm text-muted-foreground">
                {[profile.city, profile.country].filter(Boolean).join(", ")}
              </p>
              <p className="mt-2 text-sm">
                {profile.connectionsCount} connections · {profile.postsCount} publications
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <ConnectionActions userId={profile.userId} connection={profile.connection} onChange={load} />
            {profile.connection.status === "accepted" ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/messages/${profile.userId}`}>Message</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <Card className="p-6">
        <h2 className="font-semibold text-navy">Biography</h2>
        <p className="mt-2 text-sm leading-6 text-navy-800">{profile.biography || "No biography yet."}</p>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <p><span className="text-muted-foreground">Sector:</span> {profile.sector || "—"}</p>
          <p><span className="text-muted-foreground">Website:</span> {profile.website ? <a className="text-navy-500 underline" href={profile.website}>{profile.website}</a> : "—"}</p>
          <p><span className="text-muted-foreground">LinkedIn:</span> {profile.linkedin ? <a className="text-navy-500 underline" href={profile.linkedin}>{profile.linkedin}</a> : "—"}</p>
        </div>
      </Card>
    </div>
  );
}
