import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/daily-log/:path*",
    "/clients/:path*",
    "/services/:path*",
    "/periodos/:path*",
    "/reports/:path*",
    "/api/((?!auth).*)",
  ],
};
