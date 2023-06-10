import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { messageValidator } from "@/lib/validations/message";
import { nanoid } from "nanoid";
import { User, getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();
    const session = await getServerSession(authOptions);

    // kiểm tra user đã login hay chưa? nếu rồi thì mới cho truyền message xuống server để lưu vào database.
    if (!session) return new Response("Unauthorized", { status: 401 });
    const [userId1, userId2] = chatId.split("--");
    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response("Unauthorized", { status: 401 });
    }
    const friendId = session.user.id === userId1 ? userId2 : userId1;
    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.id}:friends`
    )) as string[];
    const isFriend = friendList.includes(friendId);
    if (!isFriend) {
      return new Response(
        "the other is not your friend. Please add friends before chat",
        { status: 401 }
      );
    }

    const rawSender = (await fetchRedis(
      "get",
      `user:${session.user.id}`
    )) as string;
    const sender = JSON.parse(rawSender) as User;
    // all valid, next , send the message
    const timestamp = Date.now();
    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
    };

    const message = messageValidator.parse(messageData);

    // notify all connected chat room clients
    pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      "incoming-message",
      message
    );

    // chú ý đoạn code từ dòng 51 -> 55:
    // It's only for one certain chat. We don't want to listen all chats. we don't want like a hundred websocket instances if we have 100 chats.
    // => instead what we can do is trigger a chat event and that contains the message information and by that we know which chat this is concerning and also we only have to listen one event
    // => It's very convenient.
    // here code below: function trigger will be for any message that this user receives in any chat so that we can display that on the front-end.
    // => now every messages that we send for the corresponding chats for the user, we are emitting a new message event and that event wil be triggered on the client that receives the message.
    pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), "new_message", {
      ...message,
      senderImg: sender.image,
      senderName: sender.name,
    });

    // all valid, send the message
    await db.zadd(`chat:${chatId}:messages`, {
      // thuộc tính score dùng để sắp xếp theo thứ tự ngày tháng năm (khi chúng ta add vào database thì nó sẽ là zset chứ ko phải set như bth)
      // zset có nghĩa là được thêm vào nhưng được order còn set thì cũng được thêm nhưng không được order.
      score: timestamp,
      member: JSON.stringify(message),
    });
    return new Response("OKE");
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
