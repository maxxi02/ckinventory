import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Session } from "better-auth";

async function getMiddleWareSession(req: NextRequest) {
  try {
    const { data: session } = await axios.get<Session>(
      "/api/auth/get-session",
      {
        baseURL: req.nextUrl.origin,
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      }
    );
    return session;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionData = await getMiddleWareSession(req);

  // Define public and private routes
  const publicRoutes = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/email-verification",
  ];
  const privateRoutes = [
    "/dashboard",
    "/profile",
    "/settings",
    "/reset-password",
  ];

  // Check if the current path is a private route
  const isPrivateRoute = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Handle private routes - redirect to sign-in if no session
  if (isPrivateRoute && !sessionData) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Handle public routes - redirect to dashboard if already authenticated
  if (isPublicRoute && sessionData) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Otherwise, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Include all routes that need authentication checks
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
