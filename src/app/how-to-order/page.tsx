"use client";

import Link from "next/link";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { useLangStore } from "@/store/lang";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBagShopping,
  faCartShopping,
  faCreditCard,
  faLocationDot,
  faMagnifyingGlass,
  faQrcode,
  faReceipt,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

export default function HowToOrderPage() {
  const lang = useLangStore((state) => state.lang);
  const isEnglish = lang === "en";
  const steps = isEnglish
    ? [
        { icon: faMagnifyingGlass, title: "Choose your betta", description: "Browse the shop, open a fish you like, and check its photos and details." },
        { icon: faCartShopping, title: "Add to cart", description: "Select the quantity and add the item to your cart. Review your items before checkout." },
        { icon: faLocationDot, title: "Enter delivery details", description: "Continue to checkout, sign in with LINE, then enter your name, phone, and complete shipping address." },
        { icon: faReceipt, title: "Confirm your order", description: "Check your items, shipping fee, and total, then confirm to create your order." },
        { icon: faQrcode, title: "Pay with PromptPay Or Bank Transfer", description: "Open your order page and scan its QR code with your banking app. Pay the exact amount shown." },
        { icon: faShieldHalved, title: "Keep the order page", description: "Your payment status is updated on the order page. and Notify you of the status via LINE" },
      ]
    : [
        { icon: faMagnifyingGlass, title: "เลือกปลากัดที่ถูกใจ", description: "เลือกชมสินค้า เปิดดูรูปและรายละเอียดของปลาที่สนใจ" },
        { icon: faCartShopping, title: "เพิ่มสินค้าลงตะกร้า", description: "เลือกจำนวนแล้วกดเพิ่มลงตะกร้า ตรวจสอบรายการก่อนชำระเงิน" },
        { icon: faLocationDot, title: "กรอกข้อมูลจัดส่ง", description: "ไปหน้าชำระเงิน เข้าสู่ระบบด้วย LINE แล้วกรอกชื่อ เบอร์โทร และที่อยู่ให้ครบถ้วน" },
        { icon: faReceipt, title: "ตรวจสอบและยืนยันออเดอร์", description: "เช็ครายการสินค้า ค่าจัดส่ง และยอดรวม ก่อนกดยืนยันคำสั่งซื้อ" },
        { icon: faQrcode, title: "ชำระเงินด้วยพร้อมเพย์ หรือ บัญชีธนาคาร", description: "เปิดหน้ารายละเอียดออเดอร์ แล้วสแกน QR ด้วยแอปธนาคาร ชำระตามยอดที่ระบบแสดง" },
        { icon: faShieldHalved, title: "ติดตามสถานะคำสั่งซื้อ", description: "ระบบจะแสดงสถานะการชำระเงินในหน้าออเดอร์ และจะแจ้งเตือนสถานะผ่าน LINE" },
      ];

  return (
    <>
      <Header />
      <main className="pt-10 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <header className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <FontAwesomeIcon icon={faBagShopping} className="text-2xl" />
            </div>
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              {isEnglish ? "How to Order" : "วิธีการสั่งซื้อ"}
            </h1>
            <p className="mx-auto max-w-2xl text-muted">
              {isEnglish
                ? "Follow these simple steps to choose your betta and complete your order."
                : "สั่งปลากัดและชำระเงินได้ง่าย ๆ ตามขั้นตอนด้านล่าง"}
            </p>
          </header>

          <ol className="relative mx-auto max-w-3xl">
            {steps.map((step, index) => (
              <li key={step.title} className="relative pb-8 pl-16 last:pb-0 sm:pl-20">
                {index < steps.length - 1 && (
                  <span aria-hidden="true" className="absolute bottom-0 left-[23px] top-12 w-0.5 bg-sky-200 sm:left-[31px]" />
                )}
                <span className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-background bg-accent text-white shadow-sm sm:h-16 sm:w-16">
                  <FontAwesomeIcon icon={step.icon} className="text-lg sm:text-xl" />
                </span>
                <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-accent">
                    {isEnglish ? `Step ${index + 1}` : `ขั้นตอนที่ ${index + 1}`}
                  </p>
                  <h2 className="mb-1 font-bold text-foreground">{step.title}</h2>
                  <p className="text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <section  className="relative max-w-3xl mx-auto mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm ">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-green-600">
                <FontAwesomeIcon icon={faCreditCard} className="text-amber-500 text-xl" />
              </div>
              <div>
                <h2 className="mb-2 text-lg font-bold text-foreground">
                  {isEnglish ? "Payment by QR Code" : "ชำระเงินผ่าน QR Code"}
                </h2>
                <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
                  {isEnglish ? (
                    <>
                      <li>The QR code and exact amount appear after you confirm your order.</li>
                      <li>Scan it in your mobile banking app and complete payment.</li>
                      <li>Check the order page for the latest payment status.</li>
                    </>
                  ) : (
                    <>
                      <li>หลังยืนยันออเดอร์ ระบบจะแสดง QR Code และยอดที่ต้องชำระ</li>
                      <li>สแกนผ่านแอปธนาคารบนมือถือและชำระให้ครบตามยอด</li>
                      <li>ตรวจสอบสถานะล่าสุดได้ที่หน้ารายละเอียดออเดอร์</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/shop" className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-dark">
              {isEnglish ? "Browse the shop" : "เลือกชมสินค้า"}
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </Link>
            <Link href="/cart" className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/20 px-6 py-3 font-semibold text-accent transition-colors hover:bg-accent/5">
              <FontAwesomeIcon icon={faCartShopping} />
              {isEnglish ? "View cart" : "ไปที่ตะกร้าสินค้า"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
