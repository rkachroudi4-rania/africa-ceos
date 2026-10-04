import { Profile, User } from "@prisma/client";
import { ConnectionState } from "@/lib/connections";

export type PublicProfile = Pick<
  Profile,
  | "id"
  | "photo"
  | "firstName"
  | "lastName"
  | "company"
  | "position"
  | "country"
  | "city"
  | "biography"
  | "sector"
  | "website"
  | "linkedin"
> & {
  userId: string;
};

export type SessionUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  name?: string | null;
  image?: string | null;
};

export type UserWithProfile = User & { profile: Profile | null };

export type ConnectionBadge = ConnectionState;
