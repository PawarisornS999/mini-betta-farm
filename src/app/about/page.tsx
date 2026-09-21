"use client";

import Image from "next/image";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";

export default function AboutPage() {
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).about;

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              {t.title}
            </h1>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              {t.subtitle}
            </p>
          </div>

          {/* Story */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
              <Image
                src="https://placehold.co/800x600/0284c7/ffffff?text=Our+Farm"
                alt="Aurora Betta Farm"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t.ourStory}
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                {t.storyText1}
              </p>
              <p className="text-muted leading-relaxed mb-4">
                {t.storyText2}
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
              {t.ourValues}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.values.map((v) => (
                <div
                  key={v.title}
                  className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-4xl block mb-3">{v.icon}</span>
                  <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-sky-100 to-cyan-50 rounded-3xl p-10 md:p-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {t.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl md:text-4xl font-bold text-accent">
                    {s.value}
                  </p>
                  <p className="text-sm text-muted mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
