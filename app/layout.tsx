import type { Metadata } from 'next';
import './globals.css';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import CartDrawer from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { getSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  const title = `${settings.site_name || 'Shawl Ghar'} | Authentic Handcrafted Kashmiri Shawls & Fine Stoles`;
  const description = settings.site_tagline || 'Authentic Handcrafted Kashmiri Shawls, Pure Wool Stoles & Fine Textiles. Order with Cash on Delivery across Pakistan.';

  return {
    title,
    description,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = getSettings();

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 antialiased selection:bg-amber-200 selection:text-amber-900">
        <CartProvider>
          <PromoBanner />
          <Navbar
            siteName={settings.site_name}
            siteTagline={settings.site_tagline}
            whatsappNumber={settings.whatsapp_number}
          />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingWhatsApp
            whatsappNumber={settings.whatsapp_number}
            siteName={settings.site_name}
          />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
