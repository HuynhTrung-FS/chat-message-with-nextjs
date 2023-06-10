import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // câu lệnh bên dưới giúp chúng ta revalidate lại email từ input của client.
    // mặc dù bên client chúng ta cũng đã validate email rồi nhưng chúng ta nên validate nó 1 lần nữa.

    // lưu ý: chỉ có get request có cache là default hoạt động
    const { email: emailToAdd } = addFriendValidator.parse(body.email);
    console.log("get id", emailToAdd);

    // kiểm tra idToAdd có trong database trả về không.
    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`
    )) as string;

    console.log("idToAdd: ", idToAdd);
    // nếu không có idToAdd là null thì báo lỗi như bên dưới
    if (!idToAdd) {
      return new Response("This person does not exist", { status: 400 });
    }
    // lấy dữ liệu trong session
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized.", { status: 401 });
    }
    // so sánh id trong session với id lấy từ database
    if (idToAdd === session.user.id) {
      return new Response("You can not add yourself as a friend", {
        status: 400,
      });
    }
    // check if user is already added => you can add them again
    // redis là một unstructured kind of array of data

    // thêm cụm :incoming_friend_requests dùng để store any incoming friend requests

    // nếu mà đúng (khi id của incoming friends ko có trong list fr đã tồn tại trong redis) thì nó sẽ thêm vào database đồng thời return về 1
    // còn nếu sai thì nó sẽ ko thêm và return về 0
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;
    if (isAlreadyAdded) {
      return new Response("Already added this user", { status: 400 });
    }

    // check nếu cả hai đã là bạn
    // logic: chúng ta sẽ checking in the friend list of the current user that is logged in that's the ID to add already exist
    // we could check the other way around , it can't be one-side (nghĩa là khi chúng ta accept thì chúng ta cập nhật cho cả hai bên)
    // bạn a accept bạn b thì trong list fr của a sẽ có b và ngược lại list fr của b sẽ a.
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;
    if (isAlreadyFriends) {
      return new Response("Already friends with this user", { status: 400 });
    }

    // function notify all clients that this person has been added.
    // toPusherKey("user:${idToAdd}:incoming_friend_requests") chính là 1 channel chúng ta sẽ gửi message (cái mà chúng ta đã subcribe phía front end bên file FriendRequest phần useEffect)
    // biến tiếp thao cái channel phải giống như biến đầu tiên của hàm bind bên front end (dòng 43)
    // biến cúi cùng là data that we want to send along in this request. (chuyển data này lên functionRequestHandler trong file Friendrequest)
    console.log("trigger pusher");
    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      "incoming_friend_requests",
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      }
    );

    // nghĩa là adding một id của friends vào trong redis
    await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);
    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request ", { status: 400 });
  }
}
