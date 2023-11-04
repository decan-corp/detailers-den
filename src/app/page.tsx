import ScrollToTopWidget from 'src/components/common/scroll-to-top-widget';
import HeroSection from 'src/components/home/hero-section';
import ServiceSection from 'src/components/home/service-section';

const Home = () => (
  <main className="flex flex-col">
    <HeroSection />
    <ServiceSection />
    <ScrollToTopWidget />
  </main>
);

export default Home;
