"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminText, useAdminLanguage } from "./LanguageProvider";

export interface SalesPoint {
  key: string;
  label: string;
  total: number;
}

export default function SalesChart({
  dailySales,
  monthlySales,
}: {
  dailySales: SalesPoint[];
  monthlySales: SalesPoint[];
}) {
  const [view, setView] = useState<"daily" | "monthly">("daily");
  const { language } = useAdminLanguage();
  const text = (th: string, en: string) => adminText(language, th, en);
  const points = view === "daily" ? dailySales : monthlySales;
  const total = points.reduce((sum, point) => sum + point.total, 0);
  const data = useMemo(
    () => points.map((point) => ({
      ...point,
      chartLabel: view === "monthly"
        ? new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", {
            month: "short",
            year: "2-digit",
            timeZone: "UTC",
          }).format(new Date(`${point.key}-01T00:00:00Z`))
        : point.label,
    })),
    [language, points, view],
  );

  return (
    <section className="mt-6 rounded-2xl border border-black/6 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h3 className="font-bold">{text("กราฟยอดขาย", "Sales chart")}</h3>
          <p className="text-sm text-[#85857d]">
            {view === "daily"
              ? text("ยอดขายรายวัน · 30 วันล่าสุด", "Daily sales · last 30 days")
              : text("ยอดขายรายเดือน · 12 เดือนล่าสุด", "Monthly sales · last 12 months")}
          </p>
        </div>
        <div className="flex rounded-xl bg-[#f4f2ef] p-1" role="group" aria-label={text("เลือกช่วงเวลาของกราฟ", "Choose chart period")}>
          <button
            type="button"
            onClick={() => setView("daily")}
            aria-pressed={view === "daily"}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${view === "daily" ? "bg-white text-[#252522] shadow-sm" : "text-[#77776f]"}`}
          >
            {text("รายวัน", "Daily")}
          </button>
          <button
            type="button"
            onClick={() => setView("monthly")}
            aria-pressed={view === "monthly"}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${view === "monthly" ? "bg-white text-[#252522] shadow-sm" : "text-[#77776f]"}`}
          >
            {text("รายเดือน", "Monthly")}
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3 rounded-xl bg-[#fbfaf8] px-4 py-3">
        <span className="text-sm text-[#77776f]">{text("ยอดขายในช่วงที่แสดง", "Sales in selected period")}</span>
        <strong className="text-xl text-[#252522]">฿{total.toLocaleString(language === "th" ? "th-TH" : "en-US")}</strong>
      </div>

      <div className="mt-5 h-[300px] w-full" aria-label={text("กราฟแท่งยอดขายที่ยืนยันชำระแล้ว", "Bar chart of confirmed paid sales")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 12, left: 8, bottom: 4 }}>
            <CartesianGrid stroke="#eeeae4" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="chartLabel"
              tick={{ fill: "#85857d", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#e9e7e3" }}
              interval={view === "daily" ? 4 : 0}
              minTickGap={8}
            />
            <YAxis
              width={76}
              tick={{ fill: "#85857d", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `฿${Number(value).toLocaleString(language === "th" ? "th-TH" : "en-US")}`}
            />
            <Tooltip
              cursor={{ fill: "#f7f3ed" }}
              formatter={(value) => [`฿${Number(value ?? 0).toLocaleString(language === "th" ? "th-TH" : "en-US")}`, text("ยอดขาย", "Sales")]}
              labelStyle={{ color: "#252522", fontWeight: 700 }}
              contentStyle={{ borderRadius: 12, border: "1px solid #eeeae4" }}
            />
            <Bar dataKey="total" name={text("ยอดขาย", "Sales")} fill="#d68c30" activeBar={{ fill: "#ac6826" }} radius={[5, 5, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-right text-xs text-[#99998f]">{text("หน่วย: บาท · วันที่อิงเวลาประเทศไทย", "Unit: THB · dates use Bangkok time")}</p>
    </section>
  );
}
