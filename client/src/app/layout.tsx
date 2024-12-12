import type { Metadata } from "next";
import Head from "next/head";
// import localFont from "next/font/local";
import "./globals.css";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Infinity Math Solution",
  description:
    "Handwritten mathematical problem solver by infinity group as minor project of Computer Engineering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="color-scheme" content="light dark" />
      </Head>
      <body className="antialiased">
        <header>
          <NavBar />
        </header>
        <main>{children}</main>
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
