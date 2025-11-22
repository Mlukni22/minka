'use client';

import { useEffect, useState } from 'react';
import { useScroll } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { onAuthChange, signOut } from '@/lib/auth';
import { User } from 'firebase/auth';
import { User as UserIcon, LogOut } from 'lucide-react';

interface HeaderProps {
  brand: string;
  links: Array<{ label: string; href: string }>;
  cta: { label: string; href: string };
}

export default function Header({ brand, links, cta }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (value) => {
      setIsScrolled(value > 24);
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Close mobile menu when clicking outside or on link
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Don't show header on auth/onboarding pages
  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/onboarding';
  if (isAuthPage) return null;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        isScrolled
          ? 'bg-white/95 text-[#111111] backdrop-blur border-b border-[#0000000D] shadow-[0_10px_40px_rgba(17,17,17,0.08)]'
          : 'bg-transparent text-[#111111]',
      )}
      role="banner"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3 md:gap-0">
          <a
            href="/"
            className="flex items-center transition-opacity hover:opacity-80 active:opacity-70"
          >
            <Image
              src="/images/logo.png"
              alt={brand}
              width={60}
              height={24}
              className="h-5 sm:h-6 w-auto object-contain"
              priority
            />
          </a>
          
          {/* Mobile CTA - Left side */}
          <Button
            asChild
            size="sm"
            variant="accent"
            className="md:hidden"
          >
            <a href={cta.href}>{cta.label}</a>
          </Button>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:gap-8 text-[#6B7280] md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={cn(
                'transition-colors text-sm lg:text-base py-2 px-1',
                isScrolled ? 'text-[#6B7280] hover:text-[#111111]' : 'text-[#293033] hover:text-[#111111]',
              )}
            >
              {link.label}
            </a>
          ))}
          {user && (
            <>
              <a
                href="/dashboard"
                className={cn(
                  'transition-colors text-sm lg:text-base py-2 px-1',
                  isScrolled ? 'text-[#6B7280] hover:text-[#111111]' : 'text-[#293033] hover:text-[#111111]',
                )}
              >
                Dashboard
              </a>
              <a
                href="/practice"
                className={cn(
                  'transition-colors text-sm lg:text-base py-2 px-1',
                  isScrolled ? 'text-[#6B7280] hover:text-[#111111]' : 'text-[#293033] hover:text-[#111111]',
                )}
              >
                Practice
              </a>
              <a
                href="/dictionary"
                className={cn(
                  'transition-colors text-sm lg:text-base py-2 px-1',
                  isScrolled ? 'text-[#6B7280] hover:text-[#111111]' : 'text-[#293033] hover:text-[#111111]',
                )}
              >
                Dictionary
              </a>
            </>
          )}
        </nav>

        {/* Desktop CTA / User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <UserIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile
                  </a>
                  <a
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Dashboard
                  </a>
                  <a
                    href="/practice"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Practice
                  </a>
                  <a
                    href="/dictionary"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Dictionary
                  </a>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleSignOut();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button asChild size="sm" variant="accent">
              <a href={cta.href}>{cta.label}</a>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 -mr-2 text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/20 rounded-lg"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden overflow-hidden bg-white/98 backdrop-blur border-b border-[#0000000D]">
          <nav className="px-4 py-6 space-y-4" aria-label="Mobile navigation">
            {links.map((link) => (
              <a
                key={`mobile-${link.href}-${link.label}`}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 text-base font-medium text-[#111111] transition-colors hover:text-[#8C6BFF] border-b border-[#0000000D] last:border-0"
              >
                {link.label}
              </a>
            ))}
            {user && (
              <>
                <a
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-base font-medium text-[#111111] transition-colors hover:text-[#8C6BFF] border-b border-[#0000000D]"
                >
                  Dashboard
                </a>
                <a
                  href="/practice"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-base font-medium text-[#111111] transition-colors hover:text-[#8C6BFF] border-b border-[#0000000D]"
                >
                  Practice
                </a>
                <a
                  href="/dictionary"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-base font-medium text-[#111111] transition-colors hover:text-[#8C6BFF] border-b border-[#0000000D]"
                >
                  Dictionary
                </a>
                <a
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-base font-medium text-[#111111] transition-colors hover:text-[#8C6BFF] border-b border-[#0000000D]"
                >
                  Profile
                </a>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left py-3 text-base font-medium text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
            {!user && (
              <div className="pt-4">
                <Button asChild size="lg" variant="accent" className="w-full">
                  <a href={cta.href} onClick={() => setIsMobileMenuOpen(false)}>
                    {cta.label}
                  </a>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
