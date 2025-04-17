import { Card, CardContent } from "@/components/ui/card";
import { TypographyH3 } from "@/components/ui/typhography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getServerSession } from "@/lib/action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import SignoutItem from "./SignoutItem";
import { ModeToggle } from "@/components/Theme/ThemeToggle";

export default async function Header() {
  const session = await getServerSession();
  const profile = session?.user?.image;
  const name = session?.user.name;
  return (
    <Card className="p-0">
      <CardContent className="py-2 px-4">
        <header className="w-full h-fit flex items-center justify-between gap-4">
          <div>
            <TypographyH3>Cloudkings Inventory</TypographyH3>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage
                    className="cursor-pointer w-10 h-10 object-cover"
                    src={profile ? profile : "https://github.com/shadcn.png"}
                  />
                  <AvatarFallback>
                    {/* MAP THE INITIALS */}
                    {name
                      ?.split(" ")
                      .map((part) => part.charAt(0).toUpperCase())
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="cursor-pointer">
                <DropdownMenuLabel>Account Action</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <SignoutItem />
                <ModeToggle />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      </CardContent>
    </Card>
  );
}
