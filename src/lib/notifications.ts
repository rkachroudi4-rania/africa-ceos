import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedId?: string;
}) {
  if (!input.userId) return;
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      relatedId: input.relatedId,
    },
  });
}
