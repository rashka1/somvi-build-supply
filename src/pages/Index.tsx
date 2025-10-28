import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Suppliers from "@/components/Suppliers";
import BrandsOnboard from "@/components/BrandsOnboard";
import Stats from "@/components/Stats";
import WhySomvi from "@/components/WhySomvi";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <HowItWorks />
        <Suppliers />
        <BrandsOnboard />
        <Stats />
        <WhySomvi />
        <Testimonials />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
