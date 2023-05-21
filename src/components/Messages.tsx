"use client";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { format } from "date-fns";
import { FC, useRef, useState } from "react";
import Image from "next/image";

interface MessagesProps {
  // Message là tới từ cái validator.
  initialMessages: Message[];
  sessionId: string;
  sessionImg: string | null | undefined;
  chatPartner: UserA;
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  sessionImg,
  chatPartner,
}) => {
  // sử dụng useState bên dưới mục đích: khi user send a message chúng ta có thể put nó vào state để show trực tiếp đến user thay vì chúng ta phải refresh page.
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };
  return (
    // flex-col-reverse là dùng để display các message từ muộn nhất đến mới nhất (sẽ turn everything upside down)
    <div
      id="messages"
      // lưu ý các thuộc tính: scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch sẽ ko có trong tailwind
      // vì  vậy chúng ta cần phải define chúng bên file global.css
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      {/* mục đích tạo ra div bên dưới là để chúng ta reverse cái order và khi chúng ta send a message thì nó tự scroll cái message đó (nếu ko scroll thì tin nhắn sẽ bị thụt phía dưới) */}
      <div ref={scrollDownRef} />
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;
        // nếu như chúng ta có nhìu messages từ duy nhất một user bởi vì sẽ có một image nó sẽ được show ở phía dưới từng message.
        // và nó nên chỉ show ở message cuối => vì vậy chúg ta cần biết next message từ duy nhất 1 user.

        // logic code bên dưới, chúng ta sẽ check message tại vị trí index có là message current index của senderId hay không.
        // nếu đúng, thì sẽ có next message từ same user.
        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;
        return (
          <div
            className="chat-message"
            key={`${message.id}-${message.timestamp}`}
          >
            {/* bởi vì nếu message là từ user đã login thì chúng ta sẽ muốn display nó bên right side và nếu ko phải thì display bên left side */}
            {/* sử dụng cn trong folder helper bởi vì logic sẽ có nhiều conditional css */}
            <div
              className={cn("flex items-end", { "justify-end": isCurrentUser })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    // logic: chỉ khi last message được sent từ same user mới có rounded border
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>
              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  alt="Profile picture"
                  src={
                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                  }
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
