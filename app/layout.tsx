import type { Metadata } from "next";
import { Sora, Inter, Playfair_Display, Poppins } from "next/font/google";
import { CartProvider } from "@/lib/store";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

/** "Classic" live-preview display face — Make it yours font pairing */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-classic",
  display: "swap",
});

/** "Bold" live-preview display face — Make it yours font pairing */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-bold",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Design Your Rental Website — by Hayer Technologies",
    template: "%s — Rental Scope Studio by Hayer Technologies",
  },
  description:
    "Configure your rental business website in real time. Pick your vertical, choose a tier, and see your future site come to life — by Hayer Technologies.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Design Your Rental Website — Rental Scope Studio by Hayer Technologies",
    description:
      "Configure your rental website in real time. Pick your vertical, choose a tier, and see your future site come to life.",
    url: "https://rentalscopestudio.hayertechnologies.tech",
    siteName: "Rental Scope Studio",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Your Rental Website — Rental Scope Studio",
    description:
      "Configure your rental website in real time. Pick your vertical, choose a tier, and see your future site come to life.",
  },
  other: {
    "theme-color": "#0E1116",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${playfair.variable} ${poppins.variable}`}
    >
      <body className="bg-ink text-sand font-body antialiased grain-overlay min-h-screen">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
