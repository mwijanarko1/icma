import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Merriweather } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// Initialize the Geist font with Latin subset
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Initialize the Geist Mono font with Latin subset
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Initialize Playfair Display for titles
const titleFont = Playfair_Display({
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-title",
  subsets: ["latin"],
});

// Initialize Merriweather for content - optimized for reading
const contentFont = Merriweather({
  weight: ["300", "400", "700"],
  variable: "--font-content",
  subsets: ["latin"],
  display: "swap",
});

// Define metadata for better SEO
export const metadata: Metadata = {
  title: "ICMA - Advanced Hadith Analysis & Dating Software | Free Online Tool",
  description: "Advanced Hadith analysis software using ICMA methodology and Harald Motzki dating techniques. Free online tool for Islamic studies research, textual criticism, and source criticism with AI-powered narrator extraction.",
  keywords: [
    // Hadith and Islamic Studies
    "Hadith analysis", "Hadith dating", "Hadith authenticity", "Hadith criticism", "Hadith search engine",
    "Hadith database", "Islamic studies research", "Prophetic tradition", "Sanad and matn", "Hadith online tool",

    // Methodology and Research
    "Isnād-cum-matn analysis", "ICMA hadith methodology", "Harald Motzki hadith dating", "Hadith dating software",
    "Hadith research tool", "Academic software", "Scholarly research platform", "Historical criticism software",
    "Textual criticism tool", "Source criticism",

    // Software and Technology
    "ICMA software", "Hadith analysis program", "Online research tool", "Academic software tool",
    "Digital humanities", "Data analysis software", "Citation analysis tool", "Textual analysis",
    "Web-based research tool",

    // Core functionality
    "Hadith", "Islamic Studies", "Chain Analysis", "Isnad", "AI", "Narrator Extraction", "Hadith Analysis"
  ],
  authors: [{ name: "ICMA - Hadith Chain Analysis" }],
  creator: "ICMA - Hadith Chain Analysis",
  publisher: "ICMA - Hadith Chain Analysis",
  openGraph: {
    title: "ICMA - Advanced Hadith Analysis & Dating Software | Free Online Tool",
    description: "Advanced Hadith analysis software using ICMA methodology. Free online tool for Islamic studies research, textual criticism, and source criticism with AI-powered narrator extraction.",
    url: "https://icma-omega.vercel.app/",
    siteName: "ICMA - Hadith Chain Analysis",
    images: [
      {
        url: "/icma-chain.png",
        width: 1200,
        height: 630,
        alt: "ICMA - Hadith Chain Analysis",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICMA - Advanced Hadith Analysis & Dating Software | Free Online Tool",
    description: "Advanced Hadith analysis software using ICMA methodology and Harald Motzki dating techniques. Free online tool for Islamic studies research, textual criticism, and source criticism with AI-powered narrator extraction.",
    images: ["/icma-chain.png"],
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${geistSans.variable} ${geistMono.variable} ${titleFont.variable} ${contentFont.variable} antialiased bg-white text-gray-900`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}