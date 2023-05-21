import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
type UserId = string;

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
  }
}

declare module "next-auth" {
  interface Session {
    // interface User này là interface có sẵn trong next.js, được sử dụng để định nghĩa user trong next.js
    user: User & {
      id: UserId;
    };
  }
}
