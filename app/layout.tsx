import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SidebarLayoutWrapper from "./components/SidebarLayoutWrapper";
import RootProvider from "./providers/RootProvider";
import ConfirmationDialogue from "./components/ConfirmationDialogue";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PR analysis prototype",
  description: "A prototype tool to support meaning-informed pull request analyses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootProvider>
          <SidebarLayoutWrapper>
            {children}
            <ConfirmationDialogue />
          </SidebarLayoutWrapper>
        </RootProvider>
      </body>
    </html>
  );
} 
