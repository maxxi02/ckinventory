"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MainButton } from "@/components/MainButton";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/better-auth/auth-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { GoogleButton } from "./oauth-button";

const signupFormSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must have at least 8 characters")
    .max(100),
});

type SignupForm = z.infer<typeof signupFormSchema>;
// SIGNUP FORM
export function SignupForm() {
  const { push } = useRouter();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: z.infer<typeof signupFormSchema>) {
    try {
      await authClient.signUp.email(values);
      toast.success(`Success 😺`, { duration: 3000 });
      push(`/email-verification?email=${values.email}`);
    } catch (error) {
      toast.error(`Something went wrong 😿. \n ${(error as Error).message}`, {
        duration: 3000,
      });
    }
  }
  return (
    <div className="w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Signup</CardTitle>
          <CardDescription>Signup to fucking start!</CardDescription>
        </CardHeader>
        <CardContent>
          {/* MAIN FORM HERE */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Nivek Amures" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nivekamures@gmail.com"
                        {...field}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="⦁⦁⦁⦁⦁⦁⦁" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-start">
                      Already have an account?
                      <Link
                        href={"/sign-in"}
                        className="px-1.5 cursor-pointer text-blue-500"
                      >
                        Signin
                      </Link>
                    </p>
                  </FormItem>
                )}
              />

              <MainButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  <>Create account</>
                )}
              </MainButton>

              <div className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          Privacy · Terms · Advertising · Ad Choices · Cookies · ·
          CloudkingsInventory © 2025
        </CardFooter>
      </Card>
    </div>
  );
}

const signinFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(2, "Password must have at least 2 characters")
    .max(100),
});

type SigninForm = z.infer<typeof signinFormSchema>;
//SIGNIN FORM
export function SigninForm() {
  const { push } = useRouter();
  const [isForgotClick, setIsForgotClick] = useState(false);

  const form = useForm<SigninForm>({
    resolver: zodResolver(signinFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: z.infer<typeof signinFormSchema>) {
    const { email, password } = values;
    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: "/dashboard",
      },
      {
        async onSuccess(context) {
          if (context.data.twoFactorRedirect) {
            toast.success(`Success 😺`, { duration: 3000 });
            console.log("Error:", context);
            push("/2fa-verification");
          }
        },
        async onError(context) {
          toast.error(`Something went wrong 😿. \n ${context.error.message}`, {
            duration: 3000,
          });
        },
      }
    );
  }
  return (
    <>
      <div className="w-md z-50">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Signin</CardTitle>
            <CardDescription>Signin to fucking start!</CardDescription>
          </CardHeader>
          <CardContent>
            {/* SIGN IN MAIN FORM */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="nivekamures@gmail.com"
                          {...field}
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="⦁⦁⦁⦁⦁⦁⦁"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-start">
                        Forgot Password?
                        <span
                          onClick={() => setIsForgotClick(true)}
                          className="px-1.5 cursor-pointer text-blue-500"
                        >
                          Click here
                        </span>
                      </p>
                      <div className="w-full flex items-center justify-start">
                        <span className="text-xs">
                          Don&#39;t have an account?{" "}
                          <Link
                            href={"/sign-up"}
                            className="text-blue-500 cursor-pointer"
                          >
                            Sign up
                          </Link>
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
                <MainButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    <>Signin</>
                  )}
                </MainButton>
                <div className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
              </form>
            </Form>
            <GoogleButton />
          </CardContent>
          <CardFooter>
            Privacy · Terms · Advertising · Ad Choices · Cookies · ·
            CloudkingsInventory © 2025
          </CardFooter>
        </Card>
      </div>
      <ForgotPassword
        setIsForgetClick={setIsForgotClick}
        isForgetClick={isForgotClick}
      />
    </>
  );
}

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(2, {
      message: "",
    })
    .email({
      message: "Please enter valid email address",
    }),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
//FORGOT PASSWORD FORM
export function ForgotPassword({
  isForgetClick,
  setIsForgetClick,
}: {
  isForgetClick: boolean;
  setIsForgetClick: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    const { email } = values;
    await authClient.forgetPassword(
      {
        email,
        redirectTo: "/reset-password",
      },
      {
        onSuccess: (ctx) => {
          toast.success(`Reset link sent 😺`, { duration: 3000 });
          console.log(ctx.response);
          setIsForgetClick(false);
        },
        onError: (ctx) => {
          toast.error(`Something went wrong 😿`, { duration: 3000 });
          console.log(ctx.error.message);
        },
      }
    );
  }
  return (
    <Dialog open={isForgetClick} onOpenChange={setIsForgetClick}>
      <DialogContent className="z-100">
        <DialogHeader className="text-start space-y-1">
          <DialogTitle>Password Reset Request</DialogTitle>
          <p className="text-sm opacity-50">
            Enter your email address below to receive a link for resetting your
            password.
          </p>
          {/* MAIN FORM HERE */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nivekamures@gmail.com"
                        {...field}
                        type="email"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <MainButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  <>Submit &rarr;</>
                )}
              </MainButton>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(2, "Password must have at least 2 characters")
    .max(100),
});

type ResetPassForm = z.infer<typeof resetPasswordSchema>;
//RESET-PASSWORD FORM
export function ResetPasswordForm() {
  const { push } = useRouter();

  const form = useForm<ResetPassForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    const { newPassword } = values;
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      return toast.error(`Invalid Token ${token}`);
    }
    await authClient.resetPassword(
      {
        newPassword: newPassword,
        token,
      },
      {
        onSuccess: async (cxt) => {
          toast.success(`New password success😺`, { duration: 3000 });
          console.log("Error:", cxt);
          push("/dashboard");
        },
        onError: async (cxt) => {
          toast.error(`Something went wrong 😿. \n ${cxt.error.message}`, {
            duration: 3000,
          });
        },
      }
    );
  }
  return (
    <div className="w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter your new fucking password</CardDescription>
        </CardHeader>
        <CardContent>
          {/* RESET PASSWORD FORM */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input placeholder="⦁⦁⦁⦁⦁⦁⦁" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <MainButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  <>Submit &rarr;</>
                )}
              </MainButton>
              <div className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          Privacy · Terms · Advertising · Ad Choices · Cookies · ·
          CloudkingsInventory © 2025
        </CardFooter>
      </Card>
    </div>
  );
}
