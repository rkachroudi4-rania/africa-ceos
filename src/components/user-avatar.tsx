import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function UserAvatar({
  photo,
  firstName,
  lastName,
  className,
}: {
  photo?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      {photo ? <AvatarImage src={photo} alt={`${firstName ?? ""} ${lastName ?? ""}`} /> : null}
      <AvatarFallback>{getInitials(firstName, lastName)}</AvatarFallback>
    </Avatar>
  );
}
