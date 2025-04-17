import React, { Suspense } from "react";
import { Metadata } from "next";
import { SigninForm } from "../_components/auth-form";

export const metadata: Metadata = {
  title: "Signin",
};

const page = () => {
  return (
    <Suspense>
      <SigninForm />
    </Suspense>
  );
};

export default page;
