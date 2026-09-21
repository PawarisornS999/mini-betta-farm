"use client";

import { motion } from "motion/react";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";

export default function Newsletter() {
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).newsletter;
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-sky-100 to-cyan-50 rounded-3xl overflow-hidden px-6 py-14 md:py-20">
          <div className="absolute inset-0 opacity-[0.05]">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="absolute text-3xl"
                style={{
                  top: `${Math.floor(i / 4) * 30 + 5}%`,
                  left: `${(i % 4) * 25 + 2}%`,
                  transform: `rotate(${i * 30}deg)`,
                }}
              >
                🐟
              </span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto text-center relative z-10"
          >
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">
              {t.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              {t.heading} <span className="text-accent">{t.headingAccent}</span>{" "}
              {t.headingSuffix}
            </h2>
            <p className="text-muted text-sm sm:text-base mb-8">{t.desc}</p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder={t.placeholder}
                className="flex-1 px-5 py-3.5 rounded-2xl bg-white border border-transparent focus:border-accent focus:outline-none text-sm text-foreground placeholder:text-muted shadow-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-accent hover:bg-accent-dark text-white font-semibold px-7 py-3.5 rounded-2xl shadow-lg shadow-accent/25 transition-colors duration-200 text-sm whitespace-nowrap"
              >
                {t.subscribe}
              </motion.button>
            </motion.form>

            <p className="text-xs text-muted mt-4">{t.noSpam}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
