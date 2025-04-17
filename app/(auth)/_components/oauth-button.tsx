"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { IconBrandGoogle } from "@tabler/icons-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/better-auth/auth-client";
import { MainButton } from "@/components/MainButton";

export function GoogleButton() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  return (
    <MainButton
      disabled={isGoogleLoading}
      className="bg-[#DB4437] text-white after:flex-1 hover:bg-[#DB4437]/90 w-full flex items-center justify-center"
      onClick={async () => {
        setIsGoogleLoading(true);
        try {
          await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
          });
          toast.success(`Success!`);
        } catch (error) {
          toast.error(`Something went wrong\n ${error as Error}`);
        } finally {
          setIsGoogleLoading(false);
        }
      }}
    >
      <span className="pointer-events-none me-2 flex items-center justify-center w-full">
        {!isGoogleLoading ? (
          <div className="flex items-center justify-center gap-2">
            <IconBrandGoogle size={22} aria-hidden="true" />
            Google
          </div>
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </span>
    </MainButton>
  );
}
