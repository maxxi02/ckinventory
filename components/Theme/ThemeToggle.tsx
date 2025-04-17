"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TypographyP } from "../ui/typhography";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="theme-preference">Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <TypographyP>Theme:</TypographyP>
        <div className="flex items-center justify-between gap-2">
          <p>Toggle to dark mode</p>
          <Switch
            className="cursor-pointer"
            checked={theme === "dark"}
            onCheckedChange={handleToggle}
            aria-label="Toggle theme"
          />
        </div>
      </CardContent>
    </Card>
  );
}
