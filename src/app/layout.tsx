import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoMCP — Signal Room",
  description: "A spec-driven, policy-first MCP server creator",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
