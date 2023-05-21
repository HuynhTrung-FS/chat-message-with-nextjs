import SignOutButton from "@/components/SignOutButton";
import Button from "@/components/ui/Button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { FC } from "react";

async function fetchData() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return [1, 2, 3];
}

const page = async ({}) => {
  const data = await fetchData();
  // next-auth không chỉ làm chức năng login mà còn sử dụng để get session
  const session = await getServerSession(authOptions);
  return (
    <>
      <div>dashboard</div>
      {/* <SignOutButton className="h-full aspect-square" /> */}
    </>
  );
};

export default page;
