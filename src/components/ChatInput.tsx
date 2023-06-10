"use client";
import { FC, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Button from "./ui/Button";
import axios from "axios";
import { toast } from "react-hot-toast";
interface ChatInputProps {
  chatPartner: UserA;
  chatId: string;
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sendMessage = async () => {
    if (!input) return;
    setIsLoading(true);
    try {
      // post xuống server cùng với 2 dữ liệu là đoạn text message và chatId của người gửi
      await axios.post("/api/friends/message/send", { text: input, chatId });
      setInput("");
      // làm vậy để mỗi khi chúng ta post tin nhắn liên tục thì UX sẽ focus lại ô input của tin nhắn để chúng ta tiếp tục nhắn tin
      textareaRef.current?.focus();
    } catch (error) {
      toast.error("SOmething went wrong. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message with ${chatPartner.name}`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sn:leading-6"
        />
        <div
          // sự kiện onClick khi nhấn vào button thì nó sẽ lấy giá trị của textarea current để mà lưu vào database và display trên khung chat
          onClick={() => textareaRef.current?.focus()}
          className="py-2"
          aria-hidden="true"
        >
          <div className="py-px">
            <div className="h-9" />
          </div>
        </div>
        <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            <Button isLoading={isLoading} onClick={sendMessage} type="submit">
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
