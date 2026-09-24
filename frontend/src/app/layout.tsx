import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "RailPlan AI | Team Debug Dynasty – SIH 2026",
  description: "Unified AI-Powered Railway Maintenance and Operations Platform across 10 National High-Density Indian Railways Corridors",
};

import { DeviceProvider } from "@/context/DeviceContext";
import { MobileBottomNav } from "@/components/common/MobileBottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} min-h-screen bg-[#050814] text-[#F8FAFC] antialiased selection:bg-[#6367FF]/30 selection:text-[#8494FF]`}>
        <DeviceProvider>
          <AuthProvider>
            <RailPlanProvider>
              <DemoTourProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <div className="flex flex-1 min-w-0">
                    <Sidebar />
                    <main className="flex-1 p-2.5 sm:p-4 lg:p-6 pb-24 lg:pb-8 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
                      {children}
                    </main>
                  </div>
                </div>
                <DemoTourModal />
                <AiChatbot />
                <MobileBottomNav />
              </DemoTourProvider>
            </RailPlanProvider>
          </AuthProvider>
        </DeviceProvider>
      </body>
    </html>
  );
}
