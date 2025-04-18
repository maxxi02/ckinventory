"use client";
import { authClient } from "@/lib/better-auth/auth-client";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import { MdLogout } from "react-icons/md";

const SignoutItem = () => {
  const router = useRouter();
  return (
    <button
      className="flex items-center justify-between gap-2"
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
      <MdLogout size={18}/>
      Logout
    </button>
  );
};

export default SignoutItem;
