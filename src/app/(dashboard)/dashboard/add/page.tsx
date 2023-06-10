import AddFriendButton from "@/components/AddFriendButton";
import { FC } from "react";

const page: FC = () => {
  // test skeletion (bỏ FC ở trên)
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <AddFriendButton />
    </main>
  );
};

export default page;
