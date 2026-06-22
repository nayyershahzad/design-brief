import type { ReactNode } from "react";
// Order matters: Tailwind's layers first (hand-owned), then the design-brief
// token layer (machine-owned, regenerated on each lock/export).
import "./tailwind.css";
import "./globals.css";

export const metadata = {
  title: "design-brief sample",
  description: "A target Next.js app proving a design-brief export drops in cleanly.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
