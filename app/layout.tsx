import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lykr",
  description: "أتمتة عملية المبيعات الخاصة بك",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
