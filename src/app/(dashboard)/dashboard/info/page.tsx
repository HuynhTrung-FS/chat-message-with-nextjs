"use client";
import { useRouter } from "next/navigation";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  return (
    <div>
      <h1>Shop Page</h1>
      <button onClick={() => router.push("/dashboard/add")}>
        Go to Add Page
      </button>
    </div>
  );
};

export default page;
