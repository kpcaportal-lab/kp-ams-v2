import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "KP AMS — Assignment Management",
  description: "Kirtane & Pandit Assignment Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#1E293B",
              border: "1px solid #E2E8F0",
              fontWeight: "600",
              fontSize: "14px",
              borderRadius: "10px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
            },
            success: {
              iconTheme: { primary: "#059669", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#DC2626", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
