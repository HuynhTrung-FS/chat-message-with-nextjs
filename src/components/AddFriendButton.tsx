"use client";

import { FC, useState } from "react";
import Button from "./ui/Button";
import { addFriendValidator } from "@/lib/validations/add-friend";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddFriendButtonProps {}

// khi ấy addFriend sẽ là dạng ZodObject và chúng ta sẽ sử dụng infer để giải quyết.
type FormData = z.infer<typeof addFriendValidator>;

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false);

  // logic đoạn code dưới của useForm: nếu chúng ta pass một value vào cái input là không hợp lệ
  // nó sẽ handle error states for us , vì thế nó sẽ đưa cho chúng ta một error object mà với object này chúng ta có thể render lên page.
  // và display cho user biết lý do tại sao input lại ko add được
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    // resolver: truyền vào 1 validation resolver (dùng zod)
    resolver: zodResolver(addFriendValidator),
  });
  const addFriend = async (email: string) => {
    try {
      // validatedEmail sẽ là một object có props email là string
      const validatedEmail = addFriendValidator.parse({ email });
      // sau khi đã kiểm tra email đúng định dạng thì nó sẽ được pass to server
      // và trên server chúng ta sẽ validate nó again bởi vì bất cứ ai cũng có thể post anything lên server

      await axios.post("/api/friends/add", {
        email: validatedEmail,
      });
      setShowSuccessState(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError("email", { message: error.message });
        return;
      }
      if (error instanceof AxiosError) {
        setError("email", { message: error.response?.data });
        return;
      }
      setError("email", { message: "something went wrong" });
    }
  };

  const onHandleSubmit = (data: FormData) => {
    addFriend(data.email);
  };
  return (
    <form onSubmit={handleSubmit(onHandleSubmit)} className="max-w-sm ">
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by email
      </label>
      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="you@example.com"
        />
        <Button>Add</Button>
      </div>
      <p className="mt-1 text-sm text-red-600 ">{errors.email?.message}</p>
      {showSuccessState && (
        <p className="mt-1 text-sm text-green-600 ">Friend request send!</p>
      )}
    </form>
  );
};

export default AddFriendButton;
