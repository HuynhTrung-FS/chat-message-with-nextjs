import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import { FC } from "react";
import Messages from "@/components/Messages";
import ChatInput from "@/components/ChatInput";

interface pageProps {
  params: {
    chatId: string;
  };
}
// function mục đích để fetch all messages bằng cách sử dụng zrange.
// zrange hiểu một cách đơn giản nó sẽ lấy một cái sorted array. (thêm số 0 với -1 là để lấy tất cả data từ a -> z)
async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );
    // vì results chỉ là dạng string nên cần phải chuyển nó về dạng JSON.
    const dbMessages = results.map((message) => JSON.parse(message) as Message);
    console.log("Messages: ", results);
    //tiến hành reverse lại array của message lấy từ database (bởi vì array message của db nó sẽ theo thứ tự từ mới nhất đến muộn nhất)
    const reverseDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reverseDbMessages);

    return messages;
  } catch (error) {
    notFound();
  }
}

const page = async ({ params }: pageProps) => {
  const { chatId } = params;
  const session = await getServerSession(authOptions);
  if (!session) notFound();
  // khi đó user sẽ gồm các thuộc tính có trong session.
  const { user } = session;

  // split cái params đằng sau: khi đó url sẽ là /chat/userId1--userId2
  // câu hỏi: tại sao lại đặt 2 dấu "-" => bởi vì nếu đặt 1 dấu thì url sẽ là một ý nghĩa khác (thường là tên của nội dung đó,...)
  const [userId1, userId2] = chatId.split("--");
  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }
  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  // get thông tin email, name của chat partner (lưu ý chỗ này có thể dùng fetchRedis để sử dụng thay vì dùng db)
  const chatPartnerRaw = (await fetchRedis(
    "get",
    `user:${chatPartnerId}`
  )) as string;
  console.log("user1:", userId1);
  console.log("user2: ", userId2);
  console.log("user: ", user.id);
  console.log("chatpartner: ", chatPartnerId);
  console.log(chatPartnerRaw);
  const chatPartner = JSON.parse(chatPartnerRaw) as UserA;
  const initialMessages = await getChatMessages(chatId);
  return (
    <div className="flex-1 justify-between flex flex-col max-h max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 borther-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                // referrerPolicy dùng để google images được work
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.image} profile picture`}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>
            <span className="text-sm text-gray-600">{chatPartner.email}</span>
          </div>
        </div>
      </div>
      <Messages
        chatId={chatId}
        chatPartner={chatPartner}
        sessionImg={session.user.image}
        initialMessages={initialMessages}
        sessionId={session.user.id}
      />
      <ChatInput chatId={chatId} chatPartner={chatPartner} />
    </div>
  );
};

export default page;
