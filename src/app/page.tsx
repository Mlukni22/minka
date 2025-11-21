import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SystemSteps from '@/components/SystemSteps';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import ClassicHero from '@/components/ClassicHero';
import FeatureShowcase from '@/components/FeatureShowcase';
import { homeContent } from '@/lib/content/home';

export default function HomePage() {
  return (
    <div className="relative z-10 text-[#111111]">
      <Header brand={homeContent.brand} links={homeContent.navLinks} cta={homeContent.headerCta} />
      <main className="relative z-10 bg-transparent">
        {/* Scrollable background section from top to Hero section */}
        <div
          className="relative bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: "url('/images/forest-classic.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundAttachment: 'scroll',
            backgroundRepeat: 'no-repeat',
            paddingTop: 'clamp(60px,12vw,80px)',
            minHeight: '100vh',
            zIndex: 0,
          }}
        >
          <div className="relative z-10 bg-transparent">
            <ClassicHero />
            <Hero content={homeContent.hero} />
          </div>
        </div>
        {/* FeatureShowcase with solid background */}
        <FeatureShowcase content={homeContent.funShowcase} />
        <SystemSteps content={homeContent.system} />
        <FAQ content={homeContent.faq} />
        <CTA content={homeContent.cta} />
      </main>
      <Footer content={homeContent.footer} />
    </div>
  );
}
