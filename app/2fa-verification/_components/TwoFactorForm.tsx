"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { MainButton } from "@/components/MainButton";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/better-auth/auth-client";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

const FormSchema = z.object({
  otp: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});
//twofactor function
const TwoFactorForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      otp: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    await authClient.twoFactor.verifyOtp(
      { code: values.otp },
      {
        onSuccess() {
          toast.success(`Verified successfully`);
          router.push("/dashboard");
        },
        onError(ctx) {
          toast.error(`Something went wrong \n${ctx.error.message}`);
        },
      }
    );
  }
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>2 Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit OTP code we sent to your email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div
                    className="flex items-start justify-start w-full h-fit text-sm whitespace-nowrap"
                    onClick={async () => {
                      try {
                        await authClient.twoFactor.sendOtp();
                        toast.success(`OTP request sent!`);
                      } catch (error) {
                        toast.error(
                          `Something went wrong requesting OTP ${error as Error}`
                        );
                      }
                    }}
                  >
                    <p>
                      Did not receive the code?
                      <span className="text-blue-500 px-1 cursor-pointer">
                        Resend code
                      </span>
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <MainButton
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center w-full md:w-max p-3"
            >
              {isSubmitting ? (
                <Loader className="animate-spin text-center" />
              ) : (
                <>Verify</>
              )}
            </MainButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TwoFactorForm;
