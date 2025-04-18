import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  MONGODB_URL,
  SENDER_EMAIL,
  SENDER_EMAIL_DEV,
} from "../constants/env";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { resend } from "../resend";
import { twoFactor } from "better-auth/plugins";

const client = new MongoClient(MONGODB_URL);
const db = client.db();

export const auth = betterAuth({
  secret: process.env.AUTH_SECRET,
  database: mongodbAdapter(db),
  emailAndPassword: {
    requireEmailVerification: true,
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from:
          process.env.APP_ENV === "production"
            ? SENDER_EMAIL
            : SENDER_EMAIL_DEV,
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from:
          process.env.APP_ENV === "production"
            ? SENDER_EMAIL
            : SENDER_EMAIL_DEV,
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        const { error } = await resend.emails.send({
          from:
            process.env.APP_ENV === "production"
              ? SENDER_EMAIL
              : SENDER_EMAIL_DEV,
          to: user.email,
          subject: "Approve account deletion",
          text: `Click the link to approve the change: ${url}`,
        });

        if (error) {
          console.log("Something went wrong:", error);
        }
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url }) => {
        const { error } = await resend.emails.send({
          from:
            process.env.APP_ENV === "production"
              ? SENDER_EMAIL
              : SENDER_EMAIL_DEV,
          to: user.email,
          subject: "Approve email change",
          text: `Click the link to approve the change: ${url}`,
        });

        if (error) {
          console.log("Something went wrong:", error);
        }
      },
    },
  },
  appName: "CloudKings Inventory",
  plugins: [
    twoFactor({
      skipVerificationOnEnable: true,
      otpOptions: {
        async sendOTP({ user, otp }) {
          const { error } = await resend.emails.send({
            from:
              process.env.APP_ENV === "production"
                ? SENDER_EMAIL
                : SENDER_EMAIL_DEV,
            to: user.email,
            subject: "2FA verification code",
            text: `Your 2FA Code: ${otp}`,
          });

          if (error) {
            console.log("Something went wrong:", error);
          }
        },
      },
    }),
    nextCookies(),
  ],
});
