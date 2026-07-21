import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoMCP",
  description: "Spec-driven MCP server creator",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
