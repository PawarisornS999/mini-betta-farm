"use client";

import { motion } from "motion/react";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export default function Testimonial() {
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).testimonial;
  const reviews = t.items;
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scrollbar-hide">
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
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
            <span className="text-yellow-400">★★★★★</span>
            <span>4.9/5</span>
            <span className="text-slate-400">·</span>
            <span>{lang === "th" ? "จาก 997 รีวิว" : "from 997 reviews"}</span>
          </div>
        </motion.div>

        <div className="-mx-4 overflow-hidden px-4 pb-4 sm:mx-0 sm:px-0">
          <motion.div
            className="flex w-max flex-row gap-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 45, ease: "linear", repeat: Infinity }}
          >
          {[...reviews, ...reviews].map((item, i) => (
            <div
              key={`${item.name}-${i}`}
              className="w-[min(84vw,360px)] shrink-0 rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:w-[340px]"
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
            </div>
          ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
