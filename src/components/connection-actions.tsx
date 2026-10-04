"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { ConnectionState } from "@/lib/connections";

export function ConnectionActions({
  userId,
  connection,
  onChange,
}: {
  userId: string;
  connection: ConnectionState;
  onChange?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function refresh() {
    onChange?.();
    router.refresh();
  }

  async function send() {
    setLoading(true);
    try {
      await api("/api/connections", { method: "POST", body: JSON.stringify({ receiverId: userId }) });
      toast.success("Connection request sent.");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to send request.");
    } finally {
      setLoading(false);
    }
  }

  async function respond(action: "accept" | "refuse") {
    if (connection.status !== "pending_received") return;
    setLoading(true);
    try {
      await api(`/api/connections/${connection.connectionId}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      toast.success(action === "accept" ? "Connection accepted." : "Request declined.");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to update request.");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!("connectionId" in connection)) return;
    setLoading(true);
    try {
      await api(`/api/connections/${connection.connectionId}`, { method: "DELETE" });
      toast.success("Connection removed.");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to remove connection.");
    } finally {
      setLoading(false);
    }
  }

  if (connection.status === "self") return <Badge variant="secondary">You</Badge>;
  if (connection.status === "accepted") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="success">Connected</Badge>
        <Button variant="outline" size="sm" disabled={loading} onClick={remove}>
          Remove
        </Button>
      </div>
    );
  }
  if (connection.status === "pending_sent") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="warning">Request sent</Badge>
        <Button variant="outline" size="sm" disabled={loading} onClick={remove}>
          Cancel
        </Button>
      </div>
    );
  }
  if (connection.status === "pending_received") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="warning">Request received</Badge>
        <Button size="sm" disabled={loading} onClick={() => respond("accept")}>
          Accept
        </Button>
        <Button variant="outline" size="sm" disabled={loading} onClick={() => respond("refuse")}>
          Refuse
        </Button>
      </div>
    );
  }
  return (
    <Button size="sm" disabled={loading} onClick={send}>
      Connect
    </Button>
  );
}
