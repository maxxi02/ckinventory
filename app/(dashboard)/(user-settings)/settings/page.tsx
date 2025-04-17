import { Metadata } from "next";
import UserInformation from "../_components/UserInformationCard";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/action";
import UserSessionInfo from "../_components/UserSessionInfoCard";
import { UserActions } from "../_components/user-action";
import { ModeToggle } from "@/components/Theme/ThemeToggle";

export const metadata: Metadata = { title: "Dashboard" };

const Dashboard = async () => {
  const session = await getServerSession();
  if (!session) {
    return redirect("/sign-in");
  }
  return (
    <div className="space-y-2">
      <ModeToggle />
      <UserInformation session={session} />
      <UserSessionInfo session={session} />
      <UserActions session={session} />
    </div>
  );
};

export default Dashboard;
