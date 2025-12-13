"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import AuthButton from "@/components/auth/AuthButton";
import UserMenu from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on a link
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className="sticky top-0 z-50 transition-all duration-300"
      style={{ 
        backgroundColor: scrollY > 50 ? 'rgba(242, 233, 221, 0.98)' : 'rgba(242, 233, 221, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: scrollY > 50 ? '2px solid rgba(0, 0, 0, 0.1)' : '2px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-5">
        <nav className="flex items-center justify-between" role="navigation" aria-label="Main navigation">
          <Link 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-bold hover:opacity-80 transition-opacity duration-200" 
            style={{ fontFamily: 'var(--font-title)', color: '#000000' }}
          >
            <Image 
              src="/icma-chain.png" 
              alt="ICMA Chain" 
              width={28} 
              height={28}
              className="object-contain sm:w-8 sm:h-8 flex-shrink-0"
            />
            <span className="hidden sm:inline whitespace-nowrap">ICMA - Hadith Analyzer</span>
            <span className="sm:hidden">ICMA</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="/chain-analyzer"
              className="group relative px-3 py-2 font-semibold text-sm transition-all duration-200"
              style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
            >
              Chain Analyzer
              <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#000000' }} />
            </Link>
            <Link
              href="/narrators"
              className="group relative px-3 py-2 font-semibold text-sm transition-all duration-200"
              style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
            >
              Narrators
              <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#000000' }} />
            </Link>
            <Link
              href="/hadith"
              className="group relative px-3 py-2 font-semibold text-sm transition-all duration-200"
              style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
            >
              Hadith
              <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#000000' }} />
            </Link>
            <Link
              href="/analysis"
              className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:shadow-lg"
              style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            >
              Start Analysis
            </Link>
            {user ? <UserMenu /> : <AuthButton />}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-button p-2 rounded-lg transition-all duration-200 hover:bg-black/10 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ color: '#000000' }}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-0 md:hidden z-30 bg-black/20"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`mobile-menu fixed left-0 right-0 md:hidden z-40 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'top-[73px] opacity-100 visible' : '-top-full opacity-0 invisible'
        }`}
        style={{
          backgroundColor: 'rgba(242, 233, 221, 0.98)',
          backdropFilter: 'blur(10px)',
          maxHeight: 'calc(100vh - 73px)',
          overflowY: 'auto',
        }}
        role="navigation"
        aria-label="Mobile navigation menu"
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="border-t-2 border-black/20">
          <nav className="flex flex-col">
            <Link
              href="/chain-analyzer"
              onClick={closeMobileMenu}
              className="px-6 py-4 border-b border-black/10 font-semibold text-base transition-all duration-200 hover:bg-black/5 active:bg-black/10"
              style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
            >
              Chain Analyzer
            </Link>
            <Link
              href="/narrators"
              onClick={closeMobileMenu}
              className="px-6 py-4 border-b border-black/10 font-semibold text-base transition-all duration-200 hover:bg-black/5 active:bg-black/10"
              style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
            >
              Narrators
            </Link>
            <Link
              href="/hadith"
              onClick={closeMobileMenu}
              className="px-6 py-4 border-b border-black/10 font-semibold text-base transition-all duration-200 hover:bg-black/5 active:bg-black/10"
              style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
            >
              Hadith
            </Link>
            <Link
              href="/analysis"
              onClick={closeMobileMenu}
              className="px-6 py-4 font-semibold text-base transition-all duration-200 hover:opacity-90 active:opacity-80"
              style={{
                backgroundColor: '#000000',
                color: '#f2e9dd',
                fontFamily: 'var(--font-content)',
              }}
            >
              Start Analysis
            </Link>
            <div className="px-6 py-4 border-t border-black/10">
              {user ? <UserMenu onMobileMenuClose={closeMobileMenu} /> : <AuthButton />}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

