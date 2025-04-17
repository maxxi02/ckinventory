import React, { Suspense } from "react";
import { ResetPasswordForm } from "../_components/auth-form";

const ResetPassword = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPassword;
