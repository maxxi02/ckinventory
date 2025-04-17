"use client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/better-auth/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

const SignoutItem = () => {
  const router = useRouter();
  return (
    <DropdownMenuItem
      className="flex items-center justify-between gap-3"
      onClick={async () => {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/sign-in"); // redirect to login page
              toast.success(`Logout Successful 😺`);
            },
            onError: (ctx) => {
              console.log(ctx.error.message);
              toast.error(`Logout Successful 😺`);
            },
          },
        });
      }}
    >
      Sign Out
      <LogOut />
    </DropdownMenuItem>
  );
};

export default SignoutItem;
