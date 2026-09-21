"use client";

import { motion } from "motion/react";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export default function Testimonial() {
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).testimonial;
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t.heading}
          </h2>
          <p className="text-muted text-sm">{t.sub}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <FontAwesomeIcon key={j} icon={faStar} className="w-4 h-4 text-yellow-400" />
                ))}
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed mb-6">
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center text-accent font-bold text-sm">
                  {item.initials}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
