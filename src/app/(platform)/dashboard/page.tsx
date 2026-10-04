"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/page-loading";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { api } from "@/lib/api";

type DashboardData = {
  connections: number;
  publications: number;
  likes: number;
  comments: number;
  pendingRequests: number;
  recentPosts: { id: string; content: string; createdAt: string; _count: { likes: number; comments: number } }[];
  recentActivities: { id: string; title: string; body: string; createdAt: string }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DashboardData>("/api/dashboard")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load dashboard."));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <PageLoading />;

  const chart = [
    { name: "Connections", value: data.connections },
    { name: "Publications", value: data.publications },
    { name: "Likes", value: data.likes },
    { name: "Comments", value: data.comments },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your activity across the Africa CEOs network.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {chart.map((item) => (
          <Card key={item.name}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-navy">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0B1F3A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent publications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentPosts.length === 0 ? (
              <EmptyState title="No publications yet" description="Share an update from the feed." />
            ) : (
              data.recentPosts.map((post) => (
                <div key={post.id} className="rounded-lg border p-3 text-sm">
                  <p className="line-clamp-2">{post.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {post._count.likes} likes · {post._count.comments} comments
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentActivities.length === 0 ? (
              <EmptyState title="No recent activity" description="Connection requests, messages and post interactions will appear here." />
            ) : (
              data.recentActivities.map((item) => (
                <div key={item.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium text-navy">{item.title}</p>
                  <p className="text-muted-foreground">{item.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
