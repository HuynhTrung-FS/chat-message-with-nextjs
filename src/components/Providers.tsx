"use client";
import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <div>
      <Toaster position="top-center" />
      {children}
    </div>
  );
};

export default Providers;
