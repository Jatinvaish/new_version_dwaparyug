import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { SelectQuery } from "@/lib/database";
import { errorResponse } from "@/lib/api-response";

const JWT_SECRET = process.env.JWT_SECRET as string;
const AUTH_TOKEN_COOKIE_EXPIRY = parseInt(process.env.AUTH_TOKEN_COOKIE_EXPIRY || "1296000"); // 6 months in seconds

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials as {
            email: string;
            password: string;
          };

          const foundUser: any = await SelectQuery(
            `SELECT u.*, ur.name as role_name FROM users u
             JOIN user_roles ur ON u.role_id = ur.id
             WHERE u.email = $1 LIMIT 1`,
            [email]
          );

          if (!foundUser || foundUser.length === 0) {
            const err = errorResponse("User not found", 404);
            throw new Error((await err.json()).message);
          }

          const user = foundUser[0];

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            const err = errorResponse("Incorrect password", 401);
            throw new Error((await err.json()).message);
          }

          delete user.password;

          // Ensure name is always a string. Use full_name or a combination, with a fallback.
          const userName = user.full_name || `${user.first_name} ${user.last_name}` || 'Anonymous';

          const token = generateToken({
            userId: user.id,
            email: user.email,
            name: userName,
            role: user.role_name,
          });

          return {
            ...user,
            accessToken: token,
          };
        } catch (err: any) {
          const fallback = errorResponse("Authentication failed", 500);
          throw new Error(err?.message || (await fallback.json()).message);
        }
      },
    }),
  ],
  secret: JWT_SECRET,
  session: {
    strategy: "jwt",
    maxAge: AUTH_TOKEN_COOKIE_EXPIRY,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Ensure name is always a string, with a fallback
        const userName = (user as any).full_name || (user as any).name || 'Anonymous';

        token.accessToken = (user as any).accessToken;
        token.userId = (user as any).id;
        token.email = (user as any).email;
        token.name = userName;
        token.role = (user as any).role_name;
      }

      if (account && (account.provider === 'google' || account.provider === 'github')) {
        // Here, the 'user' object from NextAuth might have a 'name' that's potentially null or undefined.
        // We'll use a similar check.
        const userName = user.name || 'Anonymous';

        const role = 'Donor'; // Placeholder for OAuth user role

        const customToken = generateToken({
          //@ts-ignore
          userId: user.id,
          //@ts-ignore
          email: user.email,
          name: userName,
          role: role,
          provider: account.provider,
        });
        token.accessToken = customToken;
        token.userId = user.id;
        token.email = user.email;
        token.name = userName;
        token.role = role;
      }

      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.user.id = token.userId;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.role = token.role;

      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  debug: process.env.NEXT_PUBLIC_APP_ENV !== "production",
};

// Updated the payload to make 'provider' optional
export function generateToken(payload: {
  userId: number;
  email: string;
  name: string;
  role: string;
  provider?: string;
}): string {
  const expirationTime: any = Math.floor(AUTH_TOKEN_COOKIE_EXPIRY / 3600) + 'h'; // Convert seconds to hours
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expirationTime });
}

export function verifyToken(token: string): jwt.JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };