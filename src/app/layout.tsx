import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "3D Print Cost Calculator",
  description: "Internal tool for 3D print costing and pricing."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
