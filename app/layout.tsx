import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { EventsProvider } from "@/context/EventsContext";
import { ProfilesProvider } from "@/context/ProfilesContext";
import { MessagesProvider } from "@/context/MessagesContext";
import { OpportunitiesProvider } from '@/context/OpportunitiesContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Culture+ | Le portail culturel du Niger",
  description: "Découvrez les événements, opportunités et acteurs culturels au Niger.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <EventsProvider>
          <ProfilesProvider>
            <OpportunitiesProvider>
              <MessagesProvider>
                <div className="pb-20 md:pb-0"> {/* Space for mobile nav */}
                  <Navbar />
                  {children}
                  <Toaster position="bottom-center" />
                </div>
              </MessagesProvider>
            </OpportunitiesProvider>
          </ProfilesProvider>
        </EventsProvider>
      </body>
    </html>
  )
}
