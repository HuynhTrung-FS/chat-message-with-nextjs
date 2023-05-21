"use client";
// bởi vì có useState nên phải là client-side components.
import { chatHrefConstructor } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface SidebarChatListProps {
  friends: UserA[];
  sessionId: string;
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
      {friends.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id;
        }).length;
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
                <div className="ng-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
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
