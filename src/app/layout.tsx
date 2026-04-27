import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { LoadingProvider } from '@/components/LoadingProvider';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ClientLayout } from '@/components/ClientLayout';

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
    <LoadingProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Fonts are managed via @import in globals.css for KPCA brand */}
        </head>
        <body>
          <ClientLayout>{children}</ClientLayout>
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
    </LoadingProvider>
  );
}
