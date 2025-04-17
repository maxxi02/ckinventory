"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typhography";
import { authClient } from "@/lib/better-auth/auth-client";
import toast from "react-hot-toast";

const EmailVerificationComp = ({ email }: { email: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Email</CardTitle>
      </CardHeader>
      <CardContent>
        <TypographyP>
          We have sent a verification email to your inbox. Please check your
          email and verify your account. If you have already verified, refresh
          this page. If you did not receive the email, you can{" "}
          <span
            className="link cursor-pointer text-blue-500"
            onClick={async () => {
              try {
                await authClient.sendVerificationEmail({
                  email,
                  callbackURL: "/dashboard",
                });
                toast.success(`Verification sent!🐱`);
              } catch (error) {
                toast.error(
                  ` Something went wrong verifying the user😿\n ${error}`
                );
              }
            }}
          >
            request again
          </span>
        </TypographyP>
      </CardContent>
    </Card>
  );
};

export default EmailVerificationComp;
