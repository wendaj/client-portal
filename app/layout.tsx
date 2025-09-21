import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Fonts from Next.js defaults
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sansflow Client Portal',
  description: 'Minimal, professional dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-gray-50 p-4">
            <h1 className="mb-8 text-xl font-semibold">Sansflow</h1>
            <nav className="space-y-2">
              {['Dashboard', 'Tasks', 'Subscription'].map((item) => (
                <div key={item} className="p-2 hover:bg-gray-200 rounded cursor-pointer">
                  {item}
                </div>
              ))}
            </nav>
          </aside>
          {/* Main content */}
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
