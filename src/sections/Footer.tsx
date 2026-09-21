"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFishFins } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
  const lang = useLangStore((s) => s.lang);
  const ft = getT(lang).footer;
  const nav = getT(lang).nav;

  const footerLinks = {
    quickLinks: [
      { label: nav.home, href: "/" },
      { label: nav.shop, href: "/shop" },
      { label: nav.about, href: "/about" },
      { label: nav.blog, href: "/blog" },
      { label: nav.contact, href: "/contact" },
    ],
    fishCare: [
      {
        label: lang === "en" ? "Betta Care Guide" : "คู่มือดูแลปลากัด",
        href: "/blog/how-to-care-for-betta-fish",
      },
      {
        label: lang === "en" ? "Types of Betta" : "สายพันธุ์ปลากัด",
        href: "/blog/types-of-betta-fish",
      },
      {
        label: lang === "en" ? "Feeding Guide" : "คู่มือการให้อาหาร",
        href: "/blog/betta-feeding-guide",
      },
      {
        label: lang === "en" ? "Disease Treatment" : "การรักษาโรค",
        href: "/blog/how-to-treat-ich-white-spot-disease",
      },
      {
        label: lang === "en" ? "Breeding Guide" : "คู่มือการเพาะพันธุ์",
        href: "/blog/breeding-betta-fish-basics",
      },
    ],
  };
  return (
    <footer className="bg-sky-950 text-white pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12"
        >
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faFishFins} className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Aurora<span className="text-accent">Betta</span>
              </span>
            </Link>
            <p className="text-sm text-sky-300 mb-5 leading-relaxed">
              {ft.desc}
            </p>
            <div className="flex items-center gap-3">
              {["Facebook", "Instagram", "LINE"].map((s) => (
                <motion.a
                  key={s}
                  href="#"
                  whileHover={{ scale: 1.15, y: -2 }}
                  className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-sky-300 hover:text-accent hover:bg-accent/20 transition-colors text-xs font-bold"
                  aria-label={s}
                >
                  {s[0]}
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">{ft.quickLinks}</h4>
            <ul className="space-y-2.5">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sky-300 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{ft.fishCare}</h4>
            <ul className="space-y-2.5">
              {footerLinks.fishCare.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sky-300 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{ft.contactUs}</h4>
            <ul className="space-y-3 text-sm text-sky-300">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Aurora Betta Farm, Bangkok, Thailand</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📱</span>
                <span>LINE: @AuroraBettaFarm</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📧</span>
                <span>contact@aurorabettafarm.com</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🕐</span>
                <span>{ft.hours}</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-sky-400">{ft.copyright}</p>
          <div className="flex items-center gap-4 text-xs text-sky-400">
            <Link href="/about" className="hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-accent transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
