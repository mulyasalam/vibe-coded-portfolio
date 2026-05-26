export const dynamic = "force-dynamic";

import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { Projects } from "@/components/site/projects";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Nav />
      <Hero />
      <Marquee />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}
