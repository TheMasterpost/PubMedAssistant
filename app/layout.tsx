import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import Sidebar from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PubMed Assistant",
  description: "Your AI-powered PubMed research assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            <ClientLayout>
              <main className="flex min-h-screen">
                {children}
              </main>
            </ClientLayout>
          </main>
        </div>
      </body>
    </html>
  );
} 