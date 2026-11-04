import { MotionConfig } from 'framer-motion';
import { usePathname } from '@/hooks/useRoute';
import DbProvider from '@/store/DbProvider';
import AdminPage from '@/components/admin/AdminPage';
import AmbientBackground from '@/components/layout/AmbientBackground';
import FloatingAdminButton from '@/components/layout/FloatingAdminButton';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import NetworkBadge from '@/components/layout/NetworkBadge';
import Hero from '@/components/Hero';
import Ticker from '@/components/Ticker';
import WorkflowSteps from '@/components/WorkflowSteps';
import TrackingSection from '@/components/TrackingSection';
import ProductCatalog from '@/components/ProductCatalog';
import PortfolioGallery from '@/components/PortfolioGallery';
import SpkCalculator from '@/components/SpkCalculator';

function Storefront() {
  return (
    <div className="relative min-h-screen text-slate-900 antialiased">
      <AmbientBackground />
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <WorkflowSteps />
        <TrackingSection />
        <ProductCatalog />
        <PortfolioGallery />
        <SpkCalculator />
      </main>
      <Footer />
      <FloatingAdminButton />
      <NetworkBadge />
    </div>
  );
}

function AppRoutes() {
  const pathname = usePathname();
  if (pathname === '/admin' || pathname === '/admin/') return <AdminPage />;
  return <Storefront />;
}

export default function App() {
  return (
    <DbProvider>
      <MotionConfig reducedMotion="user">
        <AppRoutes />
      </MotionConfig>
    </DbProvider>
  );
}
