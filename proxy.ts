import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Never intercept Auth.js internal endpoints
  if (pathname.startsWith("/api/auth")) {
    return;
  }

  const isAuth = !!req.auth;

  const isProtected = [
    "/dashboard",
    "/leads",
    "/tasks",
    "/settings",
  ].some((path) => pathname.startsWith(path));

  if (isProtected && !isAuth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
