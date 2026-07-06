import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voucher SOR",
  description: "AI-routed digital voucher marketplace",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">
              Voucher SOR
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="hover:text-indigo-600">
                Search
              </Link>
              <Link href="/orders" className="hover:text-indigo-600">
                Order History
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
