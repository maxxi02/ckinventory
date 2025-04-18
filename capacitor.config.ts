import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "ckinventory",
  webDir: "public",
  server: {
    url: "https://ckinventory.vercel.app/",
    cleartext: true,
  },
};

export default config;
