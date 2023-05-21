import Link from "next/link";
import { FC } from "react";

interface ShopNavProps {}

const ShopNav: FC<ShopNavProps> = ({}) => {
  return (
    <nav className="flex gap-8 justify-center items-center font-semibold p-4">
      <Link href="">Cart</Link>
      <Link href="">Products</Link>
    </nav>
  );
};

export default ShopNav;
