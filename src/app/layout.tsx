import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Sidebar from '@/components/sidebar';
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'TopVan Manager',
  description: 'App de Gestão para TopVan',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 pl-16 md:pl-64">
             {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
