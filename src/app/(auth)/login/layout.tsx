"use client";
import ShopNav from "@/components/header/ShopNav";

export const metadata = {
  title: "Login",
  description: "Generated by create next app",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ShopNav />
      {children}
    </div>
  );
}