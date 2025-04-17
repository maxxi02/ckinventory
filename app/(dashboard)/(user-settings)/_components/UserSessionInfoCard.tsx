import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typhography";
import { Session } from "@/lib/better-auth/auth.types";
import { format } from "date-fns";
import { UAParser } from "ua-parser-js";

const UserSessionInfo = async ({ session }: { session: Session }) => {
  const {
    session: { id, createdAt, userAgent },
  } = session;

  if (!userAgent) {
    return;
  }
  // Parse the user agent
  const parser = new UAParser();
  const result = parser.setUA(userAgent).getResult();

  const device = result.device.vendor || "Unknown Device";
  const os = result.os.name || "Unknown OS";
  const browser = result.browser.name || "Unknown Browser";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="card-title">Session Info</CardTitle>
        </CardHeader>
        <CardContent>
          <TypographyP>Id: {id}</TypographyP>
          <TypographyP>
            Device: {device} ({os}, {browser})
          </TypographyP>
          <TypographyP>
            Logged in at:{" "}
            {createdAt &&
              format(createdAt, "MMMM dd, yyyy").replaceAll("-", " ")}
          </TypographyP>
        </CardContent>
      </Card>
    </>
  );
};

export default UserSessionInfo;
