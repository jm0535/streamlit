import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/contrast.css";
import "../styles/audio-components.css";
import "../styles/forms.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/enterprise-layout";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Streamlit - Audio Research Platform",
  description: "Audio transcription and analysis platform for research. Convert audio to MIDI, analyze frequencies, and export data. All files stay on your device.",
  keywords: ["Streamlit", "audio transcription", "MIDI", "music analysis", "research", "audio analysis"],
  authors: [{ name: "Streamlit Team" }],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Streamlit - Audio Research Platform",
    description: "Audio transcription and analysis for research",
    type: "website",
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
          <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

