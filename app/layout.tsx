import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local'
import Script from "next/script";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from 'sonner';

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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

// export const metadata: Metadata = {
//   title: 'Segwae - Professional Networking Made Simple',
//   description:
//     'Create digital business cards with QR codes, connect with professionals, and order physical NFC cards. Small talk to big deals.',
//   keywords: [
//     'business cards',
//     'networking',
//     'QR code',
//     'NFC cards',
//     'professional networking',
//     'digital business card',
//     'Nigeria',
//   ],
//   authors: [{ name: 'Segwae' }],
//   openGraph: {
//     title: 'Segwae - Professional Networking Made Simple',
//     description: 'Small talk to big deals. Create your digital business card today.',
//     url: 'https://segwae.com',
//     siteName: 'Segwae',
//     images: [
//       {
//         url: 'https://segwae.com/logo.png',
//         width: 1200,
//         height: 630,
//       },
//     ],
//     locale: 'en_US',
//     type: 'website',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Segwae - Professional Networking Made Simple',
//     description: 'Small talk to big deals. Create your digital business card today.',
//     images: ['https://segwae.com/logo.png'],
//   },
// }



// export const metadata: Metadata = {
//   title: 'Segwae – Connect Smarter, Share Instantly',
//   description:
//     'Segwae makes networking effortless. Share your socials, email, and contact info through one QR code or NFC card — all managed from one sleek app.',
//   keywords: [
//     'networking',
//     'contact sharing',
//     'QR code',
//     'NFC business card',
//     'smart business card',
//     'professional networking app',
//     'Segwae',
//     'Nigeria',
//   ],
//   authors: [{ name: 'Segwae' }],
//   openGraph: {
//     title: 'Segwae – Connect Smarter, Share Instantly',
//     description:
//       'Share your details seamlessly with one QR code or NFC card. Segwae simplifies professional networking for modern creators and entrepreneurs.',
//     url: 'https://segwae.com',
//     siteName: 'Segwae',
//     images: [
//       {
//         url: 'https://segwae.com/logo.png',
//         width: 1200,
//         height: 630,
//       },
//     ],
//     locale: 'en_US',
//     type: 'website',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Segwae – Connect Smarter, Share Instantly',
//     description:
//       'Share your details seamlessly with one QR code or NFC card. Segwae simplifies professional networking for modern creators and entrepreneurs.',
//     images: ['https://segwae.com/logo.png'],
//   },
// };





export const metadata: Metadata = {
  title: 'Segwae - The Smarter Way to Network',
  description:
    'Skip the small talk. Segwae lets you share your socials, email, and contact info instantly with one QR code or NFC card — no app download needed.',
  keywords: [
    'smart business card',
    'networking app',
    'QR code',
    'NFC card',
    'contact sharing',
    'digital identity',
    'Segwae',
    'professional networking',
  ],
  authors: [{ name: 'Segwae' }],
  alternates: {
    canonical: 'https://segwae.com',
  },
  openGraph: {
    title: 'Segwae - The Smarter Way to Network',
    description:
      'Share your profile instantly with a single tap or scan. Meet smarter, connect faster, and turn first impressions into real connections.',
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
    title: 'Segwae - The Smarter Way to Network',
    description:
      'Share your profile instantly with a single tap or scan. Meet smarter, connect faster, and turn first impressions into real connections.',
    images: ['https://segwae.com/og-image.png'],
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${satoshi.variable}`}>
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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: '#1a1a1a',
              border: '1px solid #e5e5e5',
            },
          }}
        />
        {/* <Header />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer /> */}
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
