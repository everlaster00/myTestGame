import type { Metadata } from "next";
import ClientWrapper from "@@/ClientWrapper";
import GameCanvas from "@~/GameCanvas";
export const metadata: Metadata = {
  title: "코드 아일랜드",
  description: "게임 실행 중",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientWrapper >
        <GameCanvas />
      </ClientWrapper>
        {children}
    </>
  );
}
