"use client";
import { db } from "@/lib/db";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default async function Home() {
  return <button onClick={() => signOut()}>Sign out</button>;
}
