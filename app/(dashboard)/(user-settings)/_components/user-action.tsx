"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Session } from "@/lib/better-auth/auth.types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainButton } from "@/components/MainButton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/better-auth/auth-client";
import toast from "react-hot-toast";
import { Loader, Loader2, Trash } from "lucide-react";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Avatar } from "@/components/ui/avatar";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export const UserActions = ({ session }: { session: Session }) => {
  const {
    user: { image },
  } = session;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="card-title">User Action</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <CardDescription>User Profile</CardDescription>
        <Avatar className="w-full h-auto">
          <AvatarImage
            className="cursor-pointer w-[200px] h-[200px] object-cover rounded-full"
            src={image ? image : "https://github.com/shadcn.png"}
          />
        </Avatar>
      </CardContent>
      <CardContent className="space-y-8">
        <UpdateUserInfo session={session} />
        <div className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        <UpdateEmail session={session} />
        <div className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        <Enable2Fa session={session} />
        <div className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        <UpdatePassword />
        <div className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        <h1 className="text-red-500 text-center">Danger Zone</h1>
        <DeleteUser />
      </CardContent>
    </Card>
  );
};

const updateUserInfoSchema = z.object({
  image: z.string().url(),
  name: z.string().min(2, "Name must have at least 2 characters").max(100),
});

//Update name and image function
type UpdateUserInfoForm = z.infer<typeof updateUserInfoSchema>;
const UpdateUserInfo = ({ session }: { session: Session }) => {
  const { user } = session;

  const form = useForm<UpdateUserInfoForm>({
    resolver: zodResolver(updateUserInfoSchema),
    defaultValues: {
      image: user?.image || "",
      name: user?.name || "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: UpdateUserInfoForm) {
    const { image, name } = values;
    await authClient.updateUser(
      {
        image: image,
        name: name,
      },
      {
        onSuccess: () => {
          toast.success(`User updated successfully!😺`);
        },
        onError: () => {
          toast.error(`Unable to update user!😿`);
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="Copy link image and paste here."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Nivek Amures" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <MainButton
          type="submit"
          disabled={isSubmitting}
          className="md:w-min px-5"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            <>Save</>
          )}
        </MainButton>
      </form>
    </Form>
  );
};

//Update Email function
const updateEmailSchema = z.object({
  newEmail: z.string().email("Please enter valid email"),
  callBackUrl: z.string(),
});
type UpdateEmailForm = z.infer<typeof updateEmailSchema>;
const UpdateEmail = ({ session }: { session: Session }) => {
  const { user } = session;
  const form = useForm<UpdateEmailForm>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      newEmail: user.email,
      callBackUrl: "/dashboard",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: UpdateEmailForm) {
    await authClient.changeEmail(values, {
      onSuccess: () => {
        toast.success(`Email updated to ${values.newEmail}!😺`, {
          duration: 5000,
        });
      },
      onError: () => {
        toast.error(`Unable to update user email!😿`);
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="newEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="NivekAmures@gmail.com"
                  {...field}
                  type="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <MainButton
          type="submit"
          disabled={isSubmitting}
          className="md:w-min px-5"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            <>Update</>
          )}
        </MainButton>
      </form>
    </Form>
  );
};
//Change password function
const updatePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "New password must have 8 characters")
    .max(100),
  currentPassword: z
    .string()
    .min(8, "Current password must have 8 characters")
    .max(100),
  revokeOtherSessions: z.boolean(), // revoke all other sessions the user is signed into
});
type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;
const UpdatePassword = () => {
  const form = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      newPassword: "",
      currentPassword: "",
      revokeOtherSessions: true,
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: UpdatePasswordForm) {
    await authClient.changePassword(values, {
      onSuccess: () => {
        toast.success(`Password successfully updated!😺`, {
          duration: 5000,
        });
      },
      onError: () => {
        toast.error(`Unable to update password!😿`);
      },
    });
  }

  return (
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
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input placeholder="⦁⦁⦁⦁⦁⦁⦁" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <MainButton
          type="submit"
          disabled={isSubmitting}
          className="md:w-min px-5"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            <>Update</>
          )}
        </MainButton>
      </form>
    </Form>
  );
};

function DeleteUser() {
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <div className="space-y-2 flex flex-col items-start w-full">
      <CardDescription className="text-sm">
        Deleting your account is a permanent action and cannot be undone. This
        should only be used in case of an emergency.
      </CardDescription>
      <MainButton
        className="md:w-max w-full p-2 hover:text-red-500!"
        onClick={async () => {
          await authClient.deleteUser(
            {
              callbackURL: "/goodbye",
            },
            {
              onRequest: () => {
                setIsDeleting(true);
              },
              onResponse: () => {
                setIsDeleting(false);
              },
              onSuccess: () => {
                toast.success(`Please check your Email`);
              },
              onError: () => {
                toast.error(`Account deletion failed`);
              },
            }
          );
        }}
      >
        <p className="flex items-center justify-center gap-2 text-sm ">
          Delete Account
          {isDeleting ? <Loader className="animate-spin" /> : <Trash />}
        </p>
      </MainButton>
    </div>
  );
}

//Enabling the 2 factor authentication
const TwoFactorSchema = z.object({
  state: z.boolean(),
  password: z.string().min(8, "Password must have 8 characters").max(100),
});

type TwoFactorForm = z.infer<typeof TwoFactorSchema>;
const Enable2Fa = ({ session }: { session: Session }) => {
  const form = useForm<TwoFactorForm>({
    resolver: zodResolver(TwoFactorSchema),
    defaultValues: {
      state: session?.user?.twoFactorEnabled || false,
      password: "",
    },
  });
  const {
    formState: { isSubmitting },
  } = form;
  async function onSubmit(data: TwoFactorForm) {
    const { state, password } = data;
    if (state) {
      await authClient.twoFactor.enable(
        { password },
        {
          onSuccess: () => {
            toast.success(`2 Factor Authentication enabled!😺`);
          },
          onError: () => {
            toast.error(`Something went wrong enabling 2FA!😿`);
          },
        }
      );
    }
    if (!state) {
      await authClient.twoFactor.disable(
        { password },
        {
          onSuccess: () => {
            toast.success(`2 Factor Authentication disabled!😺`);
          },
          onError: () => {
            toast.error(`Something went wrong disabling 2FA!😿`);
          },
        }
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  2 Factor Authentication
                </FormLabel>
                <FormDescription className="text-base">
                  Enable or disable 2 Factor Authentication to add an extra
                  layer of security to your account.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-readonly
                />
              </FormControl>
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
            <>{form.watch("state") ? "Enable" : "Disable"}</>
          )}
        </MainButton>
      </form>
    </Form>
  );
};
