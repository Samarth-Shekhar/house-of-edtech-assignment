import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vetted - AI-Powered Hiring Intelligence",
  description:
    "Transform your hiring process with AI-driven resume screening, candidate scoring, bias detection, and collaborative evaluation. Built for modern recruiting teams.",
  keywords: [
    "hiring",
    "recruitment",
    "AI",
    "resume screening",
    "candidate management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid rgba(63, 63, 70, 0.5)",
              color: "#fafafa",
              borderRadius: "12px",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
