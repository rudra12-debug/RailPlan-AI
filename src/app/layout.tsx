import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { RailPlanProvider } from "@/context/RailPlanContext";
import { DemoTourProvider } from "@/context/DemoTourContext";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import { DemoTourModal } from "@/components/common/DemoTourModal";
import { AiChatbot } from "@/components/chat/AiChatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "RailPlan AI | Team Debug Dynasty – SIH 2026",
  description: "Unified AI-Powered Railway Maintenance and Operations Platform across 10 National High-Density Indian Railways Corridors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} min-h-screen bg-[#050814] text-[#F8FAFC] antialiased selection:bg-[#6367FF]/30 selection:text-[#8494FF]`}>
        <AuthProvider>
          <RailPlanProvider>
            <DemoTourProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex flex-1">
                  <Sidebar />
                  <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 max-w-7xl mx-auto w-full overflow-x-hidden">
                    {children}
                  </main>
                </div>
              </div>
              <DemoTourModal />
              <AiChatbot />
            </DemoTourProvider>
          </RailPlanProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
