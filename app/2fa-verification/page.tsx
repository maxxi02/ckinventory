import { Suspense } from "react";
import TwoFactorForm from "./_components/TwoFactorForm";

const TwoFactorVerification = () => {
  return (
    <Suspense>
      <TwoFactorForm />
    </Suspense>
  );
};

export default TwoFactorVerification;
