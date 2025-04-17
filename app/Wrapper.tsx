import { ThemeProvider } from "@/components/Theme/theme-provider";
import { Toaster } from "react-hot-toast";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="bottom-right" />
      </ThemeProvider>
    </>
  );
};

export default Wrapper;
