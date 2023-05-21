"use client";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

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
