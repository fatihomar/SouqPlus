import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Souq+ | Smart Marketplace",
  description: "Your smart marketplace",
};

import { Toaster } from 'react-hot-toast';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read locale from cookie, default to 'ar'
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'ar';
  
  // Load messages for the current locale
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    messages = (await import(`../messages/ar.json`)).default; // Fallback
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${inter.variable} ${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster position="top-center" reverseOrder={false} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
