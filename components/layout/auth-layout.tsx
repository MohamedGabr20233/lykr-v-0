"use client";

import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  headline?: string;
}

export function AuthLayout({ children, headline }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen" dir="rtl">
      {/* Right Side - White with Form (appears first in RTL) */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile Logo */}
        <div className="lg:hidden p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg" />
            <span className="text-2xl text-black">Lykr</span>
          </div>
        </div>

        {/* Form Container - Centered */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        {/* Footer Links */}
        <footer className="flex items-center justify-center gap-6 py-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            الرئيسية
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            الخصوصية
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            الشروط
          </Link>
        </footer>
      </div>

      {/* Left Side - Blue Gradient with Logo & Headline (appears second in RTL) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-blue-200 to-blue-100 flex-col justify-between p-12">
        {/* Logo placeholder - will be replaced with actual logo */}
        <div className="flex items-center gap-2 self-end">
          <div className="w-8 h-8 bg-black rounded-lg" />
          <span className="text-2xl text-black">Lykr</span>
        </div>

        {/* Headline */}
        {headline && (
          <h1 className="text-4xl font-normal text-neutral-950 max-w-md leading-relaxed">
            {headline}
          </h1>
        )}

        {/* Empty div for spacing */}
        <div />
      </div>
    </div>
  );
}
