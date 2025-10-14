'use client';

import { useState, useEffect, useRef } from 'react';
import Chat from '@/components/Chat';
import { HeroSection, FAQSection, PartnersSection, FeaturesSection, HowItWorksSection, StatsSection, DeviceCompatibilitySection, PricingSection, CTASection } from '@/components/landing';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import BackToTop from '@/components/BackToTop';
import { useRouter } from 'next/navigation';
import { ModernFooter } from '@/components/ui-custom/ModernFooter';
import { EnhancedLandingPage } from '@/components/ui-custom/EnhancedLandingPage';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Always show welcome on the landing page
    // but skip for returning users who are logged in
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (hasVisited && user) {
      // Navigate to dashboard if user is logged in
      router.push('/dashboard');
      setShowWelcome(false);
    } else {
      localStorage.setItem('hasVisitedBefore', 'true');
    }
    setMounted(true);
    
    // Add JS detection class to prevent hydration mismatches
    document.documentElement.classList.add('js-ready');
  }, [user, router]);

  const handleStartChat = () => {
    // Redirect to login page instead of just hiding welcome
    router.push('/auth/login');
  };

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHowItWorks = () => {
    if (howItWorksRef.current) {
      howItWorksRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Loading ChatBuddy...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <div className="flex-1 flex flex-col items-center min-h-[calc(100vh-64px)] pb-20 md:pb-0">
      {showWelcome ? (
        <motion.div
          initial="hidden"
          animate={mounted ? "visible" : "hidden"} 
          variants={containerVariants}
          className="w-full mx-auto space-y-20 pb-8"
        >
          {/* Hero Section */}
          <HeroSection 
            onStartChat={handleStartChat}
            onScrollToFeatures={scrollToFeatures}
            onScrollToHowItWorks={scrollToHowItWorks}
            showSignup={!user}
          />

          {/* Partners & Integrations */}
          <PartnersSection />


          {/* Features Section */}
          <FeaturesSection />

          {/* How It Works Section */}
          <HowItWorksSection />

          {/* Stats & Social Proof Section */}
          <StatsSection />

          {/* Device Compatibility Section */}
          <DeviceCompatibilitySection />

          {/* Enhanced Landing Page Components */}
          <EnhancedLandingPage />

          {/* Pricing Section */}
          <PricingSection />

          {/* FAQ Section */}
          <FAQSection />

          {/* CTA Section */}
          <CTASection />

          {/* Modern Footer */}
          <ModernFooter />
        </motion.div>
      ) : (
        <div className="w-full max-w-5xl mx-auto h-full p-2 md:p-4">
          <Chat />
        </div>
      )}
    <BackToTop />
    </div>
  );
}
