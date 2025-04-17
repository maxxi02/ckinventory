import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typhography";
import { Session } from "@/lib/better-auth/auth.types";
import { format } from "date-fns";

const UserInformation = async ({ session }: { session: Session }) => {
  const {
    user: { id, email, emailVerified, name, createdAt, twoFactorEnabled },
  } = session;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="card-title">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <TypographyP>Id: {id}</TypographyP>
          <TypographyP>Name: {name}</TypographyP>
          <TypographyP>Email: {email}</TypographyP>
          <TypographyP>
            2FA: {twoFactorEnabled ? "Enabled" : "Disabled"}
          </TypographyP>
          <TypographyP>
            Verified: {emailVerified ? "Verified" : "Unverified"}
          </TypographyP>
          <TypographyP>
            Joined at: Verified:{" "}
            {createdAt &&
              format(createdAt, "MMMM-dd-yyyy").replaceAll("-", " ")}
          </TypographyP>
        </CardContent>
      </Card>
    </>
  );
};

export default UserInformation;
