"use client";

import { useLangStore } from "@/store/lang";

export function RuleWarrantyFish() {
  const lang = useLangStore((state) => state.lang);
  const isEnglish = lang === "en";
  const title = isEnglish ? "Live Arrival Claim Policy" : "เงื่อนไขการเคลมปลา";
  const rules = isEnglish
    ? [
        <><strong className="font-medium">Send the shop photos or a video of the fish</strong>: Record from the moment you open the box and clearly show the sealed fish bag.</>,
        <><strong className="font-medium">Coverage applies only to fish that die during delivery</strong>; it does not cover loss after the fish has been received.</>,
        <><strong className="font-medium">We will review your claim and contact you within 48 hours.</strong></>,
        <><strong className="font-medium">If the claim is approved</strong>, we will send a replacement fish free of charge.</>,
        <><strong className="font-medium">Claims do not cover damage caused by the customer’s care or handling.</strong></>,
        <><strong className="font-medium">Keep the fish in its original, unopened bag.</strong></>,
        <><strong className="font-medium">Report the issue as soon as the parcel is delivered.</strong></>,
      ]
    : [
        <><strong className="font-medium">ส่งรูปภาพหรือวิดีโอของปลาที่ได้รับมาให้ทางร้าน</strong>: เริ่มถ่ายตั้งแต่เปิดกล่อง และให้เห็นถุงปลาอย่างชัดเจน</>,
        <><strong className="font-medium">รับประกันปลาตายจากการขนส่งเท่านั้น</strong>: ไม่ครอบคลุมกรณีปลาตายหลังได้รับปลาแล้ว</>,
        <><strong className="font-medium">ร้านจะพิจารณาและติดต่อกลับภายใน 48 ชั่วโมง</strong></>,
        <><strong className="font-medium">หากพบว่าปลามีปัญหาจริง</strong> ทางร้านจะจัดส่งปลาใหม่ให้ฟรี</>,
        <><strong className="font-medium">การเคลมไม่ครอบคลุมความเสียหายที่เกิดจากการดูแลหรือการจัดการของลูกค้า</strong></>,
        <><strong className="font-medium">ปลาต้องอยู่ในถุงเดิมและยังไม่เปิดถุง</strong></>,
        <><strong className="font-medium">แจ้งเคลมทันทีหลังได้รับพัสดุ</strong></>,
      ];

  return (
    <div className="mt-2 mx-auto w-full max-w-[540px] rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ul className="list-disc list-inside text-sm text-muted space-y-1">
        {rules.map((rule, index) => <li key={index}>{rule}</li>)}
      </ul>
    </div>
  );
}
