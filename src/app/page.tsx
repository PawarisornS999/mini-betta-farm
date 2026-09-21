import Header from "@/sections/Header";
import Hero from "@/sections/Hero";
import Categories from "@/sections/Categories";
import FeaturedFish from "@/sections/PetClothing";
import SpeciesCollection from "@/sections/PetFoodies";
import ClearanceBanner from "@/sections/ClearanceBanner";
import Testimonial from "@/sections/Testimonial";
import BestSelling from "@/sections/BestSelling";
import Newsletter from "@/sections/Newsletter";
import Blog from "@/sections/Blog";
import Footer from "@/sections/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedFish />
        <SpeciesCollection />
        <ClearanceBanner />
        <Testimonial />
        <BestSelling />
        <Newsletter />
        <Blog />
      </main>
      <Footer />
    </>
  );
}
