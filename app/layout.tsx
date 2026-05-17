import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PoysaPath — Track every taka, every day",
  description:
    "Multi-user daily expense tracker in BDT with AI-assisted quick entry.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
