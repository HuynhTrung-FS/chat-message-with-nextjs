import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// withAuth sẽ nhận vào 1 cái callback
export default withAuth(
  async function middleware(req) {
    // console.log(req.cookies);
    const pathname = req.nextUrl.pathname;
    // Manage route protection
    // chúng ta cần phải access đến những nơi user muốn navigate.
    // TÌM HIỂU SAU: logic của func getToken(): nó sẽ auto sử dụng next auth secret bên file .env để decrypt hoặc JWT và sẽ trả về kết quả là một token

    // lấy token của session trong cookies sau khi đăng nhập vào.
    const isAuth = await getToken({ req });
    console.log("isAuth: ", isAuth);
    const isLoginPage = pathname.startsWith("/login");

    const sensitiveRoutes = ["/dashboard"];
    //   some sẽ trả về là false hoặc true
    const isAccessingSensitiveRoute = sensitiveRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // xác minh trường hợp: nếu user đã ở trang đăng nhập gòi, tiếp tục kiểm tra isAuth đã validate chưa? rồi mới tạo 1 response redirect tới dashboard
    if (isLoginPage) {
      if (isAuth) {
        // nếu họ đã authenticated thì user có thể redirect về ttp://localhost:3000/dashboard
        // pass req.url để tạo ra 1 baseURL. khi đấy, req.url sẽ là http://localhost:3000 hoặc domain nào đó.
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      // nếu như isAuth là invalidate (nghĩa là user ko login hoặc login sai) return một method next() của NextResponse
      // => có nhiệm vụ pass các requests trở về original path (đó là path /Login, nghĩa là nó trở về lại Login Page) thay vì phải redirect một trang nào đó.
      return NextResponse.next();
    }

    // nếu như isAuth là invalidate và chúng ta try to access a sensitiveRoute thì chúng ta thực hiện logic không cho phép
    // req.url sẽ là http://localhost:3000
    if (!isAuth && isAccessingSensitiveRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // logic: khi đường dẫn là http://localhost:3000/ thì nó sẽ vào page của dashboard lun chứ ko cần phải http://localhost:3000/dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    // hàm callbacks này bên dưới always được call, mỗi khi người dùng vào trang web của chúng ta.
    // nếu chúng ta ko có hàm callbacks này, thì chúng ta sẽ nhận được infinite redirect và sẽ bị error trên browser
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);
// config này sẽ được determine via a match or property
// matchter dùng để xác định các router trong front end cần phải sử dụng middleware
// chú ý: /dashboard/:path* nghĩa là sẽ áp dụng các router như /dashboard, /dashboard/add,/dashboard/adc/xyz,...
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
