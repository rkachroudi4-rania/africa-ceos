import { ConnectionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ConnectionState =
  | { status: "none" }
  | { status: "self" }
  | { status: "pending_sent"; connectionId: string }
  | { status: "pending_received"; connectionId: string }
  | { status: "accepted"; connectionId: string }
  | { status: "rejected"; connectionId: string };

export async function getConnectionState(currentUserId: string, otherUserId: string): Promise<ConnectionState> {
  if (currentUserId === otherUserId) return { status: "self" };

  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    },
  });

  if (!connection) return { status: "none" };

  if (connection.status === ConnectionStatus.ACCEPTED) {
    return { status: "accepted", connectionId: connection.id };
  }

  if (connection.status === ConnectionStatus.REJECTED) {
    return { status: "rejected", connectionId: connection.id };
  }

  if (connection.senderId === currentUserId) {
    return { status: "pending_sent", connectionId: connection.id };
  }

  return { status: "pending_received", connectionId: connection.id };
}

export async function requireAcceptedConnection(userId: string, otherUserId: string) {
  const state = await getConnectionState(userId, otherUserId);
  if (state.status !== "accepted") {
    return false;
  }
  return true;
}
