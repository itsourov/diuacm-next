import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    name: string;
    image?: string | null;
  };
  className?: string;
}

export default function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("relative", className)}>
      <AvatarImage
        src={user.image || undefined}
        alt={user.name}
        className="object-cover"
      />
      <AvatarFallback className="uppercase">
        {user.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")}
      </AvatarFallback>
    </Avatar>
  );
}