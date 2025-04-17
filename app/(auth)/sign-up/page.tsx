import React, { Suspense } from "react";
import { SignupForm } from "../_components/auth-form";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signup",
};
const page = () => {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
};

export default page;
