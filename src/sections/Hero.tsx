"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping, faCircleCheck, faStar } from "@fortawesome/free-solid-svg-icons";

export default function Hero() {
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).hero;
  return (
    <section className="relative pt-24 md:pt-32 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/50 via-cyan-50/30 to-blue-100/50" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{ x: ["-8%", "12%", "-8%"], y: ["-4%", "10%", "-4%"], scale: [1, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/3 -left-1/4 h-[75%] w-[70%] rounded-full bg-cyan-300/25 blur-3xl"
        />
        <motion.div
          animate={{ x: ["10%", "-12%", "10%"], y: ["8%", "-6%", "8%"], scale: [1.1, 0.95, 1.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -right-1/4 h-[65%] w-[65%] rounded-full bg-blue-400/20 blur-3xl"
        />
        <motion.div
          animate={{ x: ["-5%", "8%", "-5%"], y: ["6%", "-8%", "6%"], rotate: [0, 8, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-35%] left-[20%] h-[60%] w-[65%] rounded-full bg-sky-300/20 blur-3xl"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative order-2 md:order-1"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-4 bg-accent/20 rounded-full blur-3xl" />
                <Image
                  src="/assets/bettaHMPKHero.png"
                  alt="Premium Betta Fish from Aurora Betta Farm"
                  fill
                  className="object-contain rounded-3xl relative z-10"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
              className="absolute bottom-8 right-4 md:right-0 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faCircleCheck} className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted">{t.liveArrival}</p>
                <p className="text-sm font-bold text-foreground">
                  {t.guaranteed}
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 md:order-2 text-center md:text-left"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-block bg-accent/15 text-accent-dark font-semibold text-sm px-4 py-1.5 rounded-full mb-6"
            >
              {t.badge}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              {t.title1}
              <br />
              <span className="text-accent relative">
                {t.titleAccent}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 8C30 3 80 2 198 8"
                    stroke="#0ea5e9"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>{" "}
              {t.titleSuffix}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-muted text-base sm:text-lg mb-8 max-w-md mx-auto md:mx-0"
            >
              {t.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
            >
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg shadow-accent/25 transition-colors duration-200 text-sm"
                >
                  {t.shopNow}
                  <FontAwesomeIcon icon={faBasketShopping} className="ml-2 w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/blog">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-foreground/15 text-foreground font-semibold px-8 py-3.5 rounded-2xl hover:border-accent hover:text-accent transition-colors duration-200 text-sm"
                >
                  {t.careGuides}
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-8 mt-10 justify-center md:justify-start"
            >
              {t.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex flex-row items-center gap-1">
                     <p className="text-xl font-bold text-foreground flex items-center justify-center gap-1">
                    {stat.value} 
                    </p>
                    <p>{stat.value === "4.9" && (
                      <FontAwesomeIcon icon={faStar} className="w-2 h-2 text-yellow-400" />
                    )}</p>
                  </div>
                 
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
