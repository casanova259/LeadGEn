"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export type UserMenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function UserMenu({ user }: UserMenuProps) {
  const displayName = user.name || user.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-white/10 transition hover:ring-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="User account menu"
        >
          <Avatar className="h-8 w-8">
            {user.image && <AvatarImage src={user.image} alt={displayName} />}
            <AvatarFallback className="bg-slate-800 text-xs font-medium text-slate-200">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-medium leading-none text-foreground">{displayName}</p>
            {user.email && (
              <p className="text-[11px] leading-none text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-xs text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 gap-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="size-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
