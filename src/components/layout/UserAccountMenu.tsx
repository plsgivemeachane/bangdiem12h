"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserTag } from "@/components/ui/user-tag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, Activity, LogOut } from "lucide-react";
import { USER_ACCOUNT } from "@/lib/translations";
import toast from "react-hot-toast";

export function UserAccountMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(USER_ACCOUNT.TOAST_SUCCESS);
      router.push("/auth/signin");
    } catch (error) {
      console.error(USER_ACCOUNT.ERROR_LOG_PREFIX, error);
      toast.error(USER_ACCOUNT.TOAST_ERROR);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <UserTag
            name={user.name}
            email={user.email}
            size="sm"
            className="cursor-pointer"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <UserTag
            name={user.name}
            email={user.email}
            size="sm"
            showEmail={true}
            onClick={() => router.push("/account")}
          />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push("/account")}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>{USER_ACCOUNT.MENU_PROFILE}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/account/settings")}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>{USER_ACCOUNT.MENU_SETTINGS}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/activity-logs")}
            className="cursor-pointer"
          >
            <Activity className="mr-2 h-4 w-4" />
            <span>{USER_ACCOUNT.MENU_ACTIVITY_LOGS}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{USER_ACCOUNT.MENU_SIGN_OUT}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
