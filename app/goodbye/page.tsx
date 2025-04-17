"use client";
import { MainButton } from "@/components/MainButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const Goodbye = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 text-center">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 md:p-12 transform transition-all duration-300 hover:shadow-xl">
        <div className="mb-8">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Goodbye!</h1>
          <div className="h-1 w-16 bg-indigo-500 mx-auto rounded my-4"></div>
        </div>

        <p className="text-lg text-gray-600 mb-6">
          Your account has been successfully deleted. We&#39;re sorry to see you
          go.
        </p>

        <p className="text-gray-500 mb-8">
          If you change your mind, you can always create a new account and join
          us again!
        </p>

        <MainButton onClick={() => router.push("/")}>
          Return to Homepage
        </MainButton>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Need help? Contact our{" "}
        <Link href="/support" className="text-indigo-600 hover:underline">
          support team
        </Link>
      </p>
    </div>
  );
};

export default Goodbye;
