import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";
import { fetchRedis } from "@/helpers/redis";

function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || clientId.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }
  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }
  return { clientId, clientSecret };
}

export const authOptions: NextAuthOptions = {
  // adapter có thể hiểu như chúng ta kết nối với database của upstash redis
  // adapter này có chức năng set database cho chúng ta mỗi khi các hàm callbacks được chạy.
  // hoạt động như 1 cache tức là nếu database đó đã có  r thì ko lưu nữa.
  adapter: UpstashRedisAdapter(db),
  session: {
    // we don't handle the session on the database which allows us the reason we're doing that is so we can verify the session
    // in middleware later on to protect our routes way more easily than we could if we kept the session and database.
    strategy: "jwt",
  },
  pages: {
    // define custom page nào là cho phép quyền auth.
    signIn: "/login",
  },
  // secret: process.env.JWT_SECRET,
  // các provider này là để xác định các kênh social media nào được quyền.
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
  ],
  // callbacks are actions that are taken when certain events happen that next-auth detects
  // callbacks là một object chúng ta có thể pass jwt, session, redirect, signIn,... hoặc những sự kiện sẽ xảy ra sau khi
  // chúng ta sign in.
  callbacks: {
    // trong callbacks có sẵn 2 hàm jwt và session chúng ta chỉ cần gọi ra điều chỉnh code trong này.
    // giá trị user là được tạo bởi next-auth trả về từ google.
    // còn giá trị token là được tự động tạo bởi adapter. (dòng 23) => adapter chịu trách nhiệm tạo ID
    // user với token liên hệ với nhau (xem bên file info.md )
    async jwt({ token, user }) {
      const dbUserResult = (await fetchRedis("get", `user:${token.id}`)) as
        | string
        | null;
      console.log("user: ", user);
      console.log("result", dbUserResult);
      console.log("token2", token);
      if (!dbUserResult) {
        // lúc đầu token cũng chỉ có 4 tham số
        // name?: string | null
        // email?: string | null
        // picture?: string | null
        // sub?: string
        // => chúng ta phải chỉnh sửa bằng cách thêm id: string bên file next-auth.d.ts
        if (user) {
          // logic: Thêm thông tin người dùng user vào token.
          token.id = user!.id;
        }
        console.log("token3", token);
        // cái token mình return bên dưới ngay sau đó sẽ được set as JWT (do mình bỏ trong callbacks có tên là jwt)
        return token;
      }

      // tại sao lại parse vì khi đó dbResult nó sẽ trả về value ko đúng định dạng JSON đâu. (chính xác là nó trả về dạng string)
      // => nên là cần parse json
      const dbUser = JSON.parse(dbUserResult) as UserA;
      // các giá trị return bên dưới sẽ được return thành JWT Value sau đó hafm async ben duoi se thuc hien logic: lưu vào session token for the user
      // và trong trường hợp này nó sẽ bao gồm các giá trị bên dưới
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },
    async session({ session, token }) {
      // mặc định session chỉ có 3 tham số là name, email, image
      // nên chúng ta phải chỉnh sửa bên file next-auth.ts (bằng declare, chỉnh trong các module next-auth) thêm id: string
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      console.log("tokenSesstion", token);
      // console.log("session: ", session);
      return session;
    },
    redirect() {
      return "/dashboard";
    },
  },
};
