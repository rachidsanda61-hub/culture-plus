"use client";

import { Button } from "@/components/Button";
import { EventCard } from "@/components/EventCard";
import { EventCarousel } from "@/components/EventCarousel";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEvents } from "@/context/EventsContext";
import { useEffect, useState } from "react";
import { getHeroSlides } from "./actions/carousel";

export default function Home() {
  const { events } = useEvents();
  const [slides, setSlides] = useState<any[]>([]);

  // On prend les 4 premiers pour le carrousel (simulation "À la une")
  const featuredEvents = events.slice(0, 4);

  useEffect(() => {
    getHeroSlides().then(setSlides);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[80%] bg-[var(--marketing-orange)]/5 -z-10 rounded-b-[4rem]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-[var(--charcoal-600)] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={16} className="text-[var(--marketing-orange)]" />
            <span>La plateforme n°1 de la culture au Niger</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Vivez la culture <br />
            <span className="gradient-text">sans limites</span>
          </h1>

          <p className="text-xl text-[var(--charcoal-600)] max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Découvrez les meilleurs événements, trouvez des financements pour vos projets et connectez-vous avec les acteurs culturels du Niger.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 mb-16">
            <Link href="/events" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">Explorer les événements</Button>
            </Link>
            <Link href="/network" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">Rejoindre le réseau</Button>
            </Link>
          </div>

          {/* Hero Slider */}
          {slides.length > 0 && (
            <div className="w-full animate-in fade-in zoom-in-95 duration-1000 delay-500">
              <HeroCarousel slides={slides} />
            </div>
          )}
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">À la une cette semaine</h2>
              <p className="text-[var(--charcoal-600)]">Ne manquez pas les événements majeurs du moment.</p>
            </div>
            <Link href="/events">
              <Button variant="ghost" className="hidden sm:flex group">
                Tout voir <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <EventCarousel events={featuredEvents} />

          <div className="mt-8 text-center sm:hidden">
            <Link href="/events">
              <Button variant="outline" className="w-full">Voir tous les événements</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Banner Advertisement */}
      <AdsSection />

      {/* Opportunities Teaser */}
      <section className="py-20 bg-[var(--sand-50)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[var(--marketing-green)] rounded-3xl p-8 md:p-12 overflow-hidden relative text-white shadow-2xl">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Besoin de financement pour votre projet ?</h2>
                <p className="text-green-50 text-lg mb-8">
                  Accédez à une base de données exclusive de bourses, appels à projets et fonds de mobilité pour les artistes nigériens.
                </p>
                <Link href="/opportunities">
                  <button className="bg-white text-[var(--marketing-green)] px-8 py-4 rounded-2xl font-bold hover:bg-green-50 transition-all shadow-lg hover:shadow-xl active:scale-95 leading-none">
                    Trouver une opportunité
                  </button>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                    <div className="w-10 h-10 rounded-full bg-white/20" />
                    <div>
                      <div className="w-32 h-3 bg-white/20 rounded mb-2" />
                      <div className="w-20 h-2 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-2 bg-white/10 rounded" />
                    <div className="w-full h-2 bg-white/10 rounded" />
                    <div className="w-3/4 h-2 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <PartnersSection />
    </main>
  );
}

function AdsSection() {
  const [ads, setAds] = useState<any[]>([]);
  useEffect(() => {
    import('./actions/ads').then(mod => mod.getAds().then(setAds));
  }, []);

  if (ads.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {ads.map(ad => (
          <a key={ad.id} href={ad.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full aspect-[4/1] md:aspect-[10/1] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <img src={ad.image} alt="" className="w-full h-full object-cover" />
          </a>
        ))}
      </div>
    </section>
  );
}

function PartnersSection() {
  const [partners, setPartners] = useState<any[]>([]);
  useEffect(() => {
    import('./actions/ads').then(mod => mod.getPartners().then(setPartners));
  }, []);

  if (partners.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-12">Ils nous font confiance</h3>
        <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
          {partners.map(p => (
            <img key={p.id} src={p.logo} alt={p.name} className="h-12 w-auto object-contain hover:scale-110 transition-transform" />
          ))}
        </div>
      </div>
    </section>
  );
}


