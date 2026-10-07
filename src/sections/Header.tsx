"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import CartSidebar from "@/components/CartSidebar";
import Breadcrumb from "@/components/Breadcrumb";
import { useCartStore } from "@/store/cart";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCartShopping,
  faFishFins,
  faRightToBracket,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [lineProfile, setLineProfile] = useState<{ displayName?: string; pictureUrl?: string } | null>(null);
  const pathname = usePathname();
  const cartItems = useCartStore((s) => s.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { lang, toggle } = useLangStore();
  const t = getT(lang);
  const breadcrumbLabels: Record<string, string> = {
    shop: t.nav.shop,
    blog: t.nav.blog,
    about: t.nav.about,
    contact: t.nav.contact,
    "how-to-order": lang === "en" ? "How to Order" : "วิธีการสั่งซื้อ",
    cart: lang === "en" ? "Cart" : "ตะกร้าสินค้า",
    checkout: lang === "en" ? "Checkout" : "ชำระเงิน",
    profile: t.nav.profile,
    orders: lang === "en" ? "My Orders" : "การซื้อของฉัน",
    tracking: lang === "en" ? "Track Shipment" : "ติดตามพัสดุ",
  };
  const breadcrumbItems = pathname === "/" ? [] : [
    { label: t.nav.home, href: "/" },
    ...pathname.split("/").filter(Boolean).map((segment, index, segments) => ({
      label: breadcrumbLabels[segment] ?? (
        segments[index - 1] === "blog"
          ? (lang === "en" ? "Article" : "บทความ")
          : segments[index - 1] === "shop"
            ? (lang === "en" ? "Product details" : "รายละเอียดสินค้า")
            : segments[index - 1] === "orders"
              ? (lang === "en" ? "Order details" : "รายละเอียดคำสั่งซื้อ")
              : segment
      ),
    })),
  ];

  const navLinks = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.shop, href: "/shop" },
    { label: lang === "en" ? "How to Order" : "วิธีการสั่งซื้อ", href: "/how-to-order" },
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.contact, href: "/contact" },
  ];

  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function logout() {
    await fetch("/api/line/logout", { method: "POST" });
    setLineProfile(null);
    setUserMenuOpen(false);
  }

  useEffect(() => {
    fetch("/api/line/session", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ data?: { authenticated?: boolean; displayName?: string; pictureUrl?: string } }>)
      .then((result) => {
        if (result.data?.authenticated) {
          setLineProfile({ displayName: result.data.displayName, pictureUrl: result.data.pictureUrl });
        }
      })
      .catch(() => setLineProfile(null))
      .finally(() => setSessionChecked(true));
  }, []);

  useEffect(() => {
    const handleFlyComplete = () => {
      setCartBump(true);
      const timer = window.setTimeout(() => setCartBump(false), 500);
      return () => window.clearTimeout(timer);
    };

    window.addEventListener("cart-fly-complete", handleFlyComplete);
    return () =>
      window.removeEventListener("cart-fly-complete", handleFlyComplete);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faFishFins}
                  className="w-5 h-5 text-white"
                />
              </div>
              <span className="text-xl font-bold text-foreground">
                Aurora<span className="text-accent">Betta</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-foreground/70 hover:text-accent transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggle}
                aria-label="Toggle language"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-foreground/15 hover:border-accent hover:text-accent text-sm font-semibold text-foreground/70 transition-colors"
              >
                <span className="text-base leading-none">
                  {lang === "en" ? "🇹🇭" : "🇬🇧"}
                </span>
                <span>{lang === "en" ? "TH" : "EN"}</span>
              </motion.button>

              {sessionChecked && (lineProfile ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((open) => !open)}
                    aria-label={t.nav.profile}
                    title={lineProfile.displayName || t.nav.profile}
                    className="p-2 rounded-xl hover:bg-foreground/5 hover:text-accent transition-colors"
                  >
                    {lineProfile.pictureUrl ? (
                      <span
                        className="block h-7 w-7 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${lineProfile.pictureUrl})` }}
                        aria-label={lineProfile.displayName || "LINE profile"}
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
                        <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                  {userMenuOpen && <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5">
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-accent/10 hover:text-accent">{t.nav.profile}</Link>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-accent/10 hover:text-accent">การซื้อของฉัน</Link>
                    <button type="button" onClick={() => void logout()} className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50">ออกจากระบบ</button>
                  </div>}
                </div>
              ) : (
                <Link
                  href="/api/line/login?returnTo=%2F"
                  className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 sm:px-4"
                >
                  <FontAwesomeIcon icon={faRightToBracket} className="h-4 w-4" />
                  <span>{lang === "en" ? "Log in" : "เข้าสู่ระบบ"}</span>
                </Link>
              ))}

              <button
                onClick={() => setCartOpen(true)}
                id="header-cart-button"
                className={`relative p-2 rounded-xl hover:bg-foreground/5 transition-colors ${
                  cartBump ? "animate-bounce" : ""
                }`}
                aria-label="Cart"
              >
                <FontAwesomeIcon icon={faCartShopping} className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                className="md:hidden pt-2 pb-1 rounded-xl hover:bg-foreground/5 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                <FontAwesomeIcon
                  icon={mobileOpen ? faXmark : faBars}
                  className="w-[22px] h-[22px]"
                />
              </button>
            </div>
          </div>

          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white rounded-lg shadow-sm mt-2"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 p-2.5 text-sm font-medium text-foreground/70 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  toggle();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 p-2.5 text-sm font-medium text-foreground/70 hover:text-accent transition-colors"
              >
                <span>{lang === "en" ? "🇹🇭" : "🇬🇧"}</span>
                <span>{lang === "en" ? "ภาษาไทย" : "English"}</span>
              </button>
            </motion.nav>
          )}
        </div>
      </motion.header>

      {breadcrumbItems.length > 0 && (
        <div className="relative z-30 mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} className="mb-0" />
        </div>
      )}

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
