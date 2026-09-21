"use client";

import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { useLangStore } from "@/store/lang";
import { getT } from "@/lib/i18n";

export default function ContactPage() {
  const lang = useLangStore((s) => s.lang);
  const t = getT(lang).contact;
  const lineId = process.env.NEXT_PUBLIC_LINE_OA_ID || "@097zxssv";
  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t.title}
            </h1>
            <p className="text-muted">{t.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                {lang === "en" ? "Send a Message" : "ส่งข้อความ"}
              </h2>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    {t.name}
                  </label>
                  <input
                    type="text"
                    placeholder={t.namePlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    {t.message}
                  </label>
                  <textarea
                    placeholder={t.messagePlaceholder}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:outline-none text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent-dark transition-colors"
                >
                  {t.send}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  {t.infoTitle}
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      icon: "📱",
                      label: t.lineLabel,
                      value: lineId || "รอตั้งค่า LINE OA",
                      desc:
                        lang === "en"
                          ? "Fastest way to reach us"
                          : "วิธีที่เร็วที่สุด",
                    },
                    {
                      icon: "📧",
                      label: t.emailLabel,
                      value: t.emailValue,
                      desc:
                        lang === "en"
                          ? "We reply within 24 hours"
                          : "ตอบกลับภายใน 24 ชั่วโมง",
                    },
                    {
                      icon: "📍",
                      label: t.addressLabel,
                      value: t.addressValue,
                      desc:
                        lang === "en"
                          ? "Farm visits by appointment"
                          : "นัดหมายล่วงหน้า",
                    },
                    {
                      icon: "🕐",
                      label: t.hoursLabel,
                      value: t.hoursValue,
                      desc:
                        lang === "en" ? "Sunday: Closed" : "วันอาทิตย์: ปิด",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {item.label}
                        </p>
                        <p className="text-accent text-sm font-medium">
                          {item.value}
                        </p>
                        <p className="text-xs text-muted">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">
                  💬 {lang === "en" ? "Order via LINE" : "สั่งซื้อผ่าน LINE"}
                </h3>
                <p className="text-sm text-muted mb-4">
                  {lang === "en"
                    ? "The fastest way to order is through our LINE Official Account. Add us and start chatting!"
                    : "วิธีที่เร็วที่สุดในการสั่งซื้อคือผ่าน LINE Official Account ของเรา"}
                </p>
                {lineId && <a
                  href={`https://line.me/R/ti/p/${encodeURIComponent(lineId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-green-600 transition-colors"
                >
                  {lang === "en" ? "Add LINE Friend" : "เพิ่มเพื่อน LINE"}
                </a>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
