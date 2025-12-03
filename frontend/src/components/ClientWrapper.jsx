//src/components/ClientWrapper.jsx
'use client'
import dynamic from "next/dynamic";
import GameLoading from "./GameLoading";
import React from "react";

const NoSsrWrapper = ({ children }) => <>{children}</>

const DynamicNoSsrWrapper = dynamic(
  () => Promise.resolve(NoSsrWrapper),
  {
    ssr: false,
    loading: () => <GameLoading />
  });

export default function ClientWrapper({ children }) {
  return (
    <DynamicNoSsrWrapper>
      {children}
    </DynamicNoSsrWrapper>
  );
}