import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local'
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LayoutWrapper from "@/components/LayoutWrapper";

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
  openGraph: {
    title: 'Segwae - The Smarter Way to Network',
    description:
      'Share your profile instantly with a single tap or scan. Meet smarter, connect faster, and turn first impressions into real connections.',
    url: 'https://segwae.com',
    siteName: 'Segwae',
    images: [
      {
        url: 'https://segwae.com/logo.png',
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
    images: ['https://segwae.com/logo.png'],
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
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-FRLK75T2CW"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FRLK75T2CW');
          `}
        </Script>
      </head>
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        className="font-openSans antialiased"
      >
        {/* <Header />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer /> */}
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
