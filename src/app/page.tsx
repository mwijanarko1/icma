"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import type { Chain, LibraryChain } from "@/types/hadith";
import { SimpleChainCard } from "@/components/hadith-analyzer/chains/SimpleChainCard";
import { NarratorDetailsModal } from "@/components/hadith-analyzer/narrators/NarratorDetailsModal";
import type { Narrator as NarratorType } from "@/data/types";

interface FeaturedNarrator {
  id: string;
  arabicName: string;
  englishName: string;
  description?: string;
}

interface RawChain {
  id: string;
  narrators: unknown[];
  hadithText: string;
  title?: string;
  collapsed?: boolean;
  [key: string]: unknown;
}

export default function HomePage() {
  const [intentionChains, setIntentionChains] = useState<Chain[]>([]);
  const [isLoadingChains, setIsLoadingChains] = useState(true);
  const [featuredNarrators, setFeaturedNarrators] = useState<FeaturedNarrator[]>([]);
  const [isLoadingNarrators, setIsLoadingNarrators] = useState(true);
  const [expandedChainId, setExpandedChainId] = useState<string | null>(null);
  
  // Narrator modal state
  const [showNarratorModal, setShowNarratorModal] = useState(false);
  const [selectedNarrator, setSelectedNarrator] = useState<NarratorType | null>(null);
  const [isLoadingNarratorDetails, setIsLoadingNarratorDetails] = useState(false);

  // Load Intention Hadith chains
  useEffect(() => {
    async function loadIntentionChains() {
      try {
        const response = await fetch('/api/chains');
        if (response.ok) {
          const data = await response.json();
          const intentionChain = data.chains?.find((c: LibraryChain) => 
            c.name.toLowerCase().includes('intention')
          );
          
          if (intentionChain) {
            const chainResponse = await fetch('/api/chains', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chainPath: intentionChain.path })
            });
            
            if (chainResponse.ok) {
              const chainData = await chainResponse.json();
              // Transform chains to match Chain interface
              const transformedChains = (chainData.data?.chains || []).map((chain: RawChain) => ({
                ...chain,
                chainText: chain.hadithText || '', // Map hadithText to chainText
                matn: '' // For now, leave matn empty as the JSON doesn't separate it
              }));
              setIntentionChains(transformedChains);
            }
          }
        }
      } catch (error) {
        console.error('Error loading chains:', error);
      } finally {
        setIsLoadingChains(false);
      }
    }
    
    loadIntentionChains();
  }, []);


  // Load featured narrators (5 random narrators)
  useEffect(() => {
    async function loadFeaturedNarrators() {
      try {
        const response = await fetch(`/api/narrators?random=true&limit=5`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.narrators) {
            setFeaturedNarrators(
              data.narrators.map((n: { id: string; primaryArabicName: string; primaryEnglishName: string }) => ({
                id: n.id,
                arabicName: n.primaryArabicName,
                englishName: n.primaryEnglishName,
              }))
            );
          }
        }
      } catch (error) {
        console.error('Error loading narrators:', error);
      } finally {
        setIsLoadingNarrators(false);
      }
    }

    loadFeaturedNarrators();
  }, []);

  // Fetch narrator details and show modal
  const handleNarratorClick = async (narratorId: string) => {
    setIsLoadingNarratorDetails(true);
    setShowNarratorModal(true);
    try {
      const response = await fetch(`/api/narrators/${encodeURIComponent(narratorId)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.narrator) {
          setSelectedNarrator(data.narrator);
        }
      }
    } catch (error) {
      console.error('Error fetching narrator details:', error);
    } finally {
      setIsLoadingNarratorDetails(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden" 
      style={{ 
        backgroundColor: '#f2e9dd', 
        color: '#000000',
      }}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-10 blur-3xl transition-transform duration-[20s] ease-in-out"
          style={{ backgroundColor: '#000000' }}
        />
        <div 
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full opacity-10 blur-3xl transition-transform duration-[25s] ease-in-out"
          style={{ backgroundColor: '#000000' }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        <Header />
        
        {/* Narrator Details Modal */}
        <NarratorDetailsModal
          show={showNarratorModal}
          narrator={selectedNarrator}
          isLoading={isLoadingNarratorDetails}
          onClose={() => {
            setShowNarratorModal(false);
            setSelectedNarrator(null);
          }}
        />

        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-6 sm:mb-8 inline-block">
              <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border-2 border-black/20" style={{ fontFamily: 'var(--font-content)', color: '#000000', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                Advanced Hadith Analysis Platform
              </span>
            </div>
            <h1 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight tracking-tight px-2"
              style={{ fontFamily: 'var(--font-title)', color: '#000000' }}
                >
              Isnād-cum-Matn
              <br />
              <span className="relative inline-block">
                Analysis
                <span className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-2 sm:h-3 opacity-30" style={{ backgroundColor: '#000000' }} />
              </span>
            </h1>
            <p 
              className="text-base sm:text-xl md:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
              style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
            >
              A sophisticated methodology for dating and authenticating hadith through comprehensive chain and textual analysis
            </p>
            <div className="flex items-center justify-center px-4">
                <Link
                  href="/analysis"
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 border-2 border-black shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
                >
                <span className="flex items-center justify-center gap-2">
                  Start Analysis
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                </Link>
            </div>
          </div>
        </section>

        {/* Featured Hadith Chain Section */}
        <section id="featured-section" className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                Featured Hadith Chain
              </h2>
              <p className="text-base sm:text-xl max-w-2xl mx-auto px-4" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
                The Hadith of Intention - One of the most important hadiths in Islam
              </p>
              <div className="w-16 sm:w-24 h-1 mx-auto mt-4 sm:mt-6" style={{ backgroundColor: '#000000' }} />
            </div>

            {isLoadingChains ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent"></div>
                <p className="mt-4" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                  Loading chains...
                </p>
              </div>
            ) : intentionChains.length > 0 ? (
              <div className="space-y-4">
                {intentionChains.slice(0, 3).map((chain) => (
                  <SimpleChainCard
                    key={chain.id}
                    chain={chain}
                    hadithReference={chain.title || 'Intention Hadith'}
                    isCollapsed={expandedChainId !== chain.id}
                    onToggleCollapse={() => {
                      setExpandedChainId(expandedChainId === chain.id ? null : chain.id);
                    }}
                  />
                ))}
                <div className="text-center mt-6">
                  <Link
                    href="/chain-analyzer?collection=intention"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 border-2 border-black shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
                  >
                    View All Chains
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl border-2 border-black/10" style={{ backgroundColor: '#ffffff' }}>
                <p style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                  No chains available at the moment.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Featured Narrators Section */}
        <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                Explore Narrators
              </h2>
              <p className="text-base sm:text-xl max-w-2xl mx-auto px-4" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
                Explore the biographies and scholarly assessments of key narrators in hadith transmission
              </p>
              <div className="w-16 sm:w-24 h-1 mx-auto mt-4 sm:mt-6" style={{ backgroundColor: '#000000' }} />
            </div>

            {isLoadingNarrators ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent"></div>
                <p className="mt-4" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                  Loading narrators...
                </p>
              </div>
            ) : featuredNarrators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {featuredNarrators.map((narrator) => (
                  <button
                    key={narrator.id}
                    onClick={() => handleNarratorClick(narrator.id)}
                    className="group rounded-2xl border-2 border-black bg-white p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 text-left w-full"
                    style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="mb-4">
                      <h3 
                        className="text-xl font-bold mb-2 text-right" 
                        dir="rtl"
                        style={{ fontFamily: 'var(--font-title)', color: '#000000' }}
                      >
                        {narrator.arabicName}
                      </h3>
                      <p 
                        className="text-base font-medium" 
                        style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
                      >
                        {narrator.englishName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
                      <span>View Details</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl border-2 border-black/10" style={{ backgroundColor: '#ffffff' }}>
                <p style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                  No narrators available at the moment.
                </p>
              </div>
            )}

            <div className="text-center mt-8">
              <Link
                href="/narrators"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 border-2 border-black shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
              >
                Browse All Narrators
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border-2 border-black/10 shadow-xl" style={{ backgroundColor: '#ffffff' }}>
              <div className="mb-4 sm:mb-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
            What is ICMA?
          </h2>
                <div className="w-16 sm:w-24 h-1 mb-6 sm:mb-8" style={{ backgroundColor: '#000000' }} />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.85 }}>
                  <strong style={{ fontFamily: 'var(--font-title)' }}>Isnād-cum-Matn Analysis (ICMA)</strong> is a sophisticated methodology developed by scholars like Harald Motzki for dating and authenticating hadith. It combines both <em>isnād</em> (chain of transmission) and <em>matn</em> (text) analysis to establish the historical reliability of prophetic traditions.
          </p>
                <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.85 }}>
                  This platform guides you through each step of the ICMA process, providing access to the tools you need to conduct rigorous academic research on hadith transmission.
          </p>
                <div className="pt-4 sm:pt-6">
                  <Link
                    href="/analysis"
                    className="group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 border-2 border-black shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
                  >
                    <span>Start Analysis</span>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
        </div>
          </div>
        </div>
        </section>

      {/* Footer */}
        <footer className="relative border-t-2 border-black/10 mt-12 sm:mt-20" style={{ backgroundColor: 'rgba(242, 233, 221, 0.95)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                About ICMA
              </h3>
              <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
                Advanced Hadith analysis platform using Isnād-cum-Matn Analysis (ICMA) methodology for dating and authenticating Islamic hadith chains.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                Quick Links
              </h3>
                <ul className="space-y-3">
                <li>
                  <Link
                    href="/chain-analyzer"
                    className="text-sm hover:opacity-80 transition-opacity inline-block"
                    style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
                  >
                    Chain Analyzer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analysis"
                    className="text-sm hover:opacity-80 transition-opacity inline-block"
                    style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
                  >
                    Start Analysis
                  </Link>
                </li>
                  <li>
                    <Link
                      href="/narrators"
                      className="text-sm hover:opacity-80 transition-opacity inline-block"
                      style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
                    >
                      Narrators
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/hadith"
                      className="text-sm hover:opacity-80 transition-opacity inline-block"
                      style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
                    >
                      Hadith
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-sm hover:opacity-80 transition-opacity inline-block"
                    style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-sm hover:opacity-80 transition-opacity inline-block"
                    style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                Resources
              </h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
                Learn about ICMA methodology and Harald Motzki dating techniques for academic research in Islamic studies.
              </p>
            </div>
          </div>

          <div className="border-t border-black/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-center md:text-left" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                © <span suppressHydrationWarning>{new Date().getFullYear()}</span> ICMA - Hadith Chain Analyzer. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/privacy-policy"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}
                >
                  Privacy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
