import ScrollToTopWidget from 'src/components/widgets/scroll-to-top-widget';

import HeroSection from './components/hero-section';
import ServiceSection from './components/service-section';

const Home = () => (
  <main className="flex flex-col bg-white">
    <HeroSection />
    <ServiceSection />
    <ScrollToTopWidget />
  </main>
);

export default Home;
