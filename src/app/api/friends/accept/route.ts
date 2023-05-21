import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { string, z } from "zod";

// ở đây cần phải đặt tên function là post vì chúng ta muốn thực hiện 1 endpoint (/api/friends/accept) là post
// nếu đặt tên khác thì endpoint sẽ bị sai logic. (nếu đặt get thì nó sẽ ko chạy được)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // check id có đúng định dạng hay ko (validate nó) => dùng zod
    // chúng ta mong muốn id là một string vì vậy truyền là z.string()
    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    // check session bởi vì nếu như 1 request được tạo ra và hoàn toàn valid thì user này được cho phép add someone là friend (trong trường hợp này bạn và tôi là friends).
    // trước hết chúng ta sẽ xác định ai là người make request bằng getServerSession()
    const session = await getServerSession(authOptions);
    // nếu như user ko login thì sẽ ko có session
    if (!session) {
      // nếu không thì sẽ trả về một response lỗi.
      return new Response("Unauthorized", { status: 401 });
    }

    // nếu như nó đã có session thì chúng ta sẽ verify both users are not already friends
    // nghĩa là check nếu nó đã là bạn rổi thì ko add.
    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    );
    if (isAlreadyFriends) {
      return new Response("Already friends", { status: 400 });
    }
    // logic của đoạn code dưới: lấy id của friends (đang chờ để xác thực có là bạn hay ko?) so sánh với id của email chúng ta muốn add
    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    );
    if (!hasFriendRequest) {
      return new Response("No friend request", { status: 400 });
    }

    // tiến hành add person mình gõ vào list friends.
    // ở đây chúng ta ko cần phải fetch vì chúng ta thực hiện phương thức post hoặc chỉnh sửa data trong redis và nó sẽ ko cần cache trong nextjs
    // => chúng ta ko cần wierd caching behavior
    await db.sadd(`user:${session.user.id}:friends`, idToAdd);
    await db.sadd(`user:${idToAdd}:friends`, session.user.id);

    // chúng ta muốn show các outbound from request (các request từ những người mình có thể quen).
    // await db.srem(`user:${idToAdd}:outbound_friend_requests`, session.user.id);

    // srem dùng để remove cái incoming friend đó đi vì ở trên mình đã add thành công rồi
    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd);

    return new Response("OK");
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 400 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
