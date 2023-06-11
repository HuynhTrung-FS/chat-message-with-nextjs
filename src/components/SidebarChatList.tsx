"use client";
import { pusherClient } from "@/lib/pusher";
// bởi vì có useState nên phải là client-side components.
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";

interface SidebarChatListProps {
  friends: UserA[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

// vì chúng ta muốn display các friends trong component này vì vậy chúng ta cần phải fetch nó trong server-side layout
// và pass list friends xuống side bar chat list
const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  // dùng router để determine user đã xem message hay chưa và chúng ta có thể làm event đó bằng cách
  // => checking nếu pathname có /chat/id thì với mỗi id sẽ hiện đoạn chat của user đó liên quan đến friends có chatId đó.
  const router = useRouter();
  // pathname là một relative path (ex: /dashboard/add chứ ko phải là quyên cụm http://localhost:3000)
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<UserA[]>(friends);

  useEffect(() => {
    // tiến hành tạo một event để listen khi có một message đưa đến.
    // logic: với bất kì đoạn chats nào từ client đến, nó sẽ lắng nghe.
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    // logic: chúng ta sẽ tiến hành subcribe to anyone adding this person as a new friend
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const newFriendHandler = (newFriend: UserA) => {
      console.log("received new user", newFriend);
      setActiveChats((prev) => [...prev, newFriend]);
    };
    const chatHandler = (message: ExtendedMessage) => {
      // to display message from server. First we want to determine if the user should even be notified
      // if I am in url of chat (not in url dashboard, add, or random page,...) I should not be notified via a toast notification that I got a new message because you are in the chat (It's unneccessary)
      // logic: hàm bên dưới sẽ có nhiệm vụ kiểm tra các url nào ko liên quan đến đoạn chat thì sẽ tiến hành toast notification.
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;
      if (!shouldNotify) {
        return;
      }
      // should be notified.
      // logic: event bên dưới sẽ toast ra một component to render a custom toast notification.
      toast.custom((t) => (
        // custom component
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImg={message.senderImg}
          senderMessage={message.text}
          senderName={message.senderName}
        />
      ));

      // after showing the toast custom upon, we want to add this to state unseenMessages(dòng 28).
      // => pushing this message to array unseenMessages
      setUnseenMessages((prev) => [...prev, message]);
      // console.log(unseenMessages.length);
    };
    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", newFriendHandler);
    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

      // we get a memory leak in that sense where the function run multiple times and when they are called
      // because multiple instances are bound to this event. => unbind có mục đích để prevent any memory leaks from happening.
      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
    // bắt buộc phải có các biến dependencies bên dưới như pathname, sessionId, router bởi vì ta muốn chỉ cần có sự thay đổi của các biến trên thì event trên useEffect nó sẽ hoạt động.
    // nếu như ko có biến trên thì ta thao tác chuyển page thì event trên sẽ ko hoạt động.
  }, [pathname, sessionId, router]);
  // useEffect sẽ chạy mỗi khi pathname thay đổi.
  useEffect(() => {
    // đây là cách để chúng ta phát hiện liệu user đã xem tin nhắn hay chưa và nếu họ đang trả lời nó sẽ take các message out of state
    // bởi vì user đã xem tin nhắn.
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);
  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {/* chúng ta muốn friends luôn được sort */}
      {activeChats.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id;
        }).length;
        console.log(unseenMessagesCount);
        return (
          <li key={friend.id}>
            {/* truyền tag a là bởi vì chúng ta luôn muốn coi tin nhắn mới nhất vì a sẽ có một feature là hard refresh */}
            <a
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionId,
                friend.id
              )}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              {friend.name}
              {/* hiển thị số lượng tin nhắn chưa được xem */}
              {unseenMessagesCount > 0 ? (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMessagesCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
