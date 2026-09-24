"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";

export default function ClearanceBanner() {
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).clearance;
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-[#0D47A1] to-black rounded-3xl overflow-hidden p-8 md:p-14">
          <div className="absolute inset-0 opacity-[0.06]">
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className="absolute text-4xl"
                style={{
                  top: `${(i % 4) * 25 + 5}%`,
                  left: `${(i % 3) * 30 + 10}%`,
                  transform: `rotate(${i * 45}deg)`,
                }}
              >
                🐟
              </span>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sky-500 font-semibold text-sm uppercase tracking-wider">
                {t.tag}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-5">
                {t.title1}
                <br />
                {t.title2}
              </h2>
              <p className="opacity-70 mb-6 max-w-md text-white">{t.desc}</p>
              <Link href="/shop?color=Galaxy">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg shadow-accent/25 transition-colors duration-200 text-sm"
                >
                  {t.cta}
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative hidden md:block"
            >
              <div className="relative w-full aspect-[4/3] max-w-md ml-auto">
                <Image
                  src="/assets/bettafishgold.png"
                  alt="leaf tail gold"
                  fill
                  className="object-contain rounded-3xl"
                  sizes="(max-width: 768px) 0vw, 40vw"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
