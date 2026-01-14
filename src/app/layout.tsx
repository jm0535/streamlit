import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/contrast.css";
import "../styles/audio-components.css";
import "../styles/forms.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { EnterpriseLayout } from "@/components/enterprise-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Streamlit - Enterprise Audio Transcription Platform",
  description: "Professional batch audio-to-MIDI transcription platform for ethnomusicological research. Built with Next.js and Web Audio API.",
  keywords: ["Streamlit", "audio transcription", "MIDI", "ethnomusicology", "Next.js", "TypeScript", "research", "music analysis"],
  authors: [{ name: "Streamlit Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <EnterpriseLayout>
            {children}
          </EnterpriseLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
