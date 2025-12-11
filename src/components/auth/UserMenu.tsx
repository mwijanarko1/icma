"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";
import { ChevronDown, User, LogOut, Settings } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface UserMenuProps {
  onMobileMenuClose?: () => void;
}

export default function UserMenu({ onMobileMenuClose }: UserMenuProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/");
      onMobileMenuClose?.();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleProfileClick = () => {
    router.push("/profile");
    setIsOpen(false);
    onMobileMenuClose?.();
  };

  const handleSettingsClick = () => {
    router.push("/settings");
    setIsOpen(false);
    onMobileMenuClose?.();
  };

  const handleSignOutClick = () => {
    setIsOpen(false);
    handleSignOut();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-black/5"
        type="button"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="w-8 h-8 rounded-full border-2 border-black"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center" style={{ backgroundColor: '#000000', color: '#f2e9dd' }}>
            <span className="text-xs font-semibold">
              {user.email?.[0].toUpperCase() || "U"}
            </span>
          </div>
        )}
        <span className="hidden lg:inline text-sm font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
          {user.displayName || user.email?.split("@")[0]}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" style={{ color: '#000000' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg border shadow-lg"
            style={{ backgroundColor: '#ffffff' }}
            exit={{
              opacity: 0,
              y: -10,
              scaleY: 0.8,
              transition: { duration: 0.2 },
            }}
            initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
          >
            <ul aria-labelledby="user-menu-button" className="py-2">
              <motion.li
                animate={{ opacity: 1, x: 0 }}
                className="block"
                exit={{ opacity: 0, x: -10 }}
                initial={{ opacity: 0, x: -10 }}
                role="menuitem"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                whileHover={{ x: 5 }}
              >
                <button
                  className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-black/5 transition-colors"
                  onClick={handleProfileClick}
                  style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
                  type="button"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </button>
              </motion.li>
              <motion.li
                animate={{ opacity: 1, x: 0 }}
                className="block"
                exit={{ opacity: 0, x: -10 }}
                initial={{ opacity: 0, x: -10 }}
                role="menuitem"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                whileHover={{ x: 5 }}
              >
                <button
                  className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-black/5 transition-colors"
                  onClick={handleSettingsClick}
                  style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
                  type="button"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </button>
              </motion.li>
              <motion.li
                animate={{ opacity: 1, x: 0 }}
                className="block"
                exit={{ opacity: 0, x: -10 }}
                initial={{ opacity: 0, x: -10 }}
                role="menuitem"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                whileHover={{ x: 5 }}
              >
                <button
                  className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-black/5 transition-colors disabled:opacity-50"
                  disabled={isSigningOut}
                  onClick={handleSignOutClick}
                  style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
                  type="button"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
