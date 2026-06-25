import CtaSection from "../components/landing/CtaSection";
import Faq from "../components/landing/Faq";
import Features from "../components/landing/Features";
import Footer from "../components/landing/Footer";
import Hero from "../components/landing/Hero";
import HowItWorks from "../components/landing/HowItWorks";
import Navbar from "../components/landing/Navbar";
import PdfGuide from "../components/landing/PdfGuide";
import Privacy from "../components/landing/Privacy";
import UploadSection from "../components/landing/UploadSection";

export default function Home({ onAnalysisComplete, onLoadingChange, theme, onToggleTheme }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <PdfGuide />
        <UploadSection
          onAnalysisComplete={onAnalysisComplete}
          onLoadingChange={onLoadingChange}
        />
        <Privacy />
        <Faq />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
