"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { User } from "lucide-react";

interface UserTagProps {
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showEmail?: boolean;
  onClick?: () => void;
}

export function UserTag({
  name,
  email,
  size = "md",
  className,
  showEmail = false,
  onClick,
}: UserTagProps) {
  const getInitials = (
    name: string | null | undefined,
    email: string | null | undefined
  ): string => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getSizeClasses = (size: "sm" | "md" | "lg") => {
    switch (size) {
      case "sm":
        return {
          container: "gap-2",
          avatar: "h-6 w-6",
          name: "text-sm",
          email: "text-xs",
        };
      case "md":
        return {
          container: "gap-3",
          avatar: "h-8 w-8",
          name: "text-sm",
          email: "text-xs",
        };
      case "lg":
        return {
          container: "gap-4",
          avatar: "h-10 w-10",
          name: "text-base",
          email: "text-sm",
        };
    }
  };

  const getDicebearUrl = (
    name: string | null | undefined,
    email: string | null | undefined
  ): string => {
    const seed = name || email || "user";
    return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(
      seed
    )}`;
  };

  const sizeClasses = getSizeClasses(size);
  const initials = getInitials(name, email);
  const displayName = name || email || "Unknown User";
  const dicebearUrl = getDicebearUrl(name, email);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center",
        sizeClasses.container,
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={handleClick}
    >
      <Avatar className={sizeClasses.avatar}>
        <AvatarImage src={dicebearUrl} alt={name || "User"} />
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <span className={cn("font-medium", sizeClasses.name)}>
          {displayName}
        </span>
        {showEmail && email && (
          <span className={cn("text-muted-foreground", sizeClasses.email)}>
            {email}
          </span>
        )}
      </div>
    </div>
  );
}
