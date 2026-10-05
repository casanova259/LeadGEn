import { auth } from "@/auth";

export default auth((req) => {
  const isAuth = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtected = [
    "/dashboard",
    "/leads",
    "/kanbanleads",
    "/tasks",
    "/settings",
  ].some((path) => pathname.startsWith(path));

  if (isProtected && !isAuth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
