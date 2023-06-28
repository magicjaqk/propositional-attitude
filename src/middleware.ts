import { authMiddleware } from "@clerk/nextjs";

export const runtime = "experimental-edge";

export default authMiddleware();

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
