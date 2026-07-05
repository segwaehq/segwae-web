import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local'
import Script from "next/script";
import LayoutWrapper from "@/components/LayoutWrapper";
import ThemeProvider from "@/components/ThemeProvider";
import ThemedToaster from "@/components/ThemedToaster";


const satoshi = localFont({
  src: [
    {
      path: '../public/fonts/Satoshi-Black.otf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../public/fonts/Satoshi-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Satoshi-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Satoshi-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Satoshi-Light.otf',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
})



export const metadata: Metadata = {
  title: 'Segwae - Find Work That Matters',
  description:
    'Segwae connects professionals with great roles at companies that value their work. Browse open positions, build your profile, and share it instantly with a QR code or NFC card.',
  keywords: [
    'job search',
    'find jobs',
    'job board',
    'hiring',
    'recruitment',
    'careers',
    'professional profile',
    'QR code business card',
    'digital identity',
    'Segwae',
    'remote jobs',
    'professional networking',
  ],
  authors: [{ name: 'Segwae' }],
  alternates: {
    canonical: 'https://segwae.com',
  },
  openGraph: {
    title: 'Segwae - Find Work That Matters',
    description:
      'Browse open roles, build a shareable professional profile, and connect with companies that value your work — all in one place.',
    url: 'https://segwae.com',
    siteName: 'Segwae',
    images: [
      {
        url: 'https://segwae.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Segwae - Find Work That Matters',
    description:
      'Browse open roles, build a shareable professional profile, and connect with companies that value your work — all in one place.',
    images: ['https://segwae.com/og-image.png'],
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${satoshi.variable}`} suppressHydrationWarning>
      <head>
        {/* Google Consent Mode v2 — must run before any gtag calls */}
        <Script id="google-consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied',
              'wait_for_update': 500
            });
            gtag('set', 'url_passthrough', true);
          `}
        </Script>

        {/* Google Funding Choices CMP — shows consent dialog to EEA/UK/Switzerland users */}
        <Script
          async
          src="https://fundingchoicesmessages.google.com/i/pub-4398584928051251?ers=1"
          strategy="afterInteractive"
        />
        <Script id="google-fc-init" strategy="afterInteractive">
          {`
            (function() {
              function signalGooglefcPresent() {
                if (!window.googletag) { window.googletag = { cmd: [] }; }
                if (googletag.replayFailedRequests) googletag.replayFailedRequests();
              }
              signalGooglefcPresent();
            })();
          `}
        </Script>

        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-FRLK75T2CW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FRLK75T2CW');
          `}
        </Script>

        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-4398584928051251" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4398584928051251"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <link rel="image_src" href="https://segwae.com/og-image.png" />
      </head>
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        className="font-openSans antialiased"
      >
        <ThemeProvider>
          <ThemedToaster />
          {/* <Header />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer /> */}
          <LayoutWrapper>{children}</LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
