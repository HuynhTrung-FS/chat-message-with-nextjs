"use client";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  // vì ở đây mình mún sử dụng session id để xử lý logic mà ở đây chỉ là một component nên chỉ cần pass sessionId thôi, không cần phải lấy sessionId.
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId,
}) => {
  // sử dụng router để navigate từng page hoặc để refresh
  const router = useRouter();

  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );

  useEffect(() => {
    // sử dụng pusherClient để subcribe to any changes the server provides
    // ở đây chúng ta muốn subcribe đến với các incoming friend requests.
    // có một vấn đề với pusherClient là you can't use colons(dấu hai chấm) in the subcribe name that isn't considered an invalid characters => vì vậy we need to create a little function
    // => hàm toPusherKey sẽ thực hiện việc chuyển các dấu : thành dấu __
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );
    // function friendRequestHandler will handle whenever this event occurs
    // logic: chúng ta có thể dùng state friendRequests (dòng 22) để map over các request friends và display nó lên front end.
    const friendRequestHandler = ({
      senderId,
      senderEmail,
    }: IncomingFriendRequest) => {
      // tiến hành add current request mà nó sẽ bao gồm senderId và senderEmail (bên file route.ts trong folder /api/friends/add dòng 80) trả về
      setFriendRequests((prev) => [...prev, { senderId, senderEmail }]);
    };

    // tiếp theo tiến hành bind something to happen whenever this function occurs. we're just listening does this occurs
    // but we're not telling Pusher what to do when it actually occurs so we can say pusherClient.bind() because we're on the client side
    // we're saying whenever an event of this name (incoming_friend_requests) happens. This is we call separately on the backend
    // so on the backend we will say trigger a function with this name (incoming_friend_requests)
    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    // cleanup function dùng để pushClient unsubcribe sau khi chúng ta đã subcribe trước đó (coi đoạn code trên)
    // và unbind function friendRequestHandler from that event. (dùng để prevent any memory leaks from happening bởi vì khi useEffect run multiple times, multiple instances are bound to this event which is not ideal.)
    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  // tạo một event handlers khi chúng ta accept lời mời kết bạn
  const acceptFriends = async (senderId: string) => {
    // ở đây vì component là ở phía client side (để ý "use client") nên chúng ta cần tạo 1 endpoints để thao tác.
    await axios.post("/api/friends/accept", { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );
    // dùng để refresh lại cái chỉ số màu đỏ thông báo (ở chỗ thông báo số lượng request) khi chúng ta đã accept friend đó rồi.
    // để refresh lại toàn bộ program => giúp cho unseenRequestCount được tính lại.
    router.refresh();
    router.prefetch("/dashboard");
  };

  // tạo một event handlers khi chúng ta deny lời mời kết bạn
  const denyFriends = async (senderId: string) => {
    // ở đây vì component là ở phía client side (để ý "use client") nên chúng ta cần tạo 1 endpoints để thao tác.
    await axios.post("/api/friends/deny", { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );
    // dùng để refresh lại cái chỉ số màu đỏ thông báo (ở chỗ thông báo số lượng request) khi chúng ta đã accept friend đó rồi.
    // để refresh lại toàn bộ program => giúp cho unseenRequestCount được tính lại.
    router.refresh();
  };
  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button
              onClick={() => acceptFriends(request.senderId)}
              aria-label="accept friend"
              //   lưu ý: flex items-center justify-center === grid place-items-center => đều căn giữa các container trong div
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>
            <button
              onClick={() => denyFriends(request.senderId)}
              aria-label="deny friend"
              //   lưu ý: flex items-center justify-center === grid place-items-center => đều căn giữa các container trong div
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
