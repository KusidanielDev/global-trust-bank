import NextAuth from "next-auth"; // ✅ from next-auth
import { authOptions } from "@/lib/auth"; // your config only

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
