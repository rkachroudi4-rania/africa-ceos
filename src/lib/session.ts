import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/errors";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError(401, "You must be signed in to continue.");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new ApiError(403, "Administrator access is required.");
  }
  return user;
}
