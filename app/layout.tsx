import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { ClientProviders } from "@/components/ClientProviders";
import type { Metadata, Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#E05206",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Culture+ | Le portail culturel du Niger",
  description: "Découvrez les événements, opportunités et acteurs culturels au Niger.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Culture+",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ClientProviders>
          <div className="pb-20 md:pb-0 min-h-screen">
            <Navbar />
            {children}
            <BottomNav />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
