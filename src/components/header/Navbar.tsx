import { FC } from "react";
import Link from "next/link";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
  return (
    <nav className="flex gap-8 justify-center items-center font-semibold p-4">
      <Link href="/">Home</Link>
      <Link href="">Shop</Link>
      <Link href="">Blog</Link>
      <Link href="">Profile</Link>
    </nav>
  );
};

export default Navbar;
