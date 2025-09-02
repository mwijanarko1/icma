import type { Metadata } from "next";
import HadithAnalyzer from "@/components/HadithAnalyzer";

// Structured data for better SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ICMA - Hadith Chain Analysis",
  "description": "Advanced web application for analyzing and dating Islamic hadith chains using ICMA methodology, AI-powered narrator extraction, and scholarly research tools.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free online access to advanced Hadith analysis tools"
  },
  "featureList": [
    "Hadith chain analysis",
    "AI-powered narrator extraction",
    "ICMA methodology implementation",
    "Harald Motzki dating techniques",
    "Interactive chain visualization",
    "Textual criticism tools",
    "Source criticism analysis",
    "Academic research platform"
  ],
  "keywords": [
    "Hadith analysis", "Islamic studies", "Academic research", "Textual criticism",
    "Source criticism", "Digital humanities", "Hadith dating", "ICMA methodology"
  ],
  "publisher": {
    "@type": "Organization",
    "name": "ICMA - Hadith Chain Analysis",
    "url": "https://icma-omega.vercel.app/"
  },
  "educationalUse": "Research",
  "audience": {
    "@type": "EducationalAudience",
    "educationalRole": "Researcher"
  }
};

export const metadata: Metadata = {
  title: "ICMA - Advanced Hadith Analysis & Dating Software | Free Online Tool",
  description: "Discover the most comprehensive Hadith analysis platform featuring ICMA methodology, Harald Motzki dating techniques, and AI-powered narrator extraction. Perfect for Islamic studies research, academic scholars, and digital humanities projects.",
  keywords: [
    "ICMA software", "Hadith dating software", "Hadith analysis program", "Isnād-cum-matn analysis",
    "Harald Motzki hadith dating", "Hadith authenticity", "Hadith criticism", "Academic research tool",
    "Islamic studies software", "Digital humanities", "Textual criticism tool", "Source criticism"
  ],
  openGraph: {
    title: "ICMA - Advanced Hadith Analysis & Dating Software",
    description: "Free online tool for Hadith analysis using ICMA methodology. AI-powered narrator extraction, chain visualization, and scholarly research platform for Islamic studies.",
    type: "website",
    url: "https://icma-omega.vercel.app/",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICMA - Advanced Hadith Analysis & Dating Software",
    description: "Free online tool for Hadith analysis using ICMA methodology. AI-powered narrator extraction, chain visualization, and scholarly research platform.",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <HadithAnalyzer />
    </>
  );
}