import type { Metadata } from "next";
import { headers } from "next/headers";
import { Nunito_Sans, Playfair_Display } from "next/font/google";
import { CustomCursor } from "@/components/CustomCursor";
import { IntroReadyGate } from "@/components/IntroReadyGate";
import { RouteTransitionVeil } from "@/components/navigation/RouteTransitionVeil";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

/**
 * Editorial display serif (luxury patisserie).
 * Preferred retail faces: Canela, Reckless Neue — swap via local @font-face on
 * `--font-cake-serif` when licensed; until then Google Playfair Display ~400/500.
 */
const display = Playfair_Display({
  variable: "--font-cake-serif",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const body = Nunito_Sans({
  variable: "--font-cake-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Four et Délices",
    template: "%s | Four et Délices",
  },
  description:
    "Bespoke celebration cakes in Dakar, Senegal — wedding, birthday, kids, and corporate designs crafted to order.",
  applicationName: "Four et Délices",
  creator: "Four et Délices",
  publisher: "Four et Délices",
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const lang = headersList.get("x-site-locale") === "fr" ? "fr" : "en";

  return (
    <html
      lang={lang}
      className={`${display.variable} ${body.variable} antialiased`}
    >
      <body className="m-0 min-h-screen p-0 font-sans">
        <IntroReadyGate />
        <CustomCursor />
        <RouteTransitionVeil />
        {children}
      </body>
    </html>
  );
}
